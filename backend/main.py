from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import csv
from fastapi import HTTPException
from pydantic import BaseModel
import os

from backend.clean_ocr import clean_ocr_results
from backend.florence2_ocr import enhanced_text_extraction
from backend.Qwen2_VL_Video_VQA import video_qa
from backend.Florence2_Phrase_Grounding import object_in_video
from backend.Temporal_Localization import detect_objects_in_video

app = FastAPI()

# Set static files directory to the "out/static" folder
static_dir = "/Users/lukas/Documents/video-processing-app/out/static"
os.makedirs(static_dir, exist_ok=True)

# Serve static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://192.168.178.60:3000"],  # Allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Video Processing API. Use the available endpoints to process videos."}

@app.get("/download/{file_path:path}")
async def download_file(file_path: str):
    absolute_path = os.path.join(static_dir, file_path)
    if not os.path.exists(absolute_path):
        return {"error": "File not found."}
    return FileResponse(
        absolute_path,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={os.path.basename(file_path)}"}
    )

# Feedback directory and file setup
FEEDBACK_DIR = os.path.join(static_dir, "feedback")
FEEDBACK_FILE = os.path.join(FEEDBACK_DIR, "feedback.csv")
os.makedirs(FEEDBACK_DIR, exist_ok=True)

class Feedback(BaseModel):
    feedback: str
    email: str
    name: str

@app.post("/submit_feedback")
async def submit_feedback(feedback: Feedback):
    try:
        is_new_file = not os.path.exists(FEEDBACK_FILE)
        with open(FEEDBACK_FILE, mode="a", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            if is_new_file:
                writer.writerow(["Feedback", "Email", "Name"])
            writer.writerow([feedback.feedback, feedback.email, feedback.name])
        return {"message": "Feedback submitted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")

@app.post("/process_video")
async def process_video(
    task: str = Form(...),
    video: UploadFile = File(...),
    prompt: str = Form(None)
):
    task_dir = os.path.join(static_dir, task.lower())
    os.makedirs(task_dir, exist_ok=True)

    # Save uploaded video
    temp_video_path = os.path.join(task_dir, video.filename)
    with open(temp_video_path, "wb") as temp_file:
        temp_file.write(await video.read())

    try:
        if task == "OCR":
            result = enhanced_text_extraction(temp_video_path, output_dir=task_dir)
            output_video_path = result.get("output_video_path")
            extracted_texts = clean_ocr_results(result.get("extracted_texts"))
            if output_video_path and os.path.exists(output_video_path):
                relative_path = f"/static/ocr/{os.path.basename(output_video_path)}"
                return {"output_video_path": relative_path, "extracted_texts": extracted_texts}
            else:
                return {"error": "Output video not found."}

        elif task == "Visual Question Answering":
            # Define task-specific directory
            task_dir = os.path.join(static_dir, task.lower())
            os.makedirs(task_dir, exist_ok=True)

            # Call the video_qa function to get the answer
            answer = video_qa(prompt, temp_video_path)

            # No output video generated, so we only return the text answer
            relative_path = f"/static/{task.lower()}/{os.path.basename(temp_video_path)}"
            print("Relative Path:", relative_path)

            return {
                "output_video_path": relative_path,  # Placeholder path, frontend might not display video
                "extracted_texts": answer
            }

        elif task == "Text-To-Object Detection":
            object_name = prompt
            result = object_in_video(temp_video_path, object_name)
            output_video_path = result.get("output_video_path")
            if output_video_path and os.path.exists(output_video_path):
                new_output_path = os.path.join(task_dir, os.path.basename(output_video_path))
                os.rename(output_video_path, new_output_path)
                os.remove(temp_video_path)
                relative_path = f"/static/{task.lower()}/{os.path.basename(new_output_path)}"
                print(relative_path)
                text_summary = (
                    f"Object detected in {result['frames_with_object']} frames.\n"
                    f"Total visible time: {result['total_visible_time']:.2f} seconds.\n"
                    f"Intervals: {', '.join(result['intervals'])}"
                )
                return {"output_video_path": relative_path, "extracted_texts": text_summary}
            else:
                return {"error": "Object not detected."}

        elif task == "Temporal-Localization":
            result = detect_objects_in_video(temp_video_path, prompt)
            output_video_path = result.get("output_video_path")
            if output_video_path and os.path.exists(output_video_path):
                new_output_video_path = os.path.join(task_dir, os.path.basename(output_video_path))
                os.rename(output_video_path, new_output_video_path)
                os.remove(temp_video_path)
                relative_path = f"/static/{task.lower().replace(' ', '_')}/{os.path.basename(new_output_video_path)}"
                print(relative_path)
                return {"output_video_path": relative_path, "extracted_texts": result.get("timestamps")}
            else:
                return {"error": "No object detected in the video."}

        else:
            return {"error": "Unsupported task."}
    except Exception as e:
        return {"error": str(e)}
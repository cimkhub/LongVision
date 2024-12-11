import os
import numpy as np
from vision_agent.tools import *
from typing import *
from pillow_heif import register_heif_opener
register_heif_opener()
import vision_agent as va
from vision_agent.tools import register_tool
import re

def enhanced_text_extraction(video_path, output_dir=None):
    try:
        # Extract frames and timestamps
        frames_with_timestamps = extract_frames_and_timestamps(video_path)
        frames = [f["frame"] for f in frames_with_timestamps]
        
        # Initialize lists
        ocr_results = []
        highlighted_frames = []
        
        # Process each frame
        for frame in frames:
            # Perform OCR
            detections = florence2_ocr(frame)
            
            # Filter detections (confidence > 0.5 and contains alphanumeric characters)
            filtered_detections = [
                d for d in detections 
                if d['score'] > 0.5 and re.search(r'[a-zA-Z0-9]', d['label'])
            ]
            
            # Add filtered results to OCR results
            ocr_results.extend(filtered_detections)
            
            # Create highlighted frame
            highlighted_frame = overlay_bounding_boxes(frame, filtered_detections)
            highlighted_frames.append(highlighted_frame)
        
        # Dynamically generate the output video name
        input_filename = os.path.basename(video_path)  # Get the input file name
        base_name, _ = os.path.splitext(input_filename)  # Remove file extension
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)  # Ensure the directory exists
            output_video_path = os.path.join(output_dir, f"{base_name}_with_ocr.mp4")
        else:
            output_video_path = f"{base_name}_with_ocr.mp4"

        save_video(highlighted_frames, output_video_path)
        
        # Extract just the text from ocr_results
        extracted_texts = [d['label'] for d in ocr_results]

        return {
            "output_video_path": output_video_path,
            "extracted_texts": extracted_texts,
            "ocr_text_count": len(ocr_results)
        }
    except Exception as e:
        print(f"Error in enhanced_text_extraction: {e}")
        raise
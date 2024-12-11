import os
import numpy as np
from vision_agent.tools import *
from typing import *
from pillow_heif import register_heif_opener
register_heif_opener()
import vision_agent as va
from vision_agent.tools import register_tool
from vision_agent.tools import extract_frames_and_timestamps, owl_v2_video


def object_in_video(video_path: str, object_name: str) -> Dict[str, Any]:
    # Extract frames and timestamps at 1 FPS
    frames_and_timestamps = extract_frames_and_timestamps(video_path, fps=1)
    frames = [item["frame"] for item in frames_and_timestamps]
    timestamps = [item["timestamp"] for item in frames_and_timestamps]

    # Detect the object (e.g., bag)
    detections = owl_v2_video(object_name, frames, box_threshold=0.3)

    # Identify sections of the video where the object appears
    object_sections = []
    current_section = None
    frame_count_with_object = 0  # To count the number of frames with object detection

    for i, frame_detections in enumerate(detections):
        if any(detection['label'] == object_name for detection in frame_detections):
            frame_count_with_object += 1  # Increment for every frame with the object
            if current_section is None:
                current_section = {"start_time": timestamps[i]}
        else:
            if current_section is not None:
                current_section["end_time"] = timestamps[i - 1]
                object_sections.append(current_section)
                current_section = None

    # Handle case where the object is detected in the last frame
    if current_section is not None:
        current_section["end_time"] = timestamps[-1]
        object_sections.append(current_section)

    # Calculate total time the object is visible
    total_time_visible = sum(
        section["end_time"] - section["start_time"] for section in object_sections
    )

    # Format intervals for easier readability
    formatted_intervals = [
        f"{section['start_time']:.2f}-{section['end_time']:.2f}"
        for section in object_sections
    ]

    # Overlay bounding boxes on the frames
    frames_with_boxes = []
    for frame, frame_detections in zip(frames, detections):
        # Filter for object detections only
        object_detection = [d for d in frame_detections if d['label'] == object_name]
        
        # Overlay bounding boxes for object detections on this frame
        frame_with_boxes = overlay_bounding_boxes(frame, object_detection)

        # Ensure it's a numpy array
        if not isinstance(frame_with_boxes, np.ndarray):
            frame_with_boxes = np.array(frame_with_boxes)

        frames_with_boxes.append(frame_with_boxes)

    # Save the new video with a custom FPS (e.g., 30 FPS)
    output_video_path = save_video(frames_with_boxes, "output_video_with_object.mp4", fps=5)

    # Return the required details
    return {
        "output_video_path": output_video_path,
        "frames_with_object": frame_count_with_object,
        "total_visible_time": total_time_visible,
        "intervals": formatted_intervals
    }
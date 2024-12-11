import os
import numpy as np
from vision_agent.tools import *
from typing import *
from pillow_heif import register_heif_opener

register_heif_opener()
import vision_agent as va
from vision_agent.tools import extract_frames_and_timestamps, owl_v2_video, save_video


def detect_objects_in_video(video_path: str, object_name: str) -> Dict[str, str]:
    """
    Detects specified objects in a video, saves a video with detected objects,
    and identifies intervals where the object is visible.

    Args:
        video_path (str): Path to the input video.
        object_name (str): Object to detect (e.g., 'bag').

    Returns:
        Dict[str, str]: Dictionary with paths to the output video and interval information.
    """
    # Extract frames and timestamps from the video
    frames_and_timestamps = extract_frames_and_timestamps(video_path, fps=1)
    frames = [item["frame"] for item in frames_and_timestamps]
    timestamps = [item["timestamp"] for item in frames_and_timestamps]

    # Detect the specified object in all frames
    object_detections = owl_v2_video(object_name, frames, box_threshold=0.3)

    # Identify intervals where the object is detected
    intervals = []
    object_frames = []
    current_interval = None

    for i, frame_detections in enumerate(object_detections):
        is_object_detected = any(detection['label'] == object_name for detection in frame_detections)
        if is_object_detected:
            object_frames.append(frames[i])
            if current_interval is None:
                current_interval = {"start": timestamps[i]}
        else:
            if current_interval is not None:
                current_interval["end"] = timestamps[i - 1]
                intervals.append(current_interval)
                current_interval = None

    # Handle the case where the object is detected in the last frame
    if current_interval is not None:
        current_interval["end"] = timestamps[-1]
        intervals.append(current_interval)

    # Format intervals for text output
    interval_text = "\n".join([f"{interval['start']:.2f}-{interval['end']:.2f}" for interval in intervals])

    # Save a short video with frames containing the detected object
    output_video_path = None
    if object_frames:
        output_video_path = f"short_video_with_{object_name}.mp4"
        save_video(object_frames, output_video_path, fps=5)
        print(f"Short video with detected {object_name} saved to: {output_video_path}")
    else:
        print(f"No {object_name} detected. No video created.")

    # Print intervals where the object was seen
    print(f"Intervals where '{object_name}' was detected:")
    for interval in intervals:
        print(f"{interval['start']:.2f}-{interval['end']:.2f} seconds")

    return {
        "output_video_path": output_video_path if output_video_path else "No video created",
        "timestamps": interval_text,
    }
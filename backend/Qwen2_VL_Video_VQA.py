import os
import numpy as np
from vision_agent.tools import *
from typing import *
from pillow_heif import register_heif_opener
register_heif_opener()
import vision_agent as va
from vision_agent.tools import register_tool


from vision_agent.tools import extract_frames_and_timestamps, qwen2_vl_video_vqa
import numpy as np


def video_qa(question: str, video_path: str) -> str:
    """
    Function to answer questions about a specific video using Qwen2 VL Video VQA model.

    Args:
    question (str): The question about the video.

    Returns:
    str: The answer to the question.
    """


    # Extract frames from the video
    frames_with_timestamps = extract_frames_and_timestamps(video_path, fps=1)

    # Extract only the frames (without timestamps) and limit to first 10 frames
    # This is to ensure we don't overload the model with too many frames
    frames = [frame_data["frame"] for frame_data in frames_with_timestamps[:10]]

    # Use qwen2_vl_video_vqa to get the answer
    answer = qwen2_vl_video_vqa(question, frames)
    
    return answer

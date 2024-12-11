import { ChangeEvent, useState } from 'react';
import { Upload } from 'lucide-react';

interface InputAreaProps {
  onVideoUpload: (file: File | null) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  selectedTask: string;
}

export default function InputArea({
  onVideoUpload,
  prompt,
  onPromptChange,
  onSubmit,
  selectedTask,
}: InputAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkVideoDuration = (file: File) => {
    const videoElement = document.createElement("video");
    videoElement.src = URL.createObjectURL(file);

    videoElement.onloadedmetadata = () => {
      const durationInMinutes = videoElement.duration / 60;
      if (durationInMinutes > 5) {
        setErrorMessage("The video exceeds the maximum allowed duration of 5 minutes.");
        setUploadedFile(null);
        onVideoUpload(null);
      } else {
        setErrorMessage(null);
        setUploadedFile(file);
        onVideoUpload(file);
      }
      URL.revokeObjectURL(videoElement.src); // Clean up the object URL
    };
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      checkVideoDuration(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      checkVideoDuration(file);
    }
  };

  // Dynamic placeholder based on selectedTask
  const getPlaceholder = () => {
    switch (selectedTask) {
      case "OCR":
        return "Extract all text from the video, no further input required.";
      case "Visual Question Answering":
        return "Provide a question about the video. Example: What is the person holding?";
      case "Text-To-Object Detection":
        return "Specify the object to detect. Example: bag";
      case "Temporal-Localization":
        return "Specify the object or action to localize. Example: cars";
      default:
        return "Describe your vision task. Examples: Detect objects, count items, identify actions.";
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept="video/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 mb-3 text-gray-400" />
          <h3 className="text-lg font-semibold mb-1">Upload a video</h3>
          <p className="text-sm text-gray-500">
            We accept: MP4, MOV (videos up to 5 minutes)
          </p>
          {uploadedFile && <p className="mt-2 text-blue-600">Selected: {uploadedFile.name}</p>}
          {errorMessage && <p className="mt-2 text-red-600">{errorMessage}</p>}
        </div>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder={getPlaceholder()} // Dynamic placeholder
        disabled={selectedTask === "OCR"} // Disable input if OCR is selected
        className={`w-full p-2 border rounded min-h-[100px] border-gray-300 focus:outline-none focus:ring-2 ${
          selectedTask === "OCR" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:ring-blue-500"
        }`}
      ></textarea>

      <button
        onClick={onSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Process
      </button>
    </div>
  );
}
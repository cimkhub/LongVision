'use client';

import { useState } from 'react';
import { Zap, Brain, Rocket } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import TaskSelector from './components/TaskSelector';
import InputArea from './components/InputArea';
import OutputArea from './components/OutputArea';
import axios from 'axios';


export default function Home() {
  const [selectedTask, setSelectedTask] = useState('OCR');
  const [inputVideo, setInputVideo] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  const [textOutput, setTextOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Reset outputs before starting new processing
    setOutputVideo(null);
    setTextOutput('Processing the video...');

    if (!inputVideo) {
      setTextOutput('Please upload a video first.');
      return;
    }
  
    if (!prompt && selectedTask === 'Visual Question Answering') {
      setTextOutput('Please provide a prompt for Visual Question Answering.');
      return;
    }
  
    setLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('task', selectedTask);
      formData.append('video', inputVideo);
      if (prompt) formData.append('prompt', prompt);
  
      // Debugging output
      console.log("Sending formData:", formData.get('task'), formData.get('video'), formData.get('prompt'));

      // Send the video and task to the backend API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/process_video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Debugging output
      console.log("Received response:", response.data);

      if (response.data.error) {
        setTextOutput(`Error: ${response.data.error}`);
        return;
      }

      const { output_video_path, extracted_texts } = response.data;

      // Update the state with the results
      if (output_video_path) {
        const videoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${output_video_path}`;
        console.log("Video URL for playback:", videoUrl);
        setOutputVideo(videoUrl);
      } else {
        console.error("No output video path received.");
      }

      setTextOutput(
        extracted_texts
          ? extracted_texts
          : 'Processing completed, but no output generated.'
      );
    } catch (error) {
      setTextOutput('An error occurred while processing the video.');
      console.error("Error occurred during video processing:", error);
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-grow">
        <section className="bg-blue-50 py-12">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">LongVision: Unlock the Power of AI Video Analysis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Welcome to LongVision. Our platform lets you seamlessly upload videos and receive detailed AI-driven analyses in real-time.
              This is the future of video understanding—accurate, efficient, and incredibly insightful.
              Ready to see it in action? Try it now and experience the possibilities!
            </p>
          </div>
        </section>

        <section className="container mx-auto p-6">
          <h2 className="text-2xl font-semibold mb-6">LongVision AI Processing</h2>
          <TaskSelector selectedTask={selectedTask} onSelectTask={setSelectedTask} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <InputArea
              onVideoUpload={setInputVideo}
              prompt={prompt}
              onPromptChange={setPrompt}
              onSubmit={handleSubmit}
              selectedTask={selectedTask}
            />

            {/* Combined Video and Text Output Section */}
            <OutputArea
              video={loading ? null : outputVideo} // Show nothing for video while loading
              textOutput={loading ? "Processing the video..." : textOutput} // Show placeholder text while loading
            />
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">Why LongVision?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <Zap className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Boost Efficiency</h3>
                <p className="text-gray-600">
                  Automate the analysis of complex videos, saving hours of manual effort. Our AI technology delivers precision and clarity, letting you focus on what truly matters.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Brain className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gain Deeper Insights</h3>
                <p className="text-gray-600">
                  Uncover patterns and details you might have missed. From extracting textual data to identifying objectives in real-time, LongVision empowers decision-making with actionable insights.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Rocket className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Stay Ahead of the Curve</h3>
                <p className="text-gray-600">
                  Leverage cutting-edge technology to innovate and solve challenges. With LongVision, you access the tools you need to outpace competitors and embrace the future.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-4 text-center">About Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center">
              LongVision was founded with a mission to bridge the gap between technology and meaningful solutions.
              At the helm is Lukas, a passionate entrepreneur with years of experience building innovative companies in Asia and Europe.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
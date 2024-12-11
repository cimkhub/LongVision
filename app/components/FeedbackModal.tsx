import { useState } from 'react';
import axios from 'axios';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const feedbackData = {
        feedback,
        email: email || 'Not provided',
        name: name || 'Not provided',
      };

      // Send feedback to the backend
      await axios.post('http://127.0.0.1:8000/submit_feedback', feedbackData);

      console.log('Feedback submitted:', feedbackData);

      // Clear the input fields
      setFeedback('');
      setEmail('');
      setName('');
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Send Feedback</h2>
          <p className="text-sm text-gray-600">
            We appreciate your feedback to improve LongVision.
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Feedback Textarea */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            rows={4}
          />

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
        </div>
        <div className="flex justify-end p-4 space-x-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
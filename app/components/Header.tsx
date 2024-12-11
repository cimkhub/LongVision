import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function Header() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <header className="bg-blue-600 text-white py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="LongVision Logo" className="h-8 w-auto" />
        </div>
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="px-4 py-2 bg-gray-200 text-blue-600 rounded hover:bg-gray-300"
        >
          Feedback
        </button>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </header>
  );
}
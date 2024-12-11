import { useState } from 'react';
import InfoModal from './InfoModal'; // Import the InfoModal component
import { Info } from 'lucide-react';

interface TaskSelectorProps {
  selectedTask: string;
  onSelectTask: (task: string) => void;
}

const tasks = [
  { id: 'OCR', name: 'Extract Text', info: 'Upload a video, and all visible text in the video will be automatically captured. ur AI not only extracts the text but also highlights it in the video, giving you a clear visual reference. The output includes the video with highlighted text and a neatly formatted text summary.' },
  { id: 'Text-To-Object Detection', name: 'Detect Objects', info: 'Upload a video and enter a single word, like ‘bag’ or ‘person,’ to identify an object. The AI will highlight the object in the video whenever it appears and provide additional details, such as how many frames and seconds the object was visible and the exact time intervals.' },
  { id: 'Temporal-Localization', name: 'Locate Actions', info: 'Upload a video and enter an object, like ‘bag’ or ‘person.’ Our AI will find where the object appears in the video, create a new video with only those parts, and provide a summary with the exact times the object was visible.' },
  { id: 'Visual Question Answering', name: 'Ask About Video', info: 'Upload a video and ask any question about its content, like ‘What is the person doing?’ or ‘What objects are in the room?’ Our AI will analyze the video and provide an answer.' },
];

export default function TaskSelector({ selectedTask, onSelectTask }: TaskSelectorProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  const handleInfoClick = (title: string, description: string) => {
    setModalContent({ title, description });
    setModalOpen(true);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {tasks.map((task) => (
        <div key={task.id} className="relative">
          <button
            className={`px-4 py-2 rounded font-medium transition-all ${
              selectedTask === task.id
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
            onClick={() => onSelectTask(task.id)}
          >
            {task.name}
          </button>
          {/* Info Icon with White Background */}
          <button
            onClick={() => handleInfoClick(task.name, task.info)}
            className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-white p-1 rounded-full shadow hover:bg-gray-100 focus:outline-none"
            aria-label={`More info about ${task.name}`}
          >
            <Info className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      ))}

      {/* Info Modal */}
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        description={modalContent.description}
      />
    </div>
  );
}
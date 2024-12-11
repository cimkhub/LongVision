import { Download } from 'lucide-react';

interface OutputAreaProps {
  video: string | null;
  textOutput: string;
}

export default function OutputArea({ video, textOutput }: OutputAreaProps) {
  return (
    <div className="space-y-6">
      {/* Video Output Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Video Output</h3>
        {video ? (
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <video
              src={video}
              controls
              className="w-full max-h-[500px] object-contain" // Set max height and retain aspect ratio
            />
            <a
              href={`http://127.0.0.1:8000/download/${video.split('/static/')[1]}`} // Full backend download URL
              download // Ensure file downloads instead of opening
              className="absolute top-2 right-2 px-2 py-1 flex items-center text-sm text-white bg-black/50 hover:bg-black/70 rounded"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </div>
        ) : (
          <div className="rounded-lg bg-gray-100 p-8 text-center">
            <p className="text-black text-sm font-mono">Processed output will appear here</p>
          </div>
        )}
      </div>

      {/* Text Output Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Text Output</h3>
        <div className="rounded-lg bg-gray-100 p-4 text-sm">
          <pre className="whitespace-pre-wrap text-black text-sm font-mono text-center">
            {textOutput || 'Results will appear here'}
          </pre>
        </div>
      </div>
    </div>
  );
}
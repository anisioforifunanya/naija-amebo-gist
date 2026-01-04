"use client";

import { useState, useEffect } from 'react';

interface MediaRecorderProps {
  onRecordingComplete: (blob: Blob, type: 'video' | 'audio') => void;
  type: 'video' | 'audio';
  disabled?: boolean;
}

export default function MediaRecorder({ onRecordingComplete, type, disabled = false }: MediaRecorderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading recording component...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {type === 'video' ? '🎥 Live Video Recording' : '🎤 Live Voice Recording'}
        </h3>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          ⚠️ Live recording feature is coming soon! For now, please use the file upload options above.
        </p>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {type === 'video' ? (
          <p>🎥 Record live video with your camera and microphone.</p>
        ) : (
          <p>🎤 Record live audio with your microphone.</p>
        )}
      </div>
    </div>
  );
}
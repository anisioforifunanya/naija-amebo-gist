"use client";

import { useState } from "react";

export default function DebugAdminRequests() {
  const [requests, setRequests] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLoadRequests = () => {
    const data = JSON.parse(localStorage.getItem('adminRequests') || '[]');
    const jsonString = JSON.stringify(data, null, 2);
    setRequests(jsonString);
    console.log('Admin Requests Data:', data);
  };

  const handleCopyToClipboard = () => {
    if (requests) {
      navigator.clipboard.writeText(requests).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Debug Admin Requests</h1>
        
        <div className="space-y-6">
          <div>
            <button
              onClick={handleLoadRequests}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold text-lg"
            >
              Click to View Admin Requests Data
            </button>
            <p className="text-gray-600 mt-2">This will display all admin requests saved in LocalStorage below</p>
          </div>

          {requests && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-green-900 text-lg">Admin Requests Data:</h2>
                <button
                  onClick={handleCopyToClipboard}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <pre className="bg-white p-4 rounded border border-green-300 overflow-auto max-h-96 text-sm text-gray-800 font-mono">
                {requests}
              </pre>
              <p className="text-green-800 text-sm mt-2">
                {requests === '[]' 
                  ? '❌ No requests found in localStorage' 
                  : '✅ Requests loaded successfully - Click "Copy to Clipboard" to copy the data'}
              </p>
            </div>
          )}

          <div>
            <a
              href="/admin"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Back to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

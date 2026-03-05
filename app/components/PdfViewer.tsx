'use client';

import { useState, useEffect } from 'react';

interface PdfViewerProps {
  userEmail: string;
  sessionId?: string;
}

export default function PdfViewer({ userEmail, sessionId }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  const pdfUrl = sessionId
    ? `/api/booklet/pdf?session_id=${sessionId}`
    : '/api/booklet/pdf';

  // Screenshot prevention measures
  useEffect(() => {
    // 1. Blur when window loses focus (catches screen recorders, alt-tab)
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // 2. Try to catch PrintScreen key (Windows only)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 1000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 3. Disable keyboard shortcuts that might be used for screenshots
    const handleKeyUp = (e: KeyboardEvent) => {
      // Detect common screenshot shortcuts
      if (e.key === 'PrintScreen' ||
          (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))) {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 500);
      }
    };

    document.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="pdf-viewer-container">
      {/* PDF Display */}
      <div
        className="pdf-viewer bg-white rounded-xl overflow-hidden relative"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Watermark overlay - top right */}
        <div className="absolute top-3 right-3 pointer-events-none z-20">
          <div className="bg-black/5 backdrop-blur-sm px-3 py-1.5 rounded text-black/40 text-sm font-medium">
            @MrPacemaker · Licensed to: {userEmail}
          </div>
        </div>

        {/* Blur overlay when screenshot detected */}
        {isBlurred && (
          <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 mb-2">Content Protected</div>
              <div className="text-slate-500">@MrPacemaker</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
            <div className="text-slate-500">Loading PDF...</div>
          </div>
        )}

        {error && (
          <div className="aspect-[8.5/11] bg-slate-100 flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full border-0"
          style={{ height: '80vh', minHeight: '600px' }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load PDF. Please refresh.');
          }}
        />
      </div>

      <p className="text-center text-slate-600 text-xs mt-4">
        @MrPacemaker · Licensed to {userEmail} · Sharing prohibited
      </p>

      <div className="text-center mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-slate-700 mb-3">Want more? Get the full 145-page book with 60+ illustrations</p>
        <a
          href="https://www.amazon.com/Basics-Cardiac-Devices-Visual-Pacemakers/dp/B0FDHV3DNF"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-600 transition"
        >
          Get Basics of Cardiac Devices on Amazon
        </a>
      </div>
    </div>
  );
}

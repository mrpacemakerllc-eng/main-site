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

  // Build PDF URL with access parameters
  const buildPdfUrl = () => {
    const params = new URLSearchParams();
    if (sessionId) params.set('session_id', sessionId);
    if (userEmail && userEmail !== 'Licensed User' && userEmail !== 'Test User') {
      params.set('email', userEmail);
    }
    const queryString = params.toString();
    return queryString ? `/api/booklet/pdf?${queryString}` : '/api/booklet/pdf';
  };

  const pdfUrl = buildPdfUrl();

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
      {/* PDF Display - clean white page only */}
      <div
        className="pdf-viewer relative"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Watermark overlay - fixed position over iframe */}
        <div
          className="absolute top-4 right-4 pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white/90 shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 text-sm font-medium">
            @MrPacemaker · {userEmail}
          </div>
        </div>

        {/* Blur overlay when screenshot detected */}
        {isBlurred && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center" style={{ zIndex: 10000 }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 mb-2">Content Protected</div>
              <div className="text-slate-500">@MrPacemaker</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center" style={{ zIndex: 10 }}>
            <div className="text-slate-500">Loading PDF...</div>
          </div>
        )}

        {error && (
          <div className="aspect-[8.5/11] bg-white flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          className="w-full border-0 bg-white"
          style={{ height: '85vh', minHeight: '700px', background: 'white' }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load PDF. Please refresh.');
          }}
        />
      </div>

      <p className="text-center text-slate-500 text-xs mt-4">
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

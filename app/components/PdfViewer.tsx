'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  userEmail: string;
}

export default function PdfViewer({ userEmail }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please refresh the page.');
    setLoading(false);
  }, []);

  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(numPages, p + 1));

  return (
    <div className="pdf-viewer-container">
      {/* PDF Display */}
      <div
        className="pdf-viewer bg-white rounded-xl overflow-hidden select-none relative"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        onCopy={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Watermark overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-black/10 text-xl font-bold whitespace-nowrap"
              style={{ transform: 'rotate(-30deg)' }}
            >
              {userEmail}
            </div>
          </div>
          {/* Additional scattered watermarks */}
          <div className="absolute top-1/4 left-1/4 text-black/5 text-sm font-medium whitespace-nowrap" style={{ transform: 'rotate(-30deg)' }}>
            {userEmail}
          </div>
          <div className="absolute bottom-1/4 right-1/4 text-black/5 text-sm font-medium whitespace-nowrap" style={{ transform: 'rotate(-30deg)' }}>
            {userEmail}
          </div>
        </div>

        {loading && (
          <div className="aspect-[8.5/11] bg-slate-100 flex items-center justify-center">
            <div className="text-slate-500">Loading PDF...</div>
          </div>
        )}

        {error && (
          <div className="aspect-[8.5/11] bg-slate-100 flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        <Document
          file="/api/booklet/pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex justify-center"
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="max-w-full"
            width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 40 : 800)}
          />
        </Document>

        {/* Navigation */}
        <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
          >
            ← Previous
          </button>
          <span className="text-slate-300">
            Page {currentPage} of {numPages || '...'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === numPages}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
          >
            Next →
          </button>
        </div>
      </div>

      <p className="text-center text-slate-600 text-xs mt-4">
        This content is licensed to {userEmail} · Sharing prohibited
      </p>

      <style jsx global>{`
        .react-pdf__Page__canvas {
          max-width: 100% !important;
          height: auto !important;
        }
        .pdf-viewer-container .react-pdf__Document {
          display: flex;
          justify-content: center;
        }
        .pdf-viewer-container .react-pdf__Page {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}

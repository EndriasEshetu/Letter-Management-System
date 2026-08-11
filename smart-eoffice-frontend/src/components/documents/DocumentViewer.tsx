import React, { useMemo, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/common/Button';

/* ─── Constants ──────────────────────────────────────────── */

// Must match installed pdfjs-dist version in package.json
const PDF_WORKER_URL =
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/* ─── Non-PDF Placeholder ───────────────────────────────── */

const NotPdfPlaceholder: React.FC<{ fileName: string; onDownload: () => void }> = ({
  fileName,
  onDownload,
}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-[#F9F8F5] p-12 text-center">
    <div className="w-16 h-16 bg-[#D8D7D1]/60 rounded-2xl flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-[#6B6A64]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-[#292A27] mb-1.5">Preview Unavailable</h3>
    <p className="text-sm text-[#6B6A64] max-w-xs mb-1">
      In-browser preview is available for PDF documents only.
    </p>
    <p className="text-xs text-[#8A8983] mb-6 max-w-xs break-all">{fileName}</p>
    <Button variant="primary" size="sm" onClick={onDownload} aria-label="Download document">
      Download File
    </Button>
  </div>
);

/* ─── PDF Viewer Error Renderer ─────────────────────────── */

const PdfErrorRenderer: React.FC<{ onDownload: () => void }> = ({ onDownload }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-[#F9F8F5] p-8 text-center">
    <ErrorState
      title="Unable to preview this document"
      description="The PDF could not be loaded. It may be unavailable or still processing. You can download it instead."
      retryLabel="Try Again"
      onRetry={() => window.location.reload()}
    />
    <div className="mt-4">
      <Button variant="secondary" size="sm" onClick={onDownload}>
        Download Document
      </Button>
    </div>
  </div>
);

/* ─── PDF Viewer Props ───────────────────────────────────── */

interface DocumentViewerProps {
  documentId: string;
  fileName: string;
  fileType: string;
  onDownload: () => void;
}

/* ─── DocumentViewer ────────────────────────────────────── */

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  fileName,
  fileType,
  onDownload,
}) => {
  const isPdf =
    fileType === 'application/pdf' ||
    fileName.toLowerCase().endsWith('.pdf');

  // Stable plugin instance — must not be recreated on re-render
  const defaultLayoutPluginInstance = useMemo(() => defaultLayoutPlugin(), []);

  const [loadError, setLoadError] = useState(false);

  // Construct authenticated file URL for the PDF viewer
  const fileUrl = `${BASE_URL}/documents/${documentId}/download`;
  const token = localStorage.getItem('sita_auth_token');
  const httpHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  /* ── Non-PDF guard ── */
  if (!isPdf) {
    return <NotPdfPlaceholder fileName={fileName} onDownload={onDownload} />;
  }

  /* ── Error state (set by renderError callback) ── */
  if (loadError) {
    return <PdfErrorRenderer onDownload={onDownload} />;
  }

  return (
    <Worker workerUrl={PDF_WORKER_URL}>
      {/*
        Height must be explicitly set for the PDF viewer to display correctly.
        The outer div is flex-1 and we ensure min-height for smaller viewports.
      */}
      <div
        className="h-full min-h-[500px] overflow-hidden"
        style={{ height: '100%' }}
        aria-label="PDF document viewer"
      >
        <Viewer
          fileUrl={fileUrl}
          httpHeaders={httpHeaders}
          plugins={[defaultLayoutPluginInstance]}
          renderLoader={(percentages: number) => (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner
                size="md"
                label={`Loading PDF… ${Math.round(percentages)}%`}
              />
            </div>
          )}
          renderError={() => {
            // Schedule state update outside of render
            Promise.resolve().then(() => setLoadError(true));
            return <div className="h-64" />;
          }}
        />
      </div>
    </Worker>
  );
};

export default DocumentViewer;

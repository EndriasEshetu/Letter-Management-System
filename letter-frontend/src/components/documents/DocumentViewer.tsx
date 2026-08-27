import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PDF_WORKER_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─── Sub-component: Non-PDF Placeholder ──────────────── */

interface NotPdfPlaceholderProps {
  fileName: string;
  onDownload: () => void;
}

const NotPdfPlaceholder: React.FC<NotPdfPlaceholderProps> = ({
  fileName,
  onDownload,
}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center bg-[#ECEAE3]/40 border-2 border-dashed border-[#D8D7D1] rounded-2xl">
    <div className="p-4 bg-[#526A55]/10 text-[#526A55] rounded-2xl mb-4">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h4 className="text-base font-semibold text-[#292A27] mb-1">
      Inline Preview Not Available
    </h4>
    <p className="text-xs text-[#6B6A64] max-w-sm mb-6">
      <span className="font-medium text-[#292A27]">{fileName}</span> cannot be previewed directly in the browser viewer. Please download the file to inspect its full contents.
    </p>
    <Button variant="primary" size="sm" onClick={onDownload}>
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download File
    </Button>
  </div>
);

/* ─── Sub-component: PDF Load Error Renderer ────────────── */

interface PdfErrorRendererProps {
  onDownload: () => void;
}

const PdfErrorRenderer: React.FC<PdfErrorRendererProps> = ({ onDownload }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center bg-[#8B3232]/5 border border-[#8B3232]/20 rounded-2xl">
    <div className="p-4 bg-[#8B3232]/10 text-[#8B3232] rounded-2xl mb-4">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <h4 className="text-base font-semibold text-[#292A27] mb-1">
      Unable to Render PDF Preview
    </h4>
    <p className="text-xs text-[#6B6A64] max-w-sm mb-6">
      The document file could not be loaded into the inline viewer. Download the file to view it locally.
    </p>
    <Button variant="outline" size="sm" onClick={onDownload}>
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download Document
    </Button>
  </div>
);

/* ─── Main Props ────────────────────────────────────────── */

export interface DocumentViewerProps {
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

  // Custom plugin hook call at top level
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Construct authenticated file URL for the PDF viewer
  const fileUrl = `${BASE_URL}/documents/${documentId}/download`;
  const token = localStorage.getItem('sita_auth_token');
  const httpHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  if (!isPdf) {
    return <NotPdfPlaceholder fileName={fileName} onDownload={onDownload} />;
  }

  return (
    <Worker workerUrl={PDF_WORKER_URL}>
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
          renderError={() => (
            <PdfErrorRenderer onDownload={onDownload} />
          )}
        />
      </div>
    </Worker>
  );
};

export default DocumentViewer;

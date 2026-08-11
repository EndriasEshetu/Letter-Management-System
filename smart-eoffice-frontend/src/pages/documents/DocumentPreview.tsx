import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import documentService from '@/services/documentService';
import { DocumentItem } from '@/types/document';
import { useToast } from '@/components/common/Toast';

import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import DocumentViewer from '@/components/documents/DocumentViewer';
import DocumentInfoPanel from '@/components/documents/DocumentInfoPanel';

/* ─── File Size Helper ──────────────────────────────────── */

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── File Type Icon ────────────────────────────────────── */

const FileTypeIcon: React.FC<{ fileType: string; className?: string }> = ({
  fileType,
  className = 'w-6 h-6',
}) => {
  const isPdf =
    fileType === 'application/pdf';
  const isImage =
    fileType.startsWith('image/');

  if (isPdf) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 13h6M9 17h4"
        />
      </svg>
    );
  }

  if (isImage) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    );
  }

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
};

/* ─── Document Viewer Header ────────────────────────────── */

interface ViewerHeaderProps {
  document: DocumentItem;
  onBack: () => void;
  onDownload: () => void;
  onPrint: () => void;
  isDownloading: boolean;
}

const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  document,
  onBack,
  onDownload,
  onPrint,
  isDownloading,
}) => (
  <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
    {/* Left: Back + File Info */}
    <div className="flex items-center space-x-4 min-w-0">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex-shrink-0 p-2 text-[#292A27] hover:bg-[#D8D7D1]/50 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#526A55]"
        aria-label="Back to document details"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* File icon + name */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 bg-[#526A55]/10 text-[#526A55] rounded-xl flex items-center justify-center flex-shrink-0">
          <FileTypeIcon fileType={document.file_type} className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1
            className="text-sm font-semibold text-[#292A27] truncate max-w-xs sm:max-w-md"
            title={document.title}
          >
            {document.file_name || document.title}
          </h1>
          <p className="text-xs text-[#6B6A64] mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{formatFileSize(document.file_size)}</span>
            <span aria-hidden="true">·</span>
            <span>{document.documentNumber}</span>
            <span aria-hidden="true">·</span>
            <Badge status={document.status} />
          </p>
        </div>
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center space-x-2 flex-shrink-0">
      {/* Print */}
      <button
        type="button"
        onClick={onPrint}
        className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-[#292A27] hover:bg-[#D8D7D1]/50 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#526A55]"
        aria-label="Print document"
        title="Print"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        <span className="hidden sm:inline">Print</span>
      </button>

      {/* Download */}
      <Button
        variant="primary"
        size="sm"
        isLoading={isDownloading}
        onClick={onDownload}
        aria-label="Download document"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download
      </Button>
    </div>
  </div>
);

/* ─── DocumentPreview Page ──────────────────────────────── */

export const DocumentPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  /* ── Fetch document metadata ── */
  const fetchDocument = useCallback(async () => {
    if (!id) {
      setError('Document ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await documentService.getDocumentById(id);
      setDocument(data);
    } catch (err: any) {
      console.error('[DocumentPreview] Failed to load document:', err);
      setError(
        err?.response?.status === 404
          ? 'Document not found. It may have been moved or deleted.'
          : 'Unable to load document details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  /* ── Navigate back ── */
  const handleBack = () => {
    if (id) {
      navigate(`/documents/${id}`);
    } else {
      navigate('/documents');
    }
  };

  /* ── Download ── */
  const handleDownload = async () => {
    if (!id || !document) return;
    setIsDownloading(true);
    try {
      await documentService.downloadDocument(id, document.file_name);
      addToast({
        type: 'success',
        title: 'Download started',
        message: `${document.file_name} is downloading.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Download failed',
        message: 'Unable to download this document. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  /* ── Print (delegated to the PDF viewer toolbar, this is a page-level fallback) ── */
  const handlePrint = () => {
    window.print();
  };

  /* ── Loading State ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <LoadingSpinner size="md" label="Loading document…" />
      </div>
    );
  }

  /* ── Error State ── */
  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <ErrorState
          title={error ? 'Document unavailable' : 'Document not found'}
          description={
            error ||
            'The document you are looking for could not be found.'
          }
          retryLabel="Try Again"
          onRetry={fetchDocument}
        />
      </div>
    );
  }

  /* ── Document Preview Layout ── */
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Header ── */}
      <ViewerHeader
        document={document}
        onBack={handleBack}
        onDownload={handleDownload}
        onPrint={handlePrint}
        isDownloading={isDownloading}
      />

      {/* ── Main Content: PDF viewer + Info panel ── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/*
          PDF Viewer Area
          Must have a defined height for the PDF viewer to render properly.
          On desktop: flex-1 (takes remaining width)
          On mobile: stacks above the info panel
        */}
        <div
          className="flex-1 bg-[#F9F8F5] border border-[#D8D7D1] rounded-2xl overflow-hidden"
          style={{ minHeight: '560px' }}
        >
          <DocumentViewer
            documentId={document.id}
            fileName={document.file_name}
            fileType={document.file_type}
            onDownload={handleDownload}
          />
        </div>

        {/* Info Panel */}
        <DocumentInfoPanel document={document} />
      </div>
    </div>
  );
};

export default DocumentPreview;

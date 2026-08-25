import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import letterService from '@/services/letterService';
import { LetterItem } from '@/types/letter';
import { useToast } from '@/components/common/Toast';

import Button from '@/components/common/Button';
import Badge, { LetterStatus } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import DocumentViewer from '@/components/documents/DocumentViewer';
import LetterInfoPanel from '@/components/letters/LetterInfoPanel';

/* ─── Viewer Header ──────────────────────────────────────── */

interface ViewerHeaderProps {
  letter: LetterItem;
  onBack: () => void;
  onDownload: () => void;
  onPrint: () => void;
  isDownloading: boolean;
}

const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  letter,
  onBack,
  onDownload,
  onPrint,
  isDownloading,
}) => (
  <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
    {/* Left: Back + Letter info */}
    <div className="flex items-center space-x-4 min-w-0">
      <button
        type="button"
        onClick={onBack}
        className="flex-shrink-0 p-2 text-[#292A27] hover:bg-[#D8D7D1]/50 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#526A55]"
        aria-label="Back to letter details"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 bg-[#526A55]/10 text-[#526A55] rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1
            className="text-sm font-semibold text-[#292A27] truncate max-w-xs sm:max-w-md"
            title={letter.subject}
          >
            {letter.subject}
          </h1>
          <p className="text-xs text-[#6B6A64] mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="font-mono">{letter.referenceNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{(letter.file_size / (1024 * 1024)).toFixed(1)} MB</span>
            <span aria-hidden="true">·</span>
            <Badge status={letter.status as LetterStatus} />
          </p>
        </div>
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center space-x-2 flex-shrink-0">
      <button
        type="button"
        onClick={onPrint}
        className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-[#292A27] hover:bg-[#D8D7D1]/50 rounded-xl transition-colors focus:outline-none"
        aria-label="Print letter"
        title="Print"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span className="hidden sm:inline">Print</span>
      </button>

      <Button
        variant="primary"
        size="sm"
        isLoading={isDownloading}
        onClick={onDownload}
        aria-label="Download attachment"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </Button>
    </div>
  </div>
);

/* ─── Letter Preview Page ────────────────────────────────── */

export const LetterPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [letter, setLetter] = useState<LetterItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchLetter = useCallback(async () => {
    if (!id) {
      setError('Letter ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await letterService.getLetterById(id);
      setLetter(data);
    } catch (err: any) {
      setError(
        err?.response?.status === 404
          ? 'Letter not found. It may have been moved or deleted.'
          : 'Unable to load letter. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLetter();
  }, [fetchLetter]);

  const handleBack = () => {
    navigate(id ? `/letters/${id}` : '/letters');
  };

  const handleDownload = async () => {
    if (!id || !letter) return;
    setIsDownloading(true);
    try {
      await letterService.downloadAttachment(id, letter.file_name);
      addToast({ type: 'success', title: 'Download started', message: `${letter.file_name} is downloading.` });
    } catch {
      addToast({ type: 'error', title: 'Download failed', message: 'Unable to download this attachment. Please try again.' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <LoadingSpinner size="md" label="Loading letter attachment…" />
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <ErrorState
          title={error ? 'Letter unavailable' : 'Letter not found'}
          description={error || 'The letter you are looking for could not be found.'}
          retryLabel="Try Again"
          onRetry={fetchLetter}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <ViewerHeader
        letter={letter}
        onBack={handleBack}
        onDownload={handleDownload}
        onPrint={handlePrint}
        isDownloading={isDownloading}
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* PDF Viewer */}
        <div
          className="flex-1 bg-[#F9F8F5] border border-[#D8D7D1] rounded-2xl overflow-hidden"
          style={{ minHeight: '560px' }}
        >
          <DocumentViewer
            documentId={letter.id}
            fileName={letter.file_name}
            fileType={letter.file_type}
            onDownload={handleDownload}
          />
        </div>

        {/* Letter Info Side Panel */}
        <LetterInfoPanel letter={letter} />
      </div>
    </div>
  );
};

export default LetterPreview;

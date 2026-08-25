import React, { useState, useRef } from 'react';
import letterService from '@/services/letterService';
import { useToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';

interface UploadAttachmentModalProps {
  open: boolean;
  letterId: string;
  letterSubject: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadAttachmentModal: React.FC<UploadAttachmentModalProps> = ({
  open,
  letterId,
  letterSubject,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (isUploading) return;
    setFile(null);
    setDescription('');
    setError('');
    onClose();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to attach.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (description.trim()) formData.append('description', description.trim());

    try {
      await letterService.uploadAttachment(letterId, formData);
      addToast({
        type: 'success',
        title: 'Attachment Uploaded',
        message: `"${file.name}" has been attached to this letter.`,
      });
      onSuccess();
      handleClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Could not upload attachment. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292A27]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-attach-title"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-[#F5F3ED] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#D8D7D1]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D8D7D1] bg-[#ECEAE3] flex items-center justify-between">
          <div>
            <h2 id="upload-attach-title" className="text-base font-bold text-[#292A27]">
              Upload Attachment
            </h2>
            <p className="text-xs text-[#6B6A64] mt-0.5 truncate max-w-xs" title={letterSubject}>
              {letterSubject}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 text-[#6B6A64] hover:text-[#292A27] hover:bg-[#D8D7D1]/50 rounded-xl transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpload} className="px-6 py-5 space-y-5">
          {/* File Drop Zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1.5">
              Attachment File <span className="text-[#8B3232]">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                file
                  ? 'border-[#526A55]/50 bg-[#526A55]/05'
                  : error
                  ? 'border-[#8B3232]/50 bg-[#8B3232]/03'
                  : 'border-[#D8D7D1] hover:border-[#526A55]/40'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files[0];
                if (dropped) { setFile(dropped); setError(''); }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(''); }
                }}
              />
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-9 h-9 bg-[#526A55]/10 text-[#526A55] rounded-xl flex items-center justify-center font-bold text-xs">
                    {file.name.split('.').pop()?.toUpperCase().slice(0, 3) || 'DOC'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#292A27] truncate max-w-[220px]">{file.name}</p>
                    <p className="text-xs text-[#6B6A64]">{(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change</p>
                  </div>
                </div>
              ) : (
                <div>
                  <svg className="w-8 h-8 text-[#D8D7D1] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm font-medium text-[#6B6A64]">
                    Drop file here or <span className="text-[#526A55] font-bold">browse</span>
                  </p>
                  <p className="text-xs text-[#8A8983] mt-1">PDF, DOCX, XLSX, PNG, JPG</p>
                </div>
              )}
            </div>
            {error && <p className="text-xs text-[#8B3232] mt-1">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="attachment-desc" className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="attachment-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this attachment..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#F9F8F5] border border-[#D8D7D1] rounded-xl text-[#292A27] placeholder-[#B0AFA9] focus:outline-none focus:ring-2 focus:ring-[#526A55] focus:border-transparent resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D8D7D1] bg-[#ECEAE3] flex items-center justify-end space-x-3">
          <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload as any} isLoading={isUploading}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Attachment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadAttachmentModal;

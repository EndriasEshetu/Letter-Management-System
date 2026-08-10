import React, { useState, useRef } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import { useToast } from '@/components/common/Toast';
import documentService from '@/services/documentService';

interface UploadVersionModalProps {
  open: boolean;
  documentId: string;
  documentTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  open,
  documentId,
  documentTitle,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    setValidationError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(`Unsupported file type (${ext}). Allowed: PDF, DOCX, PNG, JPG, JPEG.`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(`File size exceeds 15 MB limit (Current: ${sizeMb} MB).`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setValidationError(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select a file for the new version.');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress for dev fallback
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) { clearInterval(progressInterval); return prev; }
          return prev + 10;
        });
      }, 100);

      await documentService.uploadVersion(documentId, formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      addToast({
        type: 'success',
        title: 'New Version Uploaded',
        message: `A new version of "${documentTitle}" has been uploaded.`,
      });

      resetForm();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to upload new version. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Modal
      open={open}
      onClose={() => { if (!isUploading) { resetForm(); onClose(); } }}
      title="Upload New Version"
      description={`Upload a replacement file for "${documentTitle}". The system will increment the version number automatically.`}
      size="md"
      closeOnOverlay={!isUploading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <Alert type="error" onClose={() => setValidationError(null)}>
            {validationError}
          </Alert>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-[#526A55] bg-[#526A55]/10'
              : selectedFile
              ? 'border-[#4A6B4E] bg-[#4A6B4E]/05'
              : 'border-[#D8D7D1] bg-[#F9F8F6] hover:bg-[#ECEAE3]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 bg-[#526A55]/10 text-[#526A55] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#292A27]">{selectedFile.name}</p>
              <p className="text-xs text-[#6B6A64]">
                {formatFileSize(selectedFile.size)} • Click to change file
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-[#292A27]">
                Drag & drop new version here, or <span className="text-[#526A55] underline">browse</span>
              </p>
              <p className="text-xs text-[#8A8983] mt-1">
                Supports PDF, DOCX, PNG, JPG up to 15 MB
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-1.5 py-2">
            <div className="flex justify-between text-xs font-semibold text-[#292A27]">
              <span>Uploading version...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#D8D7D1] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#526A55] h-full rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 flex justify-end space-x-3 border-t border-[#D8D7D1]/50">
          <Button type="button" variant="secondary" onClick={() => { resetForm(); onClose(); }} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isUploading} disabled={!selectedFile || isUploading}>
            {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Version'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadVersionModal;

import React, { useState, useRef } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Select, { SelectOption } from '@/components/common/Select';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import { useToast } from '@/components/common/Toast';
import documentService from '@/services/documentService';

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'Finance / Reports', label: 'Finance / Reports' },
  { value: 'Legal / Archives', label: 'Legal / Archives' },
  { value: 'Facilities / Planning', label: 'Facilities / Planning' },
  { value: 'HR / Policies', label: 'HR / Policies' },
  { value: 'ICT / Audit', label: 'ICT / Audit' },
  { value: 'General / Documentation', label: 'General / Documentation' },
];

const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: 'Finance & Planning', label: 'Finance & Planning' },
  { value: 'Legal Services', label: 'Legal Services' },
  { value: 'Public Works', label: 'Public Works' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'ICT Governance', label: 'ICT Governance' },
  { value: 'City Clerk', label: 'City Clerk' },
];

const SECURITY_OPTIONS: SelectOption[] = [
  { value: 'PUBLIC', label: 'Public (Open)' },
  { value: 'INTERNAL', label: 'Internal (Agency Only)' },
  { value: 'CONFIDENTIAL', label: 'Confidential' },
  { value: 'RESTRICTED', label: 'Restricted (High Security)' },
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General / Documentation');
  const [department, setDepartment] = useState('Public Works');
  const [securityLevel, setSecurityLevel] = useState('INTERNAL');
  const [tags, setTags] = useState('');
  
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
      if (!title) {
        // Default title to file name without extension
        const defaultTitle = file.name.replace(/\.[^/.]+$/, '');
        setTitle(defaultTitle);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('General / Documentation');
    setDepartment('Public Works');
    setSecurityLevel('INTERNAL');
    setTags('');
    setSelectedFile(null);
    setValidationError(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select a document file to upload.');
      return;
    }

    if (!title.trim()) {
      setValidationError('Document title is required.');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('department_name', department);
      formData.append('securityLevel', securityLevel);
      formData.append('tags', tags);

      await documentService.createDocument(formData, (progress) => {
        setUploadProgress(progress);
      });

      addToast({
        type: 'success',
        title: 'Document Uploaded',
        message: `"${title}" has been uploaded successfully.`,
      });

      resetForm();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to upload document. Please try again.');
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
      onClose={() => {
        if (!isUploading) {
          resetForm();
          onClose();
        }
      }}
      title="Upload New Document"
      description="Upload official agency records, policies, or report drafts into the SITA repository."
      size="lg"
      closeOnOverlay={!isUploading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <Alert type="error" onClose={() => setValidationError(null)}>
            {validationError}
          </Alert>
        )}

        {/* Drag and Drop File Target Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
                Drag & drop document here, or <span className="text-[#526A55] underline">browse</span>
              </p>
              <p className="text-xs text-[#8A8983] mt-1">
                Supports PDF, DOCX, PNG, JPG up to 15 MB
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 py-2">
            <div className="flex justify-between text-xs font-semibold text-[#292A27]">
              <span>Uploading document...</span>
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

        {/* Metadata Inputs */}
        <Input
          label="Document Title"
          placeholder="e.g. Q1_Financial_Report_DRAFT.pdf"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isUploading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(val) => setCategory(val)}
            disabled={isUploading}
          />
          <Select
            label="Department"
            options={DEPARTMENT_OPTIONS}
            value={department}
            onChange={(val) => setDepartment(val)}
            disabled={isUploading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Security Level"
            options={SECURITY_OPTIONS}
            value={securityLevel}
            onChange={(val) => setSecurityLevel(val)}
            disabled={isUploading}
          />
          <Input
            label="Tags (Optional)"
            placeholder="e.g. finance, draft, q1"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <Textarea
          label="Description (Optional)"
          placeholder="Enter a brief summary of the document purpose or contents..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
        />

        {/* Footer Actions */}
        <div className="pt-3 flex justify-end space-x-3 border-t border-[#D8D7D1]/50">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadDocumentModal;

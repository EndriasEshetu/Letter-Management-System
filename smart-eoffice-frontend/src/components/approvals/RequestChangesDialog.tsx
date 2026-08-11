import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Textarea from '@/components/common/Textarea';
import { ApprovalRequest } from '@/types/approval';

interface RequestChangesDialogProps {
  open: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const RequestChangesDialog: React.FC<RequestChangesDialogProps> = ({
  open,
  request,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please describe the required changes.');
      return;
    }
    setError('');
    await onConfirm(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    if (isLoading) return;
    setReason('');
    setError('');
    onClose();
  };

  if (!request) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Request Changes"
      description={`Requesting changes for "${request.document.file_name || request.document.title}". Describe the revisions needed.`}
      size="md"
      closeOnOverlay={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Submit Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Requested Revisions"
          placeholder="Detail the specific modifications required before approval..."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
          rows={4}
          showCharCount
          maxLength={500}
        />
      </form>
    </Modal>
  );
};

export default RequestChangesDialog;

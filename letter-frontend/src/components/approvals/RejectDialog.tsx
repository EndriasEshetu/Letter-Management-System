import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Textarea from '@/components/common/Textarea';
import { ApprovalRequest } from '@/types/approval';

interface RejectDialogProps {
  open: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
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
      setError('Please provide a reason for rejection.');
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

  const doc = request?.letter || {};
  const subject = doc.subject || doc.title || 'Selected Letter';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Reject Letter"
      description={`Rejecting "${subject}". Please specify the reason.`}
      size="md"
      closeOnOverlay={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Reject Letter
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Rejection Reason"
          placeholder="State clearly why this letter is being rejected..."
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

export default RejectDialog;

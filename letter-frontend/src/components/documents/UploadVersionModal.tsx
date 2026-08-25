import React from 'react';
import UploadAttachmentModal from '@/components/letters/UploadAttachmentModal';

interface UploadVersionModalProps {
  open: boolean;
  documentId: string;
  documentTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  open,
  documentId,
  documentTitle,
  onClose,
  onSuccess,
}) => {
  return (
    <UploadAttachmentModal
      open={open}
      letterId={documentId}
      letterSubject={documentTitle}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default UploadVersionModal;

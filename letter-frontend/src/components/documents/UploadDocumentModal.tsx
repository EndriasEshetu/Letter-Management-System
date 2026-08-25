import React from 'react';
import RegisterLetterModal from '@/components/letters/RegisterLetterModal';

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = (props) => {
  return <RegisterLetterModal {...props} />;
};

export default UploadDocumentModal;

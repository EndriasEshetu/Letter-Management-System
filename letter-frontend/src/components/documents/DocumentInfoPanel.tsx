import React from 'react';
import LetterInfoPanel from '@/components/letters/LetterInfoPanel';
import { DocumentItem } from '@/types/document';

interface DocumentInfoPanelProps {
  document: DocumentItem;
}

export const DocumentInfoPanel: React.FC<DocumentInfoPanelProps> = ({ document }) => {
  return <LetterInfoPanel letter={document} />;
};

export default DocumentInfoPanel;

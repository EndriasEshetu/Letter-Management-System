import letterService from './letterService';

/**
 * @deprecated Use letterService from '@/services/letterService' instead.
 */
export const documentService = {
  getDocuments: letterService.getLetters.bind(letterService),
  searchDocuments: letterService.searchLetters.bind(letterService),
  getDocumentById: letterService.getLetterById.bind(letterService),
  createDocument: letterService.createLetter.bind(letterService),
  uploadVersion: letterService.uploadAttachment.bind(letterService),
  downloadDocument: letterService.downloadAttachment.bind(letterService),
  archiveDocument: letterService.archiveLetter.bind(letterService),
  getDocumentVersions: letterService.getLetterAttachments.bind(letterService),
  submitForApproval: letterService.submitForApproval.bind(letterService),
  getArchivedDocuments: letterService.getArchivedLetters.bind(letterService),
  restoreDocument: letterService.restoreLetter.bind(letterService),
};

export default documentService;

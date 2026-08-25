export type NotificationType =
  | 'DOCUMENT_SUBMITTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'CHANGES_REQUESTED'
  | 'COMMENT_ADDED'
  | 'DOCUMENT_ARCHIVED';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  documentId?: string;
  documentTitle?: string;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | "DOCUMENT_SUBMITTED"
  | "DOCUMENT_APPROVED"
  | "DOCUMENT_REJECTED"
  | "CHANGES_REQUESTED"
  | "DOCUMENT_RESTORED"
  | "LETTER_REGISTERED"
  | "LETTER_AWAITING_ROUTING"
  | "LETTER_ROUTED"
  | "LETTER_ASSIGNED"
  | "LETTER_RESPONSE_REQUIRED"
  | "LETTER_DEADLINE_APPROACHING"
  | "LETTER_OVERDUE"
  | "LETTER_APPROVED"
  | "LETTER_CHANGES_REQUESTED"
  | "LETTER_DISPATCHED"
  | "LETTER_DELIVERED"
  | "LETTER_COMPLETED"
  | "INTERNAL_LETTER_RECEIVED"
  | "INTERNAL_TASK_DUE"
  | "COMMENT_ADDED"
  | "LETTER_ARCHIVED";

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  letterId?: string;
  letterTitle?: string;
  referenceNumber?: string;
  documentId?: string; // legacy alias
  documentTitle?: string; // legacy alias
  metadata?: Record<string, any>;
  entityType?: string;
  entityId?: string;
  taskId?: string;
}

export interface PaginatedNotificationsResponse {
  data: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

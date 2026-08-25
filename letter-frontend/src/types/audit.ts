import { UserRole } from './user';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'DOWNLOAD'
  | 'PERMISSION_CHANGE'
  | 'LETTER_REGISTERED'
  | 'LETTER_CLASSIFIED'
  | 'LETTER_ROUTED'
  | 'LETTER_ASSIGNED'
  | 'LETTER_REVIEWED'
  | 'LETTER_APPROVED'
  | 'LETTER_RETURNED'
  | 'LETTER_REJECTED'
  | 'LETTER_DISPATCHED'
  | 'LETTER_DELIVERED'
  | 'LETTER_COMPLETED'
  | 'LETTER_ARCHIVED'
  | 'LETTER_RESTORED';

export type AuditEntityType =
  | 'LETTER'
  | 'DOCUMENT'
  | 'USER'
  | 'DEPARTMENT'
  | 'WORKFLOW'
  | 'SYSTEM'
  | 'ARCHIVE'
  | 'DISPATCH';

export interface AuditUserRef {
  id: string | number;
  full_name: string;
  email?: string;
  role?: UserRole;
}

export interface AuditLog {
  id: string | number;
  created_at: string;
  user_id: string | number;
  user_name: string;
  user_email?: string;
  user_role?: UserRole;
  action: AuditAction | string;
  entity_type: AuditEntityType | string;
  entity_id: string;
  ip_address?: string;
  details?: string | Record<string, any>;
}

export interface AuditLogFilters {
  search?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

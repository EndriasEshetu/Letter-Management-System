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
  | 'PERMISSION_CHANGE';

export type AuditEntityType =
  | 'DOCUMENT'
  | 'USER'
  | 'DEPARTMENT'
  | 'WORKFLOW'
  | 'SYSTEM'
  | 'ARCHIVE';

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

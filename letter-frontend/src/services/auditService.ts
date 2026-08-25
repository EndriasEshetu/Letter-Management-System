import api from './api';
import {
  AuditLog,
  AuditLogFilters,
  PaginatedAuditLogsResponse,
} from '@/types/audit';

export const auditService = {
  /**
   * Get paginated & filtered audit logs from backend API
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedAuditLogsResponse> {
    const params: Record<string, any> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.action && filters.action !== 'ALL') params.action = filters.action;
    if (filters?.user_id && filters.user_id !== 'ALL') params.user_id = filters.user_id;
    if (filters?.entity_type && filters.entity_type !== 'ALL') params.entity_type = filters.entity_type;
    if (filters?.start_date) params.start_date = filters.start_date;
    if (filters?.end_date) params.end_date = filters.end_date;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const response = await api.get<PaginatedAuditLogsResponse>('/documents/audit-logs', { params });
    return response.data;
  },

  /**
   * Get audit log history for a specific letter from backend API
   */
  async getLetterAuditTrail(letterId: string): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>(`/documents/${letterId}/audit-trail`);
    return response.data;
  },
};

export default auditService;

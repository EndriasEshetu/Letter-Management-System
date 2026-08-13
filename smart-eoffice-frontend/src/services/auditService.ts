import api from './api';
import {
  AuditLog,
  AuditLogFilters,
  PaginatedAuditLogsResponse,
} from '@/types/audit';

/* ─── Dev/Offline Fallback Mock Dataset ────────────────────── */

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    user_id: 'usr-102',
    user_name: 'Sara Jenkins',
    user_email: 'sara.j@sita.gov.et',
    user_role: 'ADMIN',
    action: 'LOGIN',
    entity_type: 'SYSTEM',
    entity_id: 'sys-auth',
    ip_address: '192.168.1.45',
    details: JSON.stringify({ method: 'password', session_id: 'sess-abc123' }),
  },
  {
    id: 'aud-002',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    user_id: 'usr-101',
    user_name: 'Endrias Eshetu',
    user_email: 'endrias.e@sita.gov.et',
    user_role: 'DEPARTMENT_MANAGER',
    action: 'APPROVE',
    entity_type: 'DOCUMENT',
    entity_id: 'doc-0891',
    ip_address: '10.0.0.12',
    details: JSON.stringify({ document_title: 'Q3 Infrastructure Modernization Report v2.4', approved_at: new Date().toISOString() }),
  },
  {
    id: 'aud-003',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    user_id: 'usr-102',
    user_name: 'Sara Jenkins',
    user_email: 'sara.j@sita.gov.et',
    user_role: 'ADMIN',
    action: 'CREATE',
    entity_type: 'USER',
    entity_id: 'usr-107',
    ip_address: '192.168.1.45',
    details: JSON.stringify({ full_name: 'Selamawit Belay', email: 'selam.b@sita.gov.et', role: 'EMPLOYEE' }),
  },
  {
    id: 'aud-004',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_id: 'usr-103',
    user_name: 'Abebe Kebede',
    user_email: 'abebe.k@sita.gov.et',
    user_role: 'DEPARTMENT_MANAGER',
    action: 'REJECT',
    entity_type: 'DOCUMENT',
    entity_id: 'doc-0882',
    ip_address: '10.0.0.34',
    details: JSON.stringify({ document_title: 'Annual Leave Policy Revision', reason: 'Incomplete sections detected' }),
  },
  {
    id: 'aud-005',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    user_id: 'usr-102',
    user_name: 'Sara Jenkins',
    user_email: 'sara.j@sita.gov.et',
    user_role: 'ADMIN',
    action: 'UPDATE',
    entity_type: 'DEPARTMENT',
    entity_id: 'dep-fin',
    ip_address: '192.168.1.45',
    details: JSON.stringify({ field_changed: 'manager_id', previous: 'usr-099', new: 'usr-101' }),
  },
  {
    id: 'aud-006',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user_id: 'usr-104',
    user_name: 'Tariku Bikila',
    user_email: 'tariku.b@sita.gov.et',
    user_role: 'EMPLOYEE',
    action: 'CREATE',
    entity_type: 'DOCUMENT',
    entity_id: 'doc-0885',
    ip_address: '172.16.0.8',
    details: JSON.stringify({ document_title: 'Budget Allocation FY26 Draft Proposal', category: 'Finance / Reports' }),
  },
  {
    id: 'aud-007',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    user_id: 'usr-105',
    user_name: 'Tigist Haile',
    user_email: 'tigist.h@sita.gov.et',
    user_role: 'EMPLOYEE',
    action: 'DOWNLOAD',
    entity_type: 'DOCUMENT',
    entity_id: 'doc-0850',
    ip_address: '10.0.0.18',
    details: JSON.stringify({ document_title: 'Annual Procurement Guidelines 2026', file_format: 'PDF' }),
  },
  {
    id: 'aud-008',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    user_id: 'usr-102',
    user_name: 'Sara Jenkins',
    user_email: 'sara.j@sita.gov.et',
    user_role: 'ADMIN',
    action: 'PERMISSION_CHANGE',
    entity_type: 'USER',
    entity_id: 'usr-104',
    ip_address: '192.168.1.45',
    details: JSON.stringify({ user: 'Tariku Bikila', previous_role: 'EMPLOYEE', new_role: 'DEPARTMENT_MANAGER' }),
  },
  {
    id: 'aud-009',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'usr-101',
    user_name: 'Endrias Eshetu',
    user_email: 'endrias.e@sita.gov.et',
    user_role: 'DEPARTMENT_MANAGER',
    action: 'ARCHIVE',
    entity_type: 'DOCUMENT',
    entity_id: 'doc-0802',
    ip_address: '10.0.0.12',
    details: JSON.stringify({ document_title: 'Q1 2025 Expenditure Summary', archived_to: 'vault-2025-q1' }),
  },
  {
    id: 'aud-010',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    user_id: 'usr-102',
    user_name: 'Sara Jenkins',
    user_email: 'sara.j@sita.gov.et',
    user_role: 'ADMIN',
    action: 'DELETE',
    entity_type: 'USER',
    entity_id: 'usr-098',
    ip_address: '192.168.1.45',
    details: JSON.stringify({ deleted_user: 'Former Contractor (decommissioned)', reason: 'Contract expired' }),
  },
];

function applyMockFilters(logs: AuditLog[], filters: AuditLogFilters): AuditLog[] {
  let result = [...logs];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (log) =>
        log.user_name.toLowerCase().includes(q) ||
        log.entity_id.toLowerCase().includes(q) ||
        (log.ip_address && log.ip_address.includes(q)) ||
        (typeof log.details === 'string' && log.details.toLowerCase().includes(q))
    );
  }

  if (filters.userId) {
    result = result.filter((log) => String(log.user_id) === filters.userId);
  }

  if (filters.action) {
    result = result.filter((log) => log.action === filters.action);
  }

  if (filters.entityType) {
    result = result.filter((log) => log.entity_type === filters.entityType);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    result = result.filter((log) => new Date(log.created_at).getTime() >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime() + 86400000; // inclusive end
    result = result.filter((log) => new Date(log.created_at).getTime() <= end);
  }

  return result;
}

export const auditService = {
  /**
   * Fetch paginated, filtered audit logs from the backend.
   */
  async getAuditLogs(filters: AuditLogFilters): Promise<PaginatedAuditLogsResponse> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    try {
      const response = await api.get<PaginatedAuditLogsResponse>('/audit-logs', {
        params: {
          ...filters,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response || error.response.status === 404) {
        await new Promise((res) => setTimeout(res, 250));
        const filtered = applyMockFilters(MOCK_AUDIT_LOGS, filters);
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit);

        return { data, total, page, limit, totalPages };
      }
      throw error;
    }
  },
};

export default auditService;

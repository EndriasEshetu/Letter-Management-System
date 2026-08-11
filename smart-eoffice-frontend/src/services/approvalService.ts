import api from './api';
import {
  ApprovalRequest,
  ApprovalMetrics,
  ApprovalActivity,
  ApprovePayload,
  RejectPayload,
  RequestChangesPayload,
  ApprovalFilterTab,
} from '@/types/approval';
import { DocumentItem } from '@/types/document';

/* ─── Minimal doc stubs for dev mock (no cross-service import) ─ */
// These mirror the same records in documentService.ts mock dataset.
// Production: both services consume the real API independently.

const MOCK_DOCS: Pick<
  DocumentItem,
  'id' | 'documentNumber' | 'title' | 'description' | 'category' | 'department_name' |
  'created_by' | 'status' | 'securityLevel' | 'file_name' | 'file_size' | 'file_type' |
  'created_at' | 'updated_at' | 'tags'
>[] = [
  {
    id: 'doc-1',
    documentNumber: 'DOC-2026-001',
    title: 'Q1_Financial_Report_DRAFT.pdf',
    description: 'Quarterly financial overview and budget projections for SITA departments',
    category: 'Finance / Reports',
    department_name: 'Finance & Planning',
    created_by: 'Endrias Eshetu',
    status: 'PENDING_APPROVAL',
    securityLevel: 'CONFIDENTIAL',
    file_name: 'Q1_Financial_Report_DRAFT.pdf',
    file_size: 2516582,
    file_type: 'application/pdf',
    created_at: 'Today, 09:42 AM',
    updated_at: 'Today, 09:42 AM',
    tags: ['financial', 'q1', 'draft'],
  },
  {
    id: 'doc-4',
    documentNumber: 'HR-2026-001',
    title: 'Employee_Handbook_2026.pdf',
    description: 'Updated HR code of conduct, leave policies, and organizational structure',
    category: 'HR / Policies',
    department_name: 'Human Resources',
    created_by: 'Abebe Kebede',
    status: 'PENDING_APPROVAL',
    securityLevel: 'PUBLIC',
    file_name: 'Employee_Handbook_2026.pdf',
    file_size: 1153433,
    file_type: 'application/pdf',
    created_at: 'Mar 15, 2026',
    updated_at: 'Mar 15, 2026',
    tags: ['hr', 'handbook'],
  },
  {
    id: 'doc-5',
    documentNumber: 'DOC-2026-089',
    title: 'ICT_Infrastructure_Audit_Report.docx',
    description: 'Hardware audit, server rack capacity, and fiber network routing assessment',
    category: 'ICT / Audit',
    department_name: 'ICT Governance',
    created_by: 'Michael K.',
    status: 'PENDING_APPROVAL',
    securityLevel: 'INTERNAL',
    file_name: 'ICT_Infrastructure_Audit_Report.docx',
    file_size: 3460300,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: 'Mar 10, 2026',
    updated_at: 'Mar 10, 2026',
    tags: ['ict', 'audit'],
  },
];

/* ─── Mutable mock state (dev offline only) ─────────────── */

let mockRequests: ApprovalRequest[] = [
  {
    id: 'appr-1',
    document: MOCK_DOCS[0] as DocumentItem,
    submitter_name: 'Endrias Eshetu',
    submitter_role: 'Senior Finance Officer',
    submitter_department: 'Finance & Planning',
    priority: 'HIGH',
    status: 'PENDING',
    submitted_at: '2026-08-11T07:30:00Z',
    page_count: 42,
  },
  {
    id: 'appr-2',
    document: MOCK_DOCS[1] as DocumentItem,
    submitter_name: 'Abebe Kebede',
    submitter_role: 'HR Manager',
    submitter_department: 'Human Resources',
    priority: 'NORMAL',
    status: 'PENDING',
    submitted_at: '2026-08-10T15:20:00Z',
    page_count: 28,
  },
  {
    id: 'appr-3',
    document: MOCK_DOCS[2] as DocumentItem,
    submitter_name: 'Michael K.',
    submitter_role: 'ICT Officer',
    submitter_department: 'ICT Governance',
    priority: 'NORMAL',
    status: 'PENDING',
    submitted_at: '2026-08-09T11:05:00Z',
    page_count: 15,
  },
];

let mockActivity: ApprovalActivity[] = [
  {
    id: 'act-1',
    action: 'APPROVED',
    document_title: 'SITA_Budget_FY2026.pdf',
    document_id: 'doc-4',
    user_name: 'Tigist Haile',
    timestamp: '2026-08-10T13:00:00Z',
  },
  {
    id: 'act-2',
    action: 'CHANGES_REQUESTED',
    document_title: 'Procurement_Policy_Draft.pdf',
    document_id: 'doc-5',
    user_name: 'Tigist Haile',
    timestamp: '2026-08-09T16:45:00Z',
  },
  {
    id: 'act-3',
    action: 'REJECTED',
    document_title: 'Travel_Report_March.pdf',
    document_id: 'doc-1',
    user_name: 'Tigist Haile',
    timestamp: '2026-08-08T10:30:00Z',
  },
];

/* ─── Approval Service ───────────────────────────────────── */

export const approvalService = {
  /**
   * Get approval requests visible to the current user
   */
  async getApprovalRequests(filter?: ApprovalFilterTab): Promise<ApprovalRequest[]> {
    try {
      const params: Record<string, string> = {};
      if (filter === 'HIGH_PRIORITY') params.priority = 'HIGH';
      if (filter === 'REVIEWED') params.status = 'REVIEWED';

      const response = await api.get<ApprovalRequest[]>('/approvals', { params });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        let results = [...mockRequests];
        if (filter === 'HIGH_PRIORITY') {
          results = results.filter((r) => r.priority === 'HIGH' && r.status === 'PENDING');
        } else if (filter === 'REVIEWED') {
          results = results.filter((r) => r.status !== 'PENDING');
        } else {
          // ALL = pending only
          results = results.filter((r) => r.status === 'PENDING');
        }
        // Simulate latency
        await new Promise((r) => setTimeout(r, 300));
        return results;
      }
      throw error;
    }
  },

  /**
   * Get approval metrics
   */
  async getApprovalMetrics(): Promise<ApprovalMetrics> {
    try {
      const response = await api.get<ApprovalMetrics>('/approvals/metrics');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const pending = mockRequests.filter((r) => r.status === 'PENDING').length;
        const approved = mockActivity.filter((a) => a.action === 'APPROVED').length;
        const rejected = mockActivity.filter((a) => a.action === 'REJECTED').length;
        const changes = mockActivity.filter((a) => a.action === 'CHANGES_REQUESTED').length;
        const total = approved + rejected + changes;
        await new Promise((r) => setTimeout(r, 200));
        return {
          pending_count: pending,
          approved_count: approved,
          rejected_count: rejected,
          changes_requested_count: changes,
          approval_rate_percent: total > 0 ? Math.round((approved / total) * 100) : null,
          avg_turnaround_hours: total > 0 ? 4.2 : null,
        };
      }
      throw error;
    }
  },

  /**
   * Get recent approval activity
   */
  async getApprovalActivity(): Promise<ApprovalActivity[]> {
    try {
      const response = await api.get<ApprovalActivity[]>('/approvals/activity');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 200));
        return [...mockActivity].slice(0, 5);
      }
      throw error;
    }
  },

  /**
   * Approve a document
   */
  async approveDocument(payload: ApprovePayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/approvals/${payload.document_id}/approve`,
        { comment: payload.comment }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 400));
        const request = mockRequests.find((r) => r.document.id === payload.document_id);
        if (request) {
          request.status = 'APPROVED';
          request.reviewed_at = new Date().toISOString();
          mockActivity.unshift({
            id: `act-${Date.now()}`,
            action: 'APPROVED',
            document_title: request.document.title,
            document_id: request.document.id,
            user_name: 'You',
            timestamp: new Date().toISOString(),
          });
        }
        return { message: 'Document approved successfully.' };
      }
      throw error;
    }
  },

  /**
   * Reject a document
   */
  async rejectDocument(payload: RejectPayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/approvals/${payload.document_id}/reject`,
        { reason: payload.reason }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 400));
        const request = mockRequests.find((r) => r.document.id === payload.document_id);
        if (request) {
          request.status = 'REJECTED';
          request.comment = payload.reason;
          request.reviewed_at = new Date().toISOString();
          mockActivity.unshift({
            id: `act-${Date.now()}`,
            action: 'REJECTED',
            document_title: request.document.title,
            document_id: request.document.id,
            user_name: 'You',
            timestamp: new Date().toISOString(),
          });
        }
        return { message: 'Document rejected.' };
      }
      throw error;
    }
  },

  /**
   * Request changes for a document
   */
  async requestChanges(payload: RequestChangesPayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/approvals/${payload.document_id}/request-changes`,
        { reason: payload.reason }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 400));
        const request = mockRequests.find((r) => r.document.id === payload.document_id);
        if (request) {
          request.status = 'CHANGES_REQUESTED';
          request.comment = payload.reason;
          request.reviewed_at = new Date().toISOString();
          mockActivity.unshift({
            id: `act-${Date.now()}`,
            action: 'CHANGES_REQUESTED',
            document_title: request.document.title,
            document_id: request.document.id,
            user_name: 'You',
            timestamp: new Date().toISOString(),
          });
        }
        return { message: 'Changes requested.' };
      }
      throw error;
    }
  },
};

export default approvalService;

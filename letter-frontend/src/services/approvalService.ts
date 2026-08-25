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
import { LetterItem } from '@/types/letter';

/* ─── Minimal letter stubs for dev mock ────────────────────── */
// These mirror the same records in letterService.ts mock dataset.

const MOCK_LETTERS: Pick<
  LetterItem,
  | 'id'
  | 'referenceNumber'
  | 'registrationNumber'
  | 'subject'
  | 'description'
  | 'letterType'
  | 'category'
  | 'department_name'
  | 'created_by'
  | 'status'
  | 'confidentialityLevel'
  | 'file_name'
  | 'file_size'
  | 'file_type'
  | 'created_at'
  | 'updated_at'
  | 'tags'
  | 'sender'
  | 'senderOrganization'
  | 'priority'
>[] = [
  {
    id: 'ltr-1',
    referenceNumber: 'LMS/INC/2026/001',
    registrationNumber: 'REG-2026-0001',
    subject: 'Request for Budget Allocation – Q4 FY2026',
    description: 'Formal request from the Ministry of Finance for Q4 budget allocation and departmental expenditure review.',
    letterType: 'INCOMING',
    category: 'Finance / Budget',
    department_name: 'App Development Directorate',
    created_by: 'Registry Officer',
    status: 'PENDING_APPROVAL',
    confidentialityLevel: 'CONFIDENTIAL',
    file_name: 'Budget_Request_Q4_FY2026.pdf',
    file_size: 2516582,
    file_type: 'application/pdf',
    created_at: 'Today, 09:42 AM',
    updated_at: 'Today, 09:42 AM',
    sender: 'Ato Kebede Tadesse',
    senderOrganization: 'Ministry of Finance, Ethiopia',
    priority: 'HIGH',
    tags: ['budget', 'q4', 'finance'],
  },
  {
    id: 'ltr-4',
    referenceNumber: 'LMS/INC/2026/033',
    registrationNumber: 'REG-2026-0033',
    subject: 'Invitation – Regional ICT Innovation Summit 2026',
    description: 'Official invitation from the African Union Commission to participate in the Regional ICT Innovation Summit.',
    letterType: 'INVITATION',
    category: 'Events / International',
    department_name: 'Science and Technology Directorate',
    created_by: 'Abebe Kebede',
    status: 'PENDING_APPROVAL',
    confidentialityLevel: 'PUBLIC',
    file_name: 'AU_ICT_Summit_Invitation_2026.pdf',
    file_size: 1153433,
    file_type: 'application/pdf',
    created_at: 'Mar 15, 2026',
    updated_at: 'Mar 15, 2026',
    sender: 'Commissioner for Infrastructure and Energy',
    senderOrganization: 'African Union Commission',
    priority: 'HIGH',
    tags: ['event', 'invitation', 'ict'],
  },
  {
    id: 'ltr-5',
    referenceNumber: 'LMS/INC/2026/021',
    registrationNumber: 'REG-2026-0021',
    subject: 'Audit Report Request – ICT Infrastructure Assessment FY2026',
    description: 'Request from the Office of the Auditor General for ICT infrastructure audit documentation.',
    letterType: 'REQUEST',
    category: 'Legal / Audit',
    department_name: 'ICT Infrastructure Development Directorate',
    created_by: 'Michael K.',
    status: 'PENDING_APPROVAL',
    confidentialityLevel: 'INTERNAL',
    file_name: 'Audit_Request_ICT_FY2026.docx',
    file_size: 3460300,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: 'Mar 10, 2026',
    updated_at: 'Mar 10, 2026',
    sender: 'Deputy Auditor General',
    senderOrganization: 'Office of the Auditor General of Ethiopia',
    priority: 'NORMAL',
    tags: ['audit', 'ict', 'legal'],
  },
];

/* ─── Mutable mock state (dev offline only) ─────────────── */

let mockRequests: ApprovalRequest[] = [
  {
    id: 'appr-1',
    letter: MOCK_LETTERS[0] as LetterItem,
    approvalContext: 'RESPONSE_REVIEW',
    letterDirection: 'INCOMING',
    submitter_name: 'Endrias Eshetu',
    submitter_role: 'IT Officer',
    submitter_department: 'App Development Directorate',
    priority: 'HIGH',
    status: 'PENDING',
    submitted_at: '2026-08-22T07:30:00Z',
    page_count: 5,
  },
  {
    id: 'appr-2',
    letter: MOCK_LETTERS[1] as LetterItem,
    approvalContext: 'OUTGOING_REVIEW',
    letterDirection: 'OUTGOING',
    submitter_name: 'Sara Jenkins',
    submitter_role: 'Communications Officer',
    submitter_department: 'ICT Infrastructure Development Directorate',
    priority: 'NORMAL',
    status: 'PENDING',
    submitted_at: '2026-08-23T15:20:00Z',
    page_count: 3,
  },
  {
    id: 'appr-3',
    letter: MOCK_LETTERS[2] as LetterItem,
    approvalContext: 'INTERNAL_REVIEW',
    letterDirection: 'INTERNAL',
    submitter_name: 'Michael K.',
    submitter_role: 'Incubation Officer',
    submitter_department: 'Incubation Development Directorate',
    priority: 'NORMAL',
    status: 'PENDING',
    submitted_at: '2026-08-24T11:05:00Z',
    page_count: 8,
  },
];

let mockActivity: ApprovalActivity[] = [
  {
    id: 'act-1',
    action: 'APPROVED',
    letter_subject: 'Annual Procurement Policy 2026',
    letter_id: 'ltr-4',
    user_name: 'Tigist Haile',
    timestamp: '2026-08-10T13:00:00Z',
  },
  {
    id: 'act-2',
    action: 'CHANGES_REQUESTED',
    letter_subject: 'Procurement Regulation Amendment Draft',
    letter_id: 'ltr-5',
    user_name: 'Tigist Haile',
    timestamp: '2026-08-09T16:45:00Z',
  },
  {
    id: 'act-3',
    action: 'REJECTED',
    letter_subject: 'Travel Authorization Request – March',
    letter_id: 'ltr-1',
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
   * Approve a letter
   */
  async approveLetter(payload: ApprovePayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/approvals/${payload.letter_id}/approve`,
        { comment: payload.comment }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 400));
        const request = mockRequests.find((r) => r.letter.id === payload.letter_id);
        if (request) {
          request.status = 'APPROVED';
          request.reviewed_at = new Date().toISOString();
          mockActivity.unshift({
            id: `act-${Date.now()}`,
            action: 'APPROVED',
            letter_subject: request.letter.subject,
            letter_id: request.letter.id,
            user_name: 'You',
            timestamp: new Date().toISOString(),
          });
        }
        return { message: 'Letter approved successfully.' };
      }
      throw error;
    }
  },

  /**
   * Reject a letter
   */
  async rejectLetter(payload: RejectPayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/approvals/${payload.letter_id}/reject`,
        { reason: payload.reason }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 400));
        const request = mockRequests.find((r) => r.letter.id === payload.letter_id);
        if (request) {
          request.status = 'REJECTED';
          request.comment = payload.reason;
          request.reviewed_at = new Date().toISOString();
          mockActivity.unshift({
            id: `act-${Date.now()}`,
            action: 'REJECTED',
            letter_subject: request.letter.subject,
            letter_id: request.letter.id,
            user_name: 'You',
            timestamp: new Date().toISOString(),
          });
        }
        return { message: 'Letter rejected.' };
      }
      throw error;
    }
  },

  /**
   * Request changes for a letter
   */
  async requestChanges(payload: RequestChangesPayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/approvals/${payload.letter_id}/request-changes`,
        { reason: payload.reason }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 400));
        const request = mockRequests.find((r) => r.letter.id === payload.letter_id);
        if (request) {
          request.status = 'CHANGES_REQUESTED';
          request.comment = payload.reason;
          request.reviewed_at = new Date().toISOString();
          mockActivity.unshift({
            id: `act-${Date.now()}`,
            action: 'CHANGES_REQUESTED',
            letter_subject: request.letter.subject,
            letter_id: request.letter.id,
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

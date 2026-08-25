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

export const approvalService = {
  /**
   * Get approval requests visible to the current user via backend API
   */
  async getApprovalRequests(filter?: ApprovalFilterTab): Promise<ApprovalRequest[]> {
    const params: Record<string, string> = {};
    if (filter === 'HIGH_PRIORITY') params.priority = 'HIGH';
    if (filter === 'REVIEWED') params.status = 'REVIEWED';

    const response = await api.get<ApprovalRequest[]>('/approvals', { params });
    return response.data;
  },

  /**
   * Get approval metrics via backend API
   */
  async getApprovalMetrics(): Promise<ApprovalMetrics> {
    const response = await api.get<ApprovalMetrics>('/approvals/metrics');
    return response.data;
  },

  /**
   * Get recent approval activity via backend API
   */
  async getApprovalActivity(): Promise<ApprovalActivity[]> {
    const response = await api.get<ApprovalActivity[]>('/approvals/activity');
    return response.data;
  },

  /**
   * Approve a document request via backend API
   */
  async approveRequest(
    documentId: string,
    payload?: ApprovePayload
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/approvals/${documentId}/approve`,
      payload || {}
    );
    return response.data;
  },

  /**
   * Reject a document request via backend API
   */
  async rejectRequest(
    documentId: string,
    payload: RejectPayload
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/approvals/${documentId}/reject`,
      payload
    );
    return response.data;
  },

  /**
   * Approve helper compatible with payload objects
   */
  async approveLetter(payload: { letter_id?: string; documentId?: string; comment?: string }): Promise<{ message: string }> {
    const id = payload.letter_id || payload.documentId || '';
    return this.approveRequest(id, { comment: payload.comment });
  },

  /**
   * Reject helper compatible with payload objects
   */
  async rejectLetter(payload: { letter_id?: string; documentId?: string; reason: string }): Promise<{ message: string }> {
    const id = payload.letter_id || payload.documentId || '';
    return this.rejectRequest(id, { reason: payload.reason });
  },

  /**
   * Request changes helper
   */
  async requestChanges(
    arg1: string | { letter_id?: string; documentId?: string; reason: string },
    arg2?: RequestChangesPayload
  ): Promise<{ message: string }> {
    if (typeof arg1 === 'string') {
      const response = await api.post<{ message: string }>(
        `/approvals/${arg1}/request-changes`,
        arg2 || { reason: '' }
      );
      return response.data;
    }
    const id = arg1.letter_id || arg1.documentId || '';
    const response = await api.post<{ message: string }>(
      `/approvals/${id}/request-changes`,
      { reason: arg1.reason }
    );
    return response.data;
  },
};

export default approvalService;

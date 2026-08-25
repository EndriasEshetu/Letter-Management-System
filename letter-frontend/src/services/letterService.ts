import api from './api';
import {
  LetterFilterParams,
  LetterItem,
  PaginatedLetterResponse,
  AttachmentItem,
  LetterDispatch,
} from '@/types/letter';

export const letterService = {
  /**
   * Get paginated & filtered list of letters
   */
  async getLetters(params?: LetterFilterParams): Promise<PaginatedLetterResponse> {
    const response = await api.get<PaginatedLetterResponse>('/letters', { params });
    return response.data;
  },

  /**
   * Search letters by query
   */
  async searchLetters(query: string, params?: LetterFilterParams): Promise<PaginatedLetterResponse> {
    return this.getLetters({ ...params, search: query });
  },

  /**
   * Get single letter by ID
   */
  async getLetterById(id: string): Promise<LetterItem> {
    const response = await api.get<LetterItem>(`/letters/${id}`);
    return response.data;
  },

  /**
   * Create & Register a new letter based on direction (Incoming, Outgoing, Internal)
   */
  async createLetter(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<LetterItem> {
    const response = await api.post<LetterItem>('/letters', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * Main Administrator Routes Incoming/Internal Letter to Department
   */
  async routeToDepartment(id: string, departmentName: string, notes?: string): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(`/letters/${id}/route`, {
      department: departmentName,
      notes,
    });
    return response.data;
  },

  /**
   * Department Manager assigns letter to Officer
   */
  async assignToOfficer(
    id: string,
    payload: { officerName: string; dueDate?: string; instructions?: string; priority?: string }
  ): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(`/letters/${id}/assign`, payload);
    return response.data;
  },

  /**
   * Register Outgoing Letter
   */
  async registerOutgoingNumber(id: string): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(`/letters/${id}/register-outgoing`);
    return response.data;
  },

  /**
   * Registry/Dispatch Officer records letter dispatch
   */
  async recordDispatch(
    id: string,
    dispatchInfo: Omit<LetterDispatch, 'sentBy'>
  ): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(`/letters/${id}/dispatch`, dispatchInfo);
    return response.data;
  },

  /**
   * Mark letter completed
   */
  async completeLetter(id: string, comment?: string): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(`/letters/${id}/complete`, { comment });
    return response.data;
  },

  /**
   * Get officer's assigned tasks
   */
  async getMyTasks(): Promise<LetterItem[]> {
    const res = await this.getLetters();
    return res.data.filter((l) => l.assignedEmployee || l.status === 'IN_PROGRESS');
  },

  /**
   * Get letters awaiting Main Admin routing
   */
  async getPendingRouting(): Promise<LetterItem[]> {
    const res = await this.getLetters({ status: 'REGISTERED' });
    return res.data;
  },

  /**
   * Upload an attachment to an existing letter
   */
  async uploadAttachment(
    id: string,
    formData: FormData
  ): Promise<{ message: string; version: string }> {
    const response = await api.post<{ message: string; version: string }>(
      `/letters/${id}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Download letter attachment
   */
  async downloadAttachment(id: string, filename?: string): Promise<void> {
    const response = await api.get(`/letters/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `letter_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Archive a letter
   */
  async archiveLetter(id: string): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(
      `/letters/${id}/archive`
    );
    return response.data;
  },

  /**
   * Get attachments for a letter
   */
  async getLetterAttachments(id: string): Promise<AttachmentItem[]> {
    const response = await api.get<AttachmentItem[]>(`/letters/${id}/attachments`);
    return response.data;
  },

  /**
   * Submit letter for approval
   */
  async submitForApproval(id: string): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(
      `/letters/${id}/submit`
    );
    return response.data;
  },

  /**
   * Get archived letters
   */
  async getArchivedLetters(params?: LetterFilterParams): Promise<PaginatedLetterResponse> {
    return this.getLetters({ ...params, status: 'ARCHIVED' });
  },

  /**
   * Restore an archived letter (Admin only)
   */
  async restoreLetter(id: string): Promise<{ message: string; letter: LetterItem }> {
    const response = await api.post<{ message: string; letter: LetterItem }>(
      `/letters/${id}/restore`
    );
    return response.data;
  },
};

export default letterService;

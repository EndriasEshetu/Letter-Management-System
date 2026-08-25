import api from './api';
import {
  LetterFilterParams,
  LetterItem,
  PaginatedLetterResponse,
  AttachmentItem,
  LetterType,
  ConfidentialityLevel,
  LetterPriority,
} from '@/types/letter';

/**
 * Mock Initial Letters Dataset for Dev Offline Mode
 */
const MOCK_LETTERS: LetterItem[] = [
  {
    id: 'ltr-1',
    referenceNumber: 'LMS/INC/2026/001',
    registrationNumber: 'REG-2026-0001',
    subject: 'Request for Budget Allocation – Q4 FY2026',
    description: 'Formal request from the Ministry of Finance for Q4 budget allocation and departmental expenditure review.',
    letterType: 'INCOMING',
    category: 'Finance / Budget',
    department_name: 'Finance & Planning',
    originatingDepartment: 'Ministry of Finance',
    sender: 'Ato Kebede Tadesse',
    senderOrganization: 'Ministry of Finance, Ethiopia',
    recipient: 'Director General',
    recipientOrganization: 'SITA',
    assignedEmployee: 'Endrias Eshetu',
    created_by: 'Registry Officer',
    status: 'PENDING_APPROVAL',
    confidentialityLevel: 'CONFIDENTIAL',
    priority: 'HIGH',
    dateReceived: 'Today, 09:42 AM',
    dueDate: 'Nov 01, 2026',
    responseRequired: true,
    file_name: 'Budget_Request_Q4_FY2026.pdf',
    file_size: 2516582,
    file_type: 'application/pdf',
    created_at: 'Today, 09:42 AM',
    updated_at: 'Today, 09:42 AM',
    tags: ['budget', 'q4', 'finance'],
    is_new: true,
    attachments: [
      {
        id: 'att-1-1',
        versionNumber: 'v1.0',
        uploadedBy: 'Registry Officer',
        date: 'Today, 09:42 AM',
        fileSize: 2516582,
        fileName: 'Budget_Request_Q4_FY2026.pdf',
        isCurrent: true,
      },
    ],
  },
  {
    id: 'ltr-2',
    referenceNumber: 'LMS/OUT/2026/089',
    registrationNumber: 'REG-2026-0089',
    subject: 'Official Response – ICT Infrastructure Partnership Proposal',
    description: 'Formal response to the partnership proposal submitted by Huawei Technologies regarding ICT infrastructure development.',
    letterType: 'OUTGOING',
    category: 'ICT / Partnerships',
    department_name: 'ICT Governance',
    sender: 'Director General, SITA',
    senderOrganization: 'Sidama Innovation and Technology Agency',
    recipient: 'Regional Director',
    recipientOrganization: 'Huawei Technologies East Africa',
    created_by: 'Tariku Bikila',
    status: 'APPROVED',
    confidentialityLevel: 'INTERNAL',
    priority: 'NORMAL',
    dateSent: 'Yesterday, 16:30 PM',
    file_name: 'ICT_Partnership_Response_2026.pdf',
    file_size: 1290777,
    file_type: 'application/pdf',
    created_at: 'Yesterday, 16:30 PM',
    updated_at: 'Yesterday, 16:30 PM',
    tags: ['ict', 'partnership', 'response'],
    attachments: [
      {
        id: 'att-2-1',
        versionNumber: 'v1.0',
        uploadedBy: 'Tariku Bikila',
        date: 'Yesterday, 16:30 PM',
        fileSize: 1290777,
        fileName: 'ICT_Partnership_Response_2026.pdf',
        isCurrent: true,
      },
    ],
  },
  {
    id: 'ltr-3',
    referenceNumber: 'LMS/INT/2026/045',
    registrationNumber: 'REG-2026-0045',
    subject: 'Internal Memorandum – Staff Performance Review Schedule 2026',
    description: 'Internal memorandum from Human Resources to all department heads regarding the annual performance review timeline and procedures.',
    letterType: 'MEMORANDUM',
    category: 'HR / Administration',
    department_name: 'Human Resources',
    originatingDepartment: 'Human Resources',
    sender: 'HR Director',
    senderOrganization: 'SITA – Human Resources Directorate',
    recipient: 'All Department Heads',
    recipientOrganization: 'SITA',
    created_by: 'Sara Jenkins',
    status: 'DISPATCHED',
    confidentialityLevel: 'INTERNAL',
    priority: 'NORMAL',
    dateSent: 'Mar 28, 2026',
    file_name: 'Performance_Review_Schedule_Memo_2026.docx',
    file_size: 598323,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: 'Mar 28, 2026',
    updated_at: 'Mar 28, 2026',
    tags: ['hr', 'performance', 'memo'],
    is_new: true,
    attachments: [
      {
        id: 'att-3-1',
        versionNumber: 'v1.0',
        uploadedBy: 'Sara Jenkins',
        date: 'Mar 28, 2026',
        fileSize: 598323,
        fileName: 'Performance_Review_Schedule_Memo_2026.docx',
        isCurrent: true,
      },
    ],
  },
  {
    id: 'ltr-4',
    referenceNumber: 'LMS/INC/2026/033',
    registrationNumber: 'REG-2026-0033',
    subject: 'Invitation – Regional ICT Innovation Summit 2026',
    description: 'Official invitation from the African Union Commission to participate in the Regional ICT Innovation Summit.',
    letterType: 'INVITATION',
    category: 'Events / International',
    department_name: 'ICT Governance',
    sender: 'Commissioner for Infrastructure and Energy',
    senderOrganization: 'African Union Commission',
    recipient: 'Director General',
    recipientOrganization: 'SITA',
    created_by: 'Abebe Kebede',
    status: 'COMPLETED',
    confidentialityLevel: 'PUBLIC',
    priority: 'HIGH',
    dateReceived: 'Mar 15, 2026',
    file_name: 'AU_ICT_Summit_Invitation_2026.pdf',
    file_size: 1153433,
    file_type: 'application/pdf',
    created_at: 'Mar 15, 2026',
    updated_at: 'Mar 15, 2026',
    tags: ['event', 'invitation', 'ict', 'au'],
    attachments: [
      {
        id: 'att-4-1',
        versionNumber: 'v1.0',
        uploadedBy: 'Abebe Kebede',
        date: 'Mar 15, 2026',
        fileSize: 1153433,
        fileName: 'AU_ICT_Summit_Invitation_2026.pdf',
        isCurrent: true,
      },
    ],
  },
  {
    id: 'ltr-5',
    referenceNumber: 'LMS/INC/2026/021',
    registrationNumber: 'REG-2026-0021',
    subject: 'Audit Report Request – ICT Infrastructure Assessment FY2026',
    description: 'Request from the Office of the Auditor General for ICT infrastructure audit documentation and system access logs.',
    letterType: 'REQUEST',
    category: 'Legal / Audit',
    department_name: 'ICT Governance',
    sender: 'Deputy Auditor General',
    senderOrganization: 'Office of the Auditor General of Ethiopia',
    recipient: 'Director, ICT Governance',
    recipientOrganization: 'SITA',
    created_by: 'Michael K.',
    status: 'REJECTED',
    confidentialityLevel: 'INTERNAL',
    priority: 'NORMAL',
    dateReceived: 'Mar 10, 2026',
    file_name: 'Audit_Request_ICT_FY2026.docx',
    file_size: 3460300,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: 'Mar 10, 2026',
    updated_at: 'Mar 10, 2026',
    tags: ['audit', 'ict', 'legal'],
    attachments: [
      {
        id: 'att-5-1',
        versionNumber: 'v1.0',
        uploadedBy: 'Michael K.',
        date: 'Mar 10, 2026',
        fileSize: 3460300,
        fileName: 'Audit_Request_ICT_FY2026.docx',
        isCurrent: true,
      },
    ],
  },
];

let inMemoryLetters = [...MOCK_LETTERS];

export const letterService = {
  /**
   * Get paginated & filtered list of letters
   */
  async getLetters(params?: LetterFilterParams): Promise<PaginatedLetterResponse> {
    try {
      const response = await api.get<PaginatedLetterResponse>('/letters', { params });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        // Dev fallback mode
        let filtered = [...inMemoryLetters];

        if (params?.search) {
          const query = params.search.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.subject.toLowerCase().includes(query) ||
              l.referenceNumber.toLowerCase().includes(query) ||
              (l.registrationNumber || '').toLowerCase().includes(query) ||
              (l.sender || '').toLowerCase().includes(query) ||
              (l.recipient || '').toLowerCase().includes(query) ||
              l.category.toLowerCase().includes(query)
          );
        }

        if (params?.letterType && params.letterType !== 'ALL') {
          filtered = filtered.filter((l) => l.letterType === params.letterType);
        }

        if (params?.category && params.category !== 'ALL') {
          filtered = filtered.filter((l) =>
            l.category.toLowerCase().includes(params.category!.toLowerCase())
          );
        }

        if (params?.department_id && params.department_id !== 'ALL') {
          filtered = filtered.filter((l) =>
            l.department_name.toLowerCase().includes(params.department_id!.toLowerCase())
          );
        }

        if (params?.status && params.status !== 'ALL') {
          filtered = filtered.filter((l) => l.status === params.status);
        }

        if (params?.confidentialityLevel && params.confidentialityLevel !== 'ALL') {
          filtered = filtered.filter((l) => l.confidentialityLevel === params.confidentialityLevel);
        }

        if (params?.priority && params.priority !== 'ALL') {
          filtered = filtered.filter((l) => l.priority === params.priority);
        }

        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const paginatedData = filtered.slice(startIndex, startIndex + limit);

        return {
          data: paginatedData,
          total,
          page,
          limit,
          totalPages,
        };
      }
      throw error;
    }
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
    try {
      const response = await api.get<LetterItem>(`/letters/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const found = inMemoryLetters.find((l) => l.id === id);
        if (found) return found;
      }
      throw error;
    }
  },

  /**
   * Register a new letter (incoming, outgoing, or internal)
   */
  async createLetter(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<LetterItem> {
    try {
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
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        // Mock creation for development preview
        const subject = (formData.get('subject') as string) || 'Untitled Letter';
        const letterType = (formData.get('letterType') as LetterType) || 'INCOMING';
        const category = (formData.get('category') as string) || 'General / Correspondence';
        const department_name =
          (formData.get('department_name') as string) ||
          (formData.get('department_id') as string) ||
          'General Administration';
        const confidentialityLevel =
          (formData.get('confidentialityLevel') as ConfidentialityLevel) || 'INTERNAL';
        const priority =
          (formData.get('priority') as LetterPriority) || 'NORMAL';
        const description = (formData.get('description') as string) || '';
        const sender = (formData.get('sender') as string) || '';
        const recipient = (formData.get('recipient') as string) || '';
        const file = formData.get('file') as File | null;

        const now = new Date();
        const refNum = `LMS/${letterType.slice(0, 3)}/2026/${String(
          Math.floor(100 + Math.random() * 900)
        )}`;

        const newLetter: LetterItem = {
          id: `ltr-${Date.now()}`,
          referenceNumber: refNum,
          registrationNumber: `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          subject,
          description,
          letterType,
          category,
          department_name,
          sender,
          recipient,
          created_by: 'You (Current User)',
          status: 'REGISTERED',
          confidentialityLevel,
          priority,
          dateReceived: letterType === 'INCOMING' ? 'Just now' : undefined,
          dateSent: letterType === 'OUTGOING' ? 'Just now' : undefined,
          file_name: file ? file.name : `${subject}.pdf`,
          file_size: file ? file.size : 1024 * 500,
          file_type: file ? file.type : 'application/pdf',
          created_at: now.toLocaleString(),
          updated_at: now.toLocaleString(),
          is_new: true,
        };

        // Simulate upload progress
        for (let i = 20; i <= 100; i += 20) {
          await new Promise((res) => setTimeout(res, 50));
          onProgress?.(i);
        }

        inMemoryLetters.unshift(newLetter);
        return newLetter;
      }
      throw error;
    }
  },

  /**
   * Upload an attachment to an existing letter
   */
  async uploadAttachment(
    id: string,
    formData: FormData
  ): Promise<{ message: string; version: string }> {
    try {
      const response = await api.post<{ message: string; version: string }>(
        `/letters/${id}/attachments`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return { message: 'Attachment uploaded successfully (Dev Mode)', version: 'v2.0' };
      }
      throw error;
    }
  },

  /**
   * Download letter attachment
   */
  async downloadAttachment(id: string, filename?: string): Promise<void> {
    try {
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
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const blob = new Blob([`SITA Letter Content placeholder for Ref: ${id}`], {
          type: 'text/plain',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `Letter_${id}.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
      throw error;
    }
  },

  /**
   * Archive a letter
   */
  async archiveLetter(id: string): Promise<{ message: string; letter: LetterItem }> {
    try {
      const response = await api.post<{ message: string; letter: LetterItem }>(
        `/letters/${id}/archive`
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const target = inMemoryLetters.find((l) => l.id === id);
        if (target) {
          target.status = 'ARCHIVED';
          return { message: 'Letter moved to archive', letter: target };
        }
      }
      throw error;
    }
  },

  /**
   * Get attachments for a letter
   */
  async getLetterAttachments(id: string): Promise<AttachmentItem[]> {
    try {
      const response = await api.get<AttachmentItem[]>(`/letters/${id}/attachments`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const letter = inMemoryLetters.find((l) => l.id === id);
        return letter?.attachments || [];
      }
      throw error;
    }
  },

  /**
   * Submit letter for approval
   */
  async submitForApproval(id: string): Promise<{ message: string; letter: LetterItem }> {
    try {
      const response = await api.post<{ message: string; letter: LetterItem }>(
        `/letters/${id}/submit`
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const target = inMemoryLetters.find((l) => l.id === id);
        if (target) {
          target.status = 'PENDING_APPROVAL';
          return { message: 'Letter submitted for approval', letter: target };
        }
      }
      throw error;
    }
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
    try {
      const response = await api.post<{ message: string; letter: LetterItem }>(
        `/letters/${id}/restore`
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const target = inMemoryLetters.find((l) => l.id === id);
        if (target) {
          target.status = 'APPROVED';
          return { message: 'Letter restored from archive', letter: target };
        }
      }
      throw error;
    }
  },
};

export default letterService;

import api from './api';
import {
  DocumentFilterParams,
  DocumentItem,
  PaginatedDocumentResponse,
} from '@/types/document';

/**
 * Mock Initial Documents Dataset for Dev Offline Mode
 */
const MOCK_DOCUMENTS: DocumentItem[] = [
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
    file_size: 2516582, // ~2.4 MB
    file_type: 'application/pdf',
    created_at: 'Today, 09:42 AM',
    updated_at: 'Today, 09:42 AM',
    tags: ['financial', 'q1', 'draft'],
    is_new: true,
  },
  {
    id: 'doc-2',
    documentNumber: 'ARC-2025-992',
    title: '2025_Archived_Policies.zip',
    description: 'Archived regulatory framework guidelines and official circulars',
    category: 'Legal / Archives',
    department_name: 'Legal Services',
    created_by: 'Tariku Bikila',
    status: 'APPROVED',
    securityLevel: 'INTERNAL',
    file_name: '2025_Archived_Policies.zip',
    file_size: 47290777, // ~45.1 MB
    file_type: 'application/zip',
    created_at: 'Yesterday, 16:30 PM',
    updated_at: 'Yesterday, 16:30 PM',
    tags: ['policy', 'archive'],
  },
  {
    id: 'doc-3',
    documentNumber: 'IMG-2026-045',
    title: 'New_Campus_Masterplan_v2.png',
    description: 'High resolution architectural site layout and zoning map for SITA innovation hub',
    category: 'Facilities / Planning',
    department_name: 'Public Works',
    created_by: 'Sara Jenkins',
    status: 'DRAFT',
    securityLevel: 'RESTRICTED',
    file_name: 'New_Campus_Masterplan_v2.png',
    file_size: 8598323, // ~8.2 MB
    file_type: 'image/png',
    created_at: 'Mar 28, 2026',
    updated_at: 'Mar 28, 2026',
    tags: ['masterplan', 'campus'],
    is_new: true,
  },
  {
    id: 'doc-4',
    documentNumber: 'HR-2026-001',
    title: 'Employee_Handbook_2026.pdf',
    description: 'Updated HR code of conduct, leave policies, and organizational structure',
    category: 'HR / Policies',
    department_name: 'Human Resources',
    created_by: 'Abebe Kebede',
    status: 'APPROVED',
    securityLevel: 'PUBLIC',
    file_name: 'Employee_Handbook_2026.pdf',
    file_size: 1153433, // ~1.1 MB
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
    status: 'REJECTED',
    securityLevel: 'INTERNAL',
    file_name: 'ICT_Infrastructure_Audit_Report.docx',
    file_size: 3460300, // ~3.3 MB
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: 'Mar 10, 2026',
    updated_at: 'Mar 10, 2026',
    tags: ['ict', 'audit'],
  },
];

let inMemoryDocuments = [...MOCK_DOCUMENTS];

export const documentService = {
  /**
   * Get paginated & filtered list of documents
   */
  async getDocuments(params?: DocumentFilterParams): Promise<PaginatedDocumentResponse> {
    try {
      const response = await api.get<PaginatedDocumentResponse>('/documents', { params });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        // Dev fallback mode
        let filtered = [...inMemoryDocuments];

        if (params?.search) {
          const query = params.search.toLowerCase();
          filtered = filtered.filter(
            (d) =>
              d.title.toLowerCase().includes(query) ||
              d.documentNumber.toLowerCase().includes(query) ||
              d.category.toLowerCase().includes(query)
          );
        }

        if (params?.category && params.category !== 'ALL') {
          filtered = filtered.filter((d) => d.category.toLowerCase().includes(params.category!.toLowerCase()));
        }

        if (params?.department_id && params.department_id !== 'ALL') {
          filtered = filtered.filter((d) => d.department_name.toLowerCase().includes(params.department_id!.toLowerCase()));
        }

        if (params?.status && params.status !== 'ALL') {
          filtered = filtered.filter((d) => d.status === params.status);
        }

        if (params?.securityLevel && params.securityLevel !== 'ALL') {
          filtered = filtered.filter((d) => d.securityLevel === params.securityLevel);
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
   * Search documents specifically by query
   */
  async searchDocuments(query: string, params?: DocumentFilterParams): Promise<PaginatedDocumentResponse> {
    return this.getDocuments({ ...params, search: query });
  },

  /**
   * Get single document by ID
   */
  async getDocumentById(id: string): Promise<DocumentItem> {
    try {
      const response = await api.get<DocumentItem>(`/documents/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const found = inMemoryDocuments.find((d) => d.id === id);
        if (found) return found;
      }
      throw error;
    }
  },

  /**
   * Create & upload new document
   */
  async createDocument(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<DocumentItem> {
    try {
      const response = await api.post<DocumentItem>('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        // Mock creation for development preview
        const title = (formData.get('title') as string) || 'Untitled_Document.pdf';
        const category = (formData.get('category') as string) || 'General / Documentation';
        const department_name = (formData.get('department_name') as string) || (formData.get('department_id') as string) || 'Public Works';
        const securityLevel = (formData.get('securityLevel') as any) || 'INTERNAL';
        const description = (formData.get('description') as string) || '';
        const file = formData.get('file') as File | null;

        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          documentNumber: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
          title: file ? file.name : title,
          description,
          category,
          department_name,
          created_by: 'You (Current User)',
          status: 'PENDING_APPROVAL',
          securityLevel,
          file_name: file ? file.name : `${title}.pdf`,
          file_size: file ? file.size : 1024 * 500,
          file_type: file ? file.type : 'application/pdf',
          created_at: 'Just now',
          updated_at: 'Just now',
          is_new: true,
        };

        // Simulate upload progress steps
        for (let i = 20; i <= 100; i += 20) {
          await new Promise((res) => setTimeout(res, 50));
          onProgress?.(i);
        }

        inMemoryDocuments.unshift(newDoc);
        return newDoc;
      }
      throw error;
    }
  },

  /**
   * Upload new version for existing document
   */
  async uploadVersion(id: string, formData: FormData): Promise<{ message: string; version: string }> {
    try {
      const response = await api.post<{ message: string; version: string }>(`/documents/${id}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return { message: 'Version uploaded successfully (Dev Mode)', version: 'v2.0' };
      }
      throw error;
    }
  },

  /**
   * Download document file
   */
  async downloadDocument(id: string, filename?: string): Promise<void> {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `document_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        // Fallback dummy download for dev
        const blob = new Blob([`SITA Document Content placeholder for ID: ${id}`], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `Document_${id}.txt`);
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
   * Archive a document
   */
  async archiveDocument(id: string): Promise<{ message: string; document: DocumentItem }> {
    try {
      const response = await api.post<{ message: string; document: DocumentItem }>(`/documents/${id}/archive`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const target = inMemoryDocuments.find((d) => d.id === id);
        if (target) {
          target.status = 'ARCHIVED';
          return { message: 'Document moved to archive', document: target };
        }
      }
      throw error;
    }
  },
};

export default documentService;

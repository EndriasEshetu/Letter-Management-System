import api from './api';
import { CommentItem, CreateCommentPayload } from '@/types/comment';

/* ─── Mock Comments Database (Dev Offline Fallback) ─────── */

let mockCommentsStore: Record<string, CommentItem[]> = {
  'doc-1': [
    {
      id: 'cmt-1',
      documentId: 'doc-1',
      author: {
        id: 101,
        name: 'Tigist Haile',
        role: 'Department Manager',
        department: 'Finance & Planning',
      },
      message: 'Please update section 4.2 financial projections before final approval.',
      createdAt: '2026-08-11T08:15:00Z',
    },
    {
      id: 'cmt-2',
      documentId: 'doc-1',
      author: {
        id: 102,
        name: 'Endrias Eshetu',
        role: 'Senior Finance Officer',
        department: 'Finance & Planning',
      },
      message: 'Revised numbers have been uploaded in version 3.0. Ready for review.',
      createdAt: '2026-08-11T09:30:00Z',
    },
  ],
  'doc-4': [
    {
      id: 'cmt-3',
      documentId: 'doc-4',
      author: {
        id: 103,
        name: 'Abebe Kebede',
        role: 'HR Manager',
        department: 'Human Resources',
      },
      message: 'This policy document applies to all SITA staff effective Q2 2026.',
      createdAt: '2026-08-10T14:00:00Z',
    },
  ],
};

export const commentService = {
  /**
   * Get list of comments for a document
   */
  async getComments(documentId: string): Promise<CommentItem[]> {
    try {
      const response = await api.get<CommentItem[]>(`/documents/${documentId}/comments`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 200));
        return mockCommentsStore[documentId] || [];
      }
      throw error;
    }
  },

  /**
   * Create a new comment for a document
   */
  async createComment(payload: CreateCommentPayload, currentUser?: { full_name?: string; role?: string; department_name?: string }): Promise<CommentItem> {
    try {
      const response = await api.post<CommentItem>(
        `/documents/${payload.documentId}/comments`,
        { message: payload.message }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 300));
        const newComment: CommentItem = {
          id: `cmt-${Date.now()}`,
          documentId: payload.documentId,
          author: {
            id: Date.now(),
            name: currentUser?.full_name || 'You',
            role: currentUser?.role === 'ADMIN' ? 'Administrator' : currentUser?.role === 'DEPARTMENT_MANAGER' ? 'Department Manager' : 'Employee',
            department: currentUser?.department_name || 'SITA',
          },
          message: payload.message,
          createdAt: new Date().toISOString(),
        };

        if (!mockCommentsStore[payload.documentId]) {
          mockCommentsStore[payload.documentId] = [];
        }
        mockCommentsStore[payload.documentId].push(newComment);
        return newComment;
      }
      throw error;
    }
  },
};

export default commentService;

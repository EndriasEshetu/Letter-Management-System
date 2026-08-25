import api from './api';
import { CommentItem, CreateCommentPayload } from '@/types/comment';

export const commentService = {
  /**
   * Get list of comments for a document via backend API
   */
  async getComments(documentId: string): Promise<CommentItem[]> {
    const response = await api.get<CommentItem[]>(`/documents/${documentId}/comments`);
    return response.data;
  },

  /**
   * Create a new comment for a document via backend API
   */
  async createComment(payload: CreateCommentPayload): Promise<CommentItem> {
    const response = await api.post<CommentItem>(
      `/documents/${payload.documentId}/comments`,
      { message: payload.message }
    );
    return response.data;
  },
};

export default commentService;

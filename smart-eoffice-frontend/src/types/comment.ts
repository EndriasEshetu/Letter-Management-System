export interface CommentAuthor {
  id: string | number;
  name: string;
  role?: string;
  department?: string;
  avatar?: string;
}

export interface CommentItem {
  id: string;
  documentId: string;
  author: CommentAuthor;
  message: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  documentId: string;
  message: string;
}

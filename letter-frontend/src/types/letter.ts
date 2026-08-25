import type { LetterStatus } from '@/components/common/Badge';
export type { LetterStatus };

/* ─── Letter Type ─────────────────────────────────────────── */

export type LetterType =
  | 'INCOMING'
  | 'OUTGOING'
  | 'INTERNAL'
  | 'OFFICIAL'
  | 'REQUEST'
  | 'RESPONSE'
  | 'ADMINISTRATIVE'
  | 'INVITATION'
  | 'NOTIFICATION'
  | 'MEMORANDUM'
  | 'CORRESPONDENCE';

/* ─── Confidentiality Level ─────────────────────────────────── */

export type ConfidentialityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

/* ─── Priority ──────────────────────────────────────────────── */

export type LetterPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

/* ─── Letter Item ───────────────────────────────────────────── */

export interface LetterItem {
  id: string;
  referenceNumber: string;
  registrationNumber?: string;
  subject: string;
  description?: string;
  letterType: LetterType;
  category: string;
  department_id?: number | string;
  department_name: string;
  originatingDepartment?: string;
  sender?: string;
  senderOrganization?: string;
  recipient?: string;
  recipientOrganization?: string;
  assignedEmployee?: string;
  created_by: string;
  author_id?: number | string;
  status: LetterStatus;
  confidentialityLevel: ConfidentialityLevel;
  priority?: LetterPriority;
  dateReceived?: string;
  dateSent?: string;
  dueDate?: string;
  responseRequired?: boolean;
  responseDeadline?: string;
  relatedLetterId?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  is_new?: boolean;
  attachments?: AttachmentItem[];
}

/* ─── Attachment Item ───────────────────────────────────────── */

export interface AttachmentItem {
  id: string;
  versionNumber: string;
  uploadedBy: string;
  date: string;
  fileSize?: number;
  fileName?: string;
  isCurrent?: boolean;
}

/* ─── Filter Params ─────────────────────────────────────────── */

export interface LetterFilterParams {
  search?: string;
  letterType?: string;
  category?: string;
  department_id?: string;
  status?: string;
  confidentialityLevel?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

/* ─── Paginated Response ────────────────────────────────────── */

export interface PaginatedLetterResponse {
  data: LetterItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import type { LetterStatus } from '@/components/common/Badge';
export type { LetterStatus };

/* ─── Letter Direction ───────────────────────────────────────── */

export type LetterDirection = 'INCOMING' | 'OUTGOING' | 'INTERNAL';

/* ─── Letter Type (Business Classification) ───────────────────── */

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

/* ─── Task Status ────────────────────────────────────────────── */

export type TaskStatus =
  | 'ASSIGNED'
  | 'PENDING_ACTION'
  | 'IN_PROGRESS'
  | 'RESPONSE_REQUIRED'
  | 'OVERDUE'
  | 'COMPLETED';

/* ─── Confidentiality Level ─────────────────────────────────── */

export type ConfidentialityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

/* ─── Priority ──────────────────────────────────────────────── */

export type LetterPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

/* ─── Letter Assignment Model ────────────────────────────────── */

export interface LetterAssignment {
  assignedDepartment: string;
  assignedUser?: string;
  officerName?: string;
  assignedUserId?: string | number;
  assignedBy?: string;
  assignmentDate?: string;
  assignedAt?: string;
  dueDate?: string;
  instructions?: string;
  priority?: LetterPriority;
  taskStatus: TaskStatus;
  completionDate?: string;
}

/* ─── Dispatch Information ───────────────────────────────────── */

export interface LetterDispatch {
  dispatchNumber?: string;
  dispatchDate?: string;
  dispatchMethod: 'OFFICIAL_EMAIL' | 'COURIER' | 'POSTAL_SERVICE' | 'HAND_DELIVERY' | 'OTHER';
  recipientName: string;
  recipientOrganization: string;
  sentBy: string;
  courierReferenceNumber?: string;
  deliveryConfirmation?: boolean;
  deliveryDate?: string;
  evidenceFileName?: string;
}

/* ─── Timeline / Movement Event ────────────────────────────── */

export interface LetterMovement {
  id: string;
  actorName: string;
  actorRole?: string;
  action: string;
  timestamp: string;
  previousStatus?: LetterStatus | string;
  newStatus?: LetterStatus | string;
  department?: string;
  fromDepartment?: string;
  toDepartment?: string;
  performedBy?: string;
  assignedUser?: string;
  comment?: string;
  notes?: string;
}

/* ─── Related Letter Reference ────────────────────────────── */

export interface LetterRelation {
  id: string;
  referenceNumber: string;
  registrationNumber?: string;
  subject: string;
  direction: LetterDirection;
  relationshipType: 'RESPONSE_TO' | 'HAS_RESPONSE' | 'REFERENCES' | 'PARENT_MEMO';
}

/* ─── Archive Metadata ─────────────────────────────────────── */

export interface ArchiveInfo {
  archiveReference: string;
  archivedBy: string;
  archivedDate: string;
  retentionCategory?: string;
  retentionPeriodYears?: number;
  archiveBoxNumber?: string;
}

/* ─── Letter Item ───────────────────────────────────────────── */

export interface LetterItem {
  id: string;
  direction: LetterDirection;
  referenceNumber: string;
  registrationNumber?: string;
  externalReferenceNumber?: string;
  outgoingReferenceNumber?: string;
  subject: string;
  description?: string;
  letterType: LetterType;
  category: string;
  department_id?: number | string;
  department_name: string;
  originatingDepartment?: string;
  targetDepartment?: string;
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
  relatedLetters?: LetterRelation[];
  assignment?: LetterAssignment;
  assignments?: LetterAssignment[];
  dispatch?: LetterDispatch;
  dispatchInfo?: LetterDispatch;
  movements?: LetterMovement[];
  archiveInfo?: ArchiveInfo;
  currentDepartment?: string;
  currentResponsibleUser?: string;
  currentTask?: string;
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
  direction?: LetterDirection | 'ALL';
  letterType?: string;
  category?: string;
  department_id?: string;
  status?: string;
  taskStatus?: TaskStatus | 'ALL';
  confidentialityLevel?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  sender?: string;
  recipient?: string;
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


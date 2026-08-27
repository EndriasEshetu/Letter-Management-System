/**
 * Helpers + serializers that map database rows to the exact JSON shapes
 * expected by smart-eoffice-frontend (see src/types/* in the frontend).
 */

/* ─── Date formatting ────────────────────────────────────── */

/** Human-readable date for display fields (documents.created_at etc.). */
export function formatDisplayDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** ISO timestamp for fields the frontend parses with `new Date()` (approvals etc.). */
export function toIso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

/* ─── Row types (mirror DB columns) ──────────────────────── */

export interface DepartmentRow {
  id: number;
  name: string;
  code: string;
  description: string | null;
  manager_id: number | null;
  manager_name: string | null;
  member_count: number;
  created_at: Date;
}

export interface UserRow {
  id: number;
  auth_uid: string;
  full_name: string;
  email: string;
  phone: string | null;
  job_title: string | null;
  role: 'ADMIN' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE' | 'REGISTRY_OFFICER';
  department_id: number | null;
  department_name: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  is_active: boolean;
}

export interface DocumentRow {
  id: number;
  document_number: string;
  title: string;
  description: string | null;
  category: string;
  department_id: number | null;
  department_name: string | null;
  created_by: string;
  author_id: number | null;
  status: string;
  security_level: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  tags: string[] | null;
  version: string | null;
  is_new: boolean;
  response_to_id?: number | null;
  dispatch_method?: string | null;
  tracking_number?: string | null;
  dispatch_date?: Date | null;
  delivered_at?: Date | null;
  assignment_instructions?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface VersionRow {
  id: number;
  document_id: number;
  version_number: string;
  uploaded_by: string;
  uploaded_by_id: number | null;
  date: Date;
  file_size: number | null;
  file_name: string | null;
  storage_path: string;
  is_current: boolean;
}

/* ─── Serializers ────────────────────────────────────────── */

export function serializeDepartment(row: DepartmentRow) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description ?? undefined,
    manager_id: row.manager_id ?? undefined,
    manager_name: row.manager_name ?? undefined,
    member_count: row.member_count,
    created_at: formatDisplayDate(row.created_at),
  };
}

export function serializeUser(row: UserRow) {
  const departmentName = row.department_name ?? undefined;
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone ?? undefined,
    job_title: row.job_title ?? undefined,
    role: row.role,
    department_id: row.department_id ?? null,
    department_name: departmentName,
    department: row.department_id ? { id: row.department_id, name: departmentName ?? '' } : null,
    status: row.status,
    is_active: row.is_active,
  };
}

/** Shape stored in `sita_auth_user` (AuthUser) and returned by /auth/me. */
export function serializeAuthUser(row: UserRow) {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    department_id: row.department_id ?? null,
    department_name: row.department_name ?? undefined,
    phone: row.phone ?? undefined,
    job_title: row.job_title ?? undefined,
    status: row.status,
    is_active: row.is_active,
  };
}

export function serializeVersion(v: VersionRow) {
  return {
    id: String(v.id),
    versionNumber: v.version_number,
    uploadedBy: v.uploaded_by,
    date: formatDisplayDate(v.date),
    fileSize: v.file_size ?? undefined,
    fileName: v.file_name ?? undefined,
    isCurrent: v.is_current,
  };
}

export function serializeDocument(row: DocumentRow & { letter_type?: string; sender?: string; sender_organization?: string; recipient?: string; recipient_organization?: string; registration_number?: string; date_received?: Date; date_sent?: Date; due_date?: Date; originating_department?: string; assigned_employee?: string; priority?: string; response_required?: boolean }, versions?: VersionRow[]) {
  const rawLetterType = (row as any).letter_type;
  const letterType = rawLetterType || derivLetterTypeFromCategory(row.category);

  return {
    id: String(row.id),
    
    // Document shape properties (legacy)
    documentNumber: row.document_number,
    title: row.title,
    securityLevel: row.security_level,
    version: row.version ?? undefined,
    
    // Letter shape properties (frontend)
    // direction is the same semantic value as letterType (INCOMING/OUTGOING/INTERNAL)
    direction: letterType as 'INCOMING' | 'OUTGOING' | 'INTERNAL',
    referenceNumber: row.document_number,
    registrationNumber: (row as any).registration_number ?? undefined,
    subject: row.title,
    letterType,
    confidentialityLevel: row.security_level as 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED',
    priority: (row as any).priority ?? 'NORMAL',
    originatingDepartment: (row as any).originating_department ?? undefined,
    sender: (row as any).sender ?? undefined,
    senderOrganization: (row as any).sender_organization ?? undefined,
    recipient: (row as any).recipient ?? undefined,
    recipientOrganization: (row as any).recipient_organization ?? undefined,
    assignedEmployee: (row as any).assigned_employee ?? undefined,
    dateReceived: formatDisplayDate((row as any).date_received),
    dateSent: formatDisplayDate((row as any).date_sent),
    dueDate: formatDisplayDate((row as any).due_date),
    responseRequired: (row as any).response_required ?? false,
    responseToId: row.response_to_id ? String(row.response_to_id) : undefined,
    dispatchMethod: row.dispatch_method ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    dispatchDate: formatDisplayDate(row.dispatch_date),
    deliveredAt: formatDisplayDate(row.delivered_at),
    assignmentInstructions: row.assignment_instructions ?? undefined,

    // Shared properties
    description: row.description ?? undefined,
    category: row.category,
    department_id: row.department_id ?? undefined,
    department_name: row.department_name ?? '',
    created_by: row.created_by,
    author_id: row.author_id ? String(row.author_id) : undefined,
    status: row.status,
    file_name: row.file_name,
    file_size: row.file_size,
    file_type: row.file_type,
    created_at: formatDisplayDate(row.created_at),
    updated_at: formatDisplayDate(row.updated_at),
    tags: row.tags ?? [],
    is_new: row.is_new,
    
    // Attachments & Versions
    ...(versions ? { 
      versions: versions.map(serializeVersion),
      attachments: versions.map((v) => ({
        id: String(v.id),
        versionNumber: v.version_number,
        uploadedBy: v.uploaded_by,
        date: formatDisplayDate(v.date),
        fileSize: v.file_size ?? undefined,
        fileName: v.file_name ?? undefined,
        isCurrent: v.is_current,
      }))
    } : {}),
  };
}

/* ─── Misc helpers ───────────────────────────────────────── */

export function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Resolve a department reference sent by the frontend (name string or numeric id). */
export function normalizeDepartmentParam(value: unknown): {
  id?: number;
  name?: string;
} {
  if (value == null || value === '' || value === 'ALL') return {};
  const n = Number(value);
  if (Number.isFinite(n) && String(value).trim() !== '' && String(value).trim() === String(n)) {
    return { id: n };
  }
  return { name: String(value).toLowerCase() };
}

export function serializeLetter(row: DocumentRow & { letter_type?: string; sender?: string; sender_organization?: string; recipient?: string; recipient_organization?: string; registration_number?: string; date_received?: Date; date_sent?: Date; due_date?: Date; originating_department?: string; assigned_employee?: string; priority?: string; response_required?: boolean; response_deadline?: Date }, versions?: VersionRow[]) {
  // Derive letterType: stored in category field or a dedicated letter_type column if present
  const rawLetterType = (row as any).letter_type as string | undefined;
  const letterType = rawLetterType || derivLetterTypeFromCategory(row.category);

  return {
    id: String(row.id),
    referenceNumber: row.document_number,
    registrationNumber: (row as any).registration_number ?? undefined,
    subject: row.title,
    description: row.description ?? undefined,
    letterType,
    category: row.category,
    department_id: row.department_id ?? undefined,
    department_name: (row as any).department_name ?? '',
    originatingDepartment: (row as any).originating_department ?? undefined,
    sender: (row as any).sender ?? undefined,
    senderOrganization: (row as any).sender_organization ?? undefined,
    recipient: (row as any).recipient ?? undefined,
    recipientOrganization: (row as any).recipient_organization ?? undefined,
    assignedEmployee: (row as any).assigned_employee ?? undefined,
    created_by: row.created_by,
    author_id: row.author_id ? String(row.author_id) : undefined,
    status: row.status,
    confidentialityLevel: row.security_level as 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED',
    priority: ((row as any).priority as string | undefined) ?? 'NORMAL',
    dateReceived: formatDisplayDate((row as any).date_received),
    dateSent: formatDisplayDate((row as any).date_sent),
    dueDate: formatDisplayDate((row as any).due_date),
    responseRequired: (row as any).response_required ?? false,
    file_name: row.file_name,
    file_size: row.file_size,
    file_type: row.file_type,
    created_at: formatDisplayDate(row.created_at),
    updated_at: formatDisplayDate(row.updated_at),
    tags: row.tags ?? [],
    is_new: row.is_new,
    ...(versions ? {
      attachments: versions.map((v) => ({
        id: String(v.id),
        versionNumber: v.version_number,
        uploadedBy: v.uploaded_by,
        date: formatDisplayDate(v.date),
        fileSize: v.file_size ?? undefined,
        fileName: v.file_name ?? undefined,
        isCurrent: v.is_current,
      }))
    } : {}),
  };
}

/** Derive a letter type from a category string for backward-compatibility. */
function derivLetterTypeFromCategory(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('incoming') || lower.includes('in/')) return 'INCOMING';
  if (lower.includes('outgoing') || lower.includes('out/')) return 'OUTGOING';
  if (lower.includes('memo') || lower.includes('memorandum')) return 'MEMORANDUM';
  if (lower.includes('request')) return 'REQUEST';
  if (lower.includes('invitation')) return 'INVITATION';
  if (lower.includes('notification')) return 'NOTIFICATION';
  if (lower.includes('response') || lower.includes('reply')) return 'RESPONSE';
  if (lower.includes('internal')) return 'INTERNAL';
  return 'OFFICIAL';
}

/** Split a comma-separated tags string from a multipart form into an array. */
export function splitTags(raw: unknown): string[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

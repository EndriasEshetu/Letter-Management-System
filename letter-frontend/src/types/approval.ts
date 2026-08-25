import { LetterItem } from '@/types/letter';

/* ─── Priority ───────────────────────────────────────────── */

export type ApprovalPriority = 'HIGH' | 'NORMAL';

/* ─── Approval Status ───────────────────────────────────── */

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export type ApprovalContext = 'OUTGOING_REVIEW' | 'RESPONSE_REVIEW' | 'INTERNAL_REVIEW';

/* ─── Approval Request ──────────────────────────────────── */

export interface ApprovalRequest {
  id: string;
  letter: LetterItem;
  approvalContext?: ApprovalContext;
  letterDirection?: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  submitter_name: string;
  submitter_email?: string;
  submitter_role?: string;
  submitter_department?: string;
  priority: ApprovalPriority;
  status: ApprovalStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_name?: string;
  comment?: string;
  page_count?: number;
}

/* ─── Approval Action Payloads ──────────────────────────── */

export interface ApprovePayload {
  letter_id: string;
  comment?: string;
}

export interface RejectPayload {
  letter_id: string;
  reason: string;
}

export interface RequestChangesPayload {
  letter_id: string;
  reason: string;
}

/* ─── Approval Metrics ───────────────────────────────────── */

export interface ApprovalMetrics {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  changes_requested_count: number;
  approval_rate_percent: number | null;
  avg_turnaround_hours: number | null;
}

/* ─── Approval Activity ─────────────────────────────────── */

export type ActivityAction = 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'SUBMITTED';

export interface ApprovalActivity {
  id: string;
  action: ActivityAction;
  letter_subject: string;
  letter_id: string;
  user_name: string;
  timestamp: string;
}

/* ─── Filter Tab ─────────────────────────────────────────── */

export type ApprovalFilterTab = 'ALL' | 'HIGH_PRIORITY' | 'REVIEWED';

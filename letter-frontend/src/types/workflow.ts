import { LetterDirection, LetterStatus } from './letter';
import { Role } from './auth';

export interface WorkflowStepDef {
  stepNumber: number;
  id: string;
  name: string;
  actorRole: Role | 'EXTERNAL_SENDER' | 'EXTERNAL_RECIPIENT';
  actorLabel: string;
  description: string;
  possibleStatuses: LetterStatus[];
  actions: string[];
}

export type WorkflowAction =
  | 'REGISTER'
  | 'ROUTE_TO_ADMIN'
  | 'ROUTE_TO_DEPARTMENT'
  | 'ASSIGN_OFFICER'
  | 'PROCESS_LETTER'
  | 'PREPARE_RESPONSE'
  | 'SUBMIT_FOR_REVIEW'
  | 'APPROVE'
  | 'REQUEST_CHANGES'
  | 'REJECT'
  | 'REGISTER_OUTGOING'
  | 'DISPATCH'
  | 'CONFIRM_DELIVERY'
  | 'MARK_COMPLETED'
  | 'ARCHIVE'
  | 'RESTORE';

/* ─── Allowed Status Transitions per Direction ─────────────────── */

export const INCOMING_STATUS_FLOW: LetterStatus[] = [
  'REGISTERED',
  'RECEIVED',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'PENDING_APPROVAL',
  'APPROVED',
  'READY_FOR_DISPATCH',
  'DISPATCHED',
  'COMPLETED',
  'ARCHIVED',
];

export const OUTGOING_STATUS_FLOW: LetterStatus[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'CHANGES_REQUESTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'REGISTERED',
  'READY_FOR_DISPATCH',
  'DISPATCHED',
  'DELIVERED',
  'COMPLETED',
  'ARCHIVED',
];

export const INTERNAL_STATUS_FLOW: LetterStatus[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'REGISTERED',
  'RECEIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'ARCHIVED',
];

/* ─── Workflow Step Definitions ───────────────────────────── */

export const WORKFLOW_STEPS_INCOMING: WorkflowStepDef[] = [
  {
    stepNumber: 1,
    id: 'receipt_registration',
    name: 'Receipt & Registration',
    actorRole: 'REGISTRY_OFFICER',
    actorLabel: 'Registry Officer',
    description: 'Receive, verify, scan/upload, assign registration number, classify, set priority & confidentiality, route to Main Administrator.',
    possibleStatuses: ['REGISTERED'],
    actions: ['REGISTER', 'ROUTE_TO_ADMIN'],
  },
  {
    stepNumber: 2,
    id: 'admin_routing',
    name: 'Administrative Routing',
    actorRole: 'ADMIN',
    actorLabel: 'Main Administrator',
    description: 'Review registration info, determine destination department, and route letter to appropriate department manager.',
    possibleStatuses: ['RECEIVED'],
    actions: ['ROUTE_TO_DEPARTMENT'],
  },
  {
    stepNumber: 3,
    id: 'dept_assignment',
    name: 'Department Assignment',
    actorRole: 'DEPARTMENT_MANAGER',
    actorLabel: 'Department Manager',
    description: 'Review incoming letter, select responsible officer, provide instructions, and set response deadline.',
    possibleStatuses: ['IN_PROGRESS'],
    actions: ['ASSIGN_OFFICER'],
  },
  {
    stepNumber: 4,
    id: 'officer_processing',
    name: 'Officer Action & Response',
    actorRole: 'EMPLOYEE',
    actorLabel: 'Assigned Officer',
    description: 'Process requested action. If response is required, prepare outgoing response draft and submit to manager.',
    possibleStatuses: ['IN_PROGRESS', 'PENDING_REVIEW'],
    actions: ['PROCESS_LETTER', 'PREPARE_RESPONSE', 'SUBMIT_FOR_REVIEW'],
  },
  {
    stepNumber: 5,
    id: 'manager_response_review',
    name: 'Response Approval',
    actorRole: 'DEPARTMENT_MANAGER',
    actorLabel: 'Department Manager',
    description: 'Review prepared response letter. Approve, request revisions, or reject response.',
    possibleStatuses: ['PENDING_APPROVAL', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'],
    actions: ['APPROVE', 'REQUEST_CHANGES', 'REJECT'],
  },
  {
    stepNumber: 6,
    id: 'response_dispatch',
    name: 'Response Dispatch',
    actorRole: 'REGISTRY_OFFICER',
    actorLabel: 'Registry / Dispatch Officer',
    description: 'Register outgoing response, assign outgoing reference number, record dispatch date & method, dispatch response.',
    possibleStatuses: ['READY_FOR_DISPATCH', 'DISPATCHED'],
    actions: ['REGISTER_OUTGOING', 'DISPATCH'],
  },
  {
    stepNumber: 7,
    id: 'completion_archival',
    name: 'Completion & Archival',
    actorRole: 'ADMIN',
    actorLabel: 'Administrator',
    description: 'Mark correspondence workflow complete, file in official archives, apply retention rules.',
    possibleStatuses: ['COMPLETED', 'ARCHIVED'],
    actions: ['MARK_COMPLETED', 'ARCHIVE'],
  },
];

export const WORKFLOW_STEPS_OUTGOING: WorkflowStepDef[] = [
  {
    stepNumber: 1,
    id: 'draft_creation',
    name: 'Draft Creation',
    actorRole: 'EMPLOYEE',
    actorLabel: 'Requesting Officer',
    description: 'Create outgoing draft, fill recipient details, attach supporting files, set priority & confidentiality, submit for manager review.',
    possibleStatuses: ['DRAFT'],
    actions: ['SUBMIT_FOR_REVIEW'],
  },
  {
    stepNumber: 2,
    id: 'dept_review',
    name: 'Department Review & Sign-Off',
    actorRole: 'DEPARTMENT_MANAGER',
    actorLabel: 'Department Manager',
    description: 'Verify letter content, recipient, attachments. Approve or request changes.',
    possibleStatuses: ['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'],
    actions: ['APPROVE', 'REQUEST_CHANGES'],
  },
  {
    stepNumber: 3,
    id: 'admin_registration',
    name: 'Admin Verification & Registration',
    actorRole: 'ADMIN',
    actorLabel: 'Main Administrator',
    description: 'Verify administrative info, confirm required sign-offs, assign official outgoing reference number (e.g. OUT/2026/00891), route to dispatch.',
    possibleStatuses: ['REGISTERED'],
    actions: ['REGISTER_OUTGOING'],
  },
  {
    stepNumber: 4,
    id: 'dispatch_delivery',
    name: 'Dispatch & Delivery Tracking',
    actorRole: 'REGISTRY_OFFICER',
    actorLabel: 'Registry / Dispatch Officer',
    description: 'Record dispatch method, dispatch date, courier reference, upload delivery evidence when available.',
    possibleStatuses: ['READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED'],
    actions: ['DISPATCH', 'CONFIRM_DELIVERY'],
  },
  {
    stepNumber: 5,
    id: 'completion_archival',
    name: 'Completion & Archival',
    actorRole: 'ADMIN',
    actorLabel: 'Administrator',
    description: 'Confirm delivery, mark completed, move to central archive.',
    possibleStatuses: ['COMPLETED', 'ARCHIVED'],
    actions: ['MARK_COMPLETED', 'ARCHIVE'],
  },
];

export const WORKFLOW_STEPS_INTERNAL: WorkflowStepDef[] = [
  {
    stepNumber: 1,
    id: 'internal_creation',
    name: 'Create Internal Letter',
    actorRole: 'EMPLOYEE',
    actorLabel: 'Sending Officer',
    description: 'Select destination department/unit, set subject, content, attachments, priority, submit to sending manager.',
    possibleStatuses: ['DRAFT'],
    actions: ['SUBMIT_FOR_REVIEW'],
  },
  {
    stepNumber: 2,
    id: 'sending_manager_review',
    name: 'Sending Manager Approval',
    actorRole: 'DEPARTMENT_MANAGER',
    actorLabel: 'Sending Department Manager',
    description: 'Review internal communication, request changes, or approve for transmission.',
    possibleStatuses: ['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'],
    actions: ['APPROVE', 'REQUEST_CHANGES'],
  },
  {
    stepNumber: 3,
    id: 'admin_routing',
    name: 'Admin Registration & Routing',
    actorRole: 'ADMIN',
    actorLabel: 'Main Administrator',
    description: 'Verify destination, assign internal reference number (e.g. INT/2026/00317), route to receiving department.',
    possibleStatuses: ['REGISTERED'],
    actions: ['ROUTE_TO_DEPARTMENT'],
  },
  {
    stepNumber: 4,
    id: 'receiving_assignment',
    name: 'Receiving Manager Assignment',
    actorRole: 'DEPARTMENT_MANAGER',
    actorLabel: 'Receiving Department Manager',
    description: 'Receive internal letter, assign to officer, set instructions & deadline.',
    possibleStatuses: ['RECEIVED', 'IN_PROGRESS'],
    actions: ['ASSIGN_OFFICER'],
  },
  {
    stepNumber: 5,
    id: 'receiving_action',
    name: 'Officer Action & Results',
    actorRole: 'EMPLOYEE',
    actorLabel: 'Receiving Officer',
    description: 'Process request, attach supporting results, complete assigned task.',
    possibleStatuses: ['IN_PROGRESS'],
    actions: ['PROCESS_LETTER', 'MARK_COMPLETED'],
  },
  {
    stepNumber: 6,
    id: 'completion_review',
    name: 'Completion Review & Archival',
    actorRole: 'DEPARTMENT_MANAGER',
    actorLabel: 'Department Manager / Admin',
    description: 'Verify request was properly handled, close internal workflow, move to archive.',
    possibleStatuses: ['COMPLETED', 'ARCHIVED'],
    actions: ['MARK_COMPLETED', 'ARCHIVE'],
  },
];

/**
 * Helper to get workflow steps by direction
 */
export function getWorkflowSteps(direction: LetterDirection): WorkflowStepDef[] {
  switch (direction) {
    case 'INCOMING':
      return WORKFLOW_STEPS_INCOMING;
    case 'OUTGOING':
      return WORKFLOW_STEPS_OUTGOING;
    case 'INTERNAL':
      return WORKFLOW_STEPS_INTERNAL;
    default:
      return WORKFLOW_STEPS_INCOMING;
  }
}

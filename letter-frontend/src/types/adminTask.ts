export type AdminTaskType =
  | "ROUTE_INCOMING"
  | "REGISTER_OUTGOING"
  | "REGISTER_INTERNAL"
  | "ROUTE_INTERNAL"
  | "REVIEW_REGISTRATION"
  | "PREPARE_DISPATCH"
  | "DISPATCH_EXCEPTION"
  | "DELIVERY_EXCEPTION"
  | "RESPONSE_REVIEW"
  | "ADMINISTRATIVE_REQUEST"
  | "WORKFLOW_ESCALATION"
  | "OVERDUE_ACTION";

export type AdminTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "CLAIMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export interface AdminTask {
  id: string;
  type: AdminTaskType;
  title: string;
  description?: string;
  actionRequired: string;
  status: AdminTaskStatus;
  
  letter: {
    id: string;
    referenceNumber: string;
    type: string;
    status: string;
    subject: string;
    sender?: string;
    recipient?: string;
    priority: string;
    department?: string;
    createdBy: string;
  };
  
  requestedBy: {
    id?: string;
    name?: string;
    role?: string;
  };
  
  sourceDepartment: {
    id?: string;
    name?: string;
  };
  
  targetDepartment: {
    id?: string;
    name?: string;
  };
  
  assignedTo?: string;
  
  priority: string;
  dueDate?: string;
  isOverdue: boolean;
  daysRemaining?: number;
  hoursRemaining?: number;
  slaHours?: number;
  
  workflow: {
    previousStep: string;
    currentStep: string;
    nextStep: string;
  };
  
  permissions: {
    canExecute: boolean;
    canClaim: boolean;
    canCancel: boolean;
  };
  
  claimedBy?: string;
  claimedAt?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Legacy fields for backward compatibility
  letter_id?: string;
  letter_type?: string;
  letter_reference?: string;
  subject?: string;
  sender_legacy?: string;
  source_department?: string;
  requested_by?: string;
  requested_by_role?: string;
  letter_status?: string;
  workflow_stage?: string;
  previous_actor?: string;
  next_actor?: string;
  action_required?: string;
  reason?: string;
}

export interface AdminTaskResponse {
  data: AdminTask[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminTaskSummary {
  total: number;
  pending: number;
  inProgress: number;
  claimed: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
  urgent: number;
  high: number;
  byType: Record<string, number>;
}

export type AdminTaskType =
  | "ROUTE_INCOMING"
  | "REGISTER_OUTGOING"
  | "ROUTE_INTERNAL";

export interface AdminTask {
  id: string;
  letter_id: string;
  type: AdminTaskType;
  action_required: string;
  reason: string;
  letter_type: "INCOMING" | "OUTGOING" | "INTERNAL";
  letter_reference: string;
  subject: string;
  sender?: string;
  recipient?: string;
  source_department?: string;
  requested_by: string;
  requested_by_role: string;
  letter_status: string;
  priority?: string;
  confidentiality?: string;
  created_at: string;
  due_date?: string;
  workflow_stage: string;
  previous_actor: string;
  next_actor: string;
  is_overdue: boolean;
}

export interface AdminTaskResponse {
  data: AdminTask[];
  summary: {
    total: number;
    requiresAction: number;
    dueToday: number;
    overdue: number;
  };
}

import React from "react";
import Badge, { LetterStatus } from "@/components/common/Badge";
import { LetterDirection } from "@/types/letter";

export interface LetterTimelineProps {
  currentStatus: LetterStatus | string;
  direction?: LetterDirection | string;
  /** @deprecated Use direction instead */
  letterType?: string;
  rejectionReason?: string;
  timestamps?: {
    created_at?: string;
    registered_at?: string;
    routed_at?: string;
    assigned_at?: string;
    reviewed_at?: string;
    approved_at?: string;
    dispatched_at?: string;
    completed_at?: string;
  };
  className?: string;
}

type StepState = "completed" | "active" | "rejected" | "upcoming";

interface StepDef {
  id: number;
  title: string;
  subtitle: string;
  state: StepState;
  timestamp?: string;
}

/* ─── Direction-Specific Stage Maps ───────────────────────── */

const INCOMING_STAGES: Record<string, number> = {
  DRAFT: 1,
  REGISTERED: 1,
  RECEIVED: 2,
  IN_PROGRESS: 3,
  RESPONSE_REQUIRED: 3,
  COMPLETED: 4,
  ARCHIVED: 4,
};

const OUTGOING_STAGES: Record<string, number> = {
  DRAFT: 1,
  PENDING_REVIEW: 2,
  CHANGES_REQUESTED: 2,
  PENDING_APPROVAL: 3,
  APPROVED: 3,
  REGISTERED: 4,
  READY_FOR_DISPATCH: 4,
  DISPATCHED: 5,
  DELIVERED: 5,
  COMPLETED: 6,
  ARCHIVED: 6,
  REJECTED: 3,
};

const INTERNAL_STAGES: Record<string, number> = {
  DRAFT: 1,
  PENDING_REVIEW: 2,
  CHANGES_REQUESTED: 2,
  PENDING_APPROVAL: 2,
  APPROVED: 2,
  REGISTERED: 3,
  RECEIVED: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
  ARCHIVED: 5,
  REJECTED: 2,
};

const getStage = (status: string, dir: string): number => {
  const norm = status.toUpperCase();
  if (dir === "OUTGOING") return OUTGOING_STAGES[norm] ?? 1;
  if (dir === "INTERNAL") return INTERNAL_STAGES[norm] ?? 1;
  return INCOMING_STAGES[norm] ?? 1;
};

const isTerminated = (status: string): boolean =>
  ["REJECTED", "CHANGES_REQUESTED"].includes(status.toUpperCase());

/* ─── Direction-Specific Step Builders ────────────────────── */

const buildIncomingSteps = (
  norm: string,
  stepState: (n: number) => StepState,
  ts: LetterTimelineProps["timestamps"],
): StepDef[] => [
  {
    id: 1,
    title: "Reception & Registration",
    subtitle:
      stepState(1) === "completed"
        ? "Scanned and registered by Registry"
        : stepState(1) === "active"
          ? "Registry Officer registering letter"
          : "Awaiting receipt",
    state: stepState(1),
    timestamp: ts?.registered_at || ts?.created_at,
  },
  {
    id: 2,
    title: "Admin Routing",
    subtitle:
      stepState(2) === "completed"
        ? "Routed to department by Main Administrator"
        : stepState(2) === "active"
          ? "Awaiting Main Administrator routing decision"
          : "Pending registration",
    state: stepState(2),
    timestamp: ts?.routed_at,
  },
  {
    id: 3,
    title: "Department Processing",
    subtitle:
      stepState(3) === "completed"
        ? "Assigned officer has processed the letter"
        : stepState(3) === "active"
          ? "Officer processing / preparing response"
          : stepState(3) === "rejected"
            ? "Changes requested on officer response"
            : "Pending routing",
    state: stepState(3),
    timestamp: ts?.assigned_at,
  },
  {
    id: 4,
    title: "Completion & Archival",
    subtitle:
      norm === "ARCHIVED"
        ? "Archived in official records"
        : stepState(4) === "completed"
          ? "Completed and filed"
          : "Final archival",
    state: stepState(4),
    timestamp: ts?.completed_at,
  },
];

const buildOutgoingSteps = (
  norm: string,
  stepState: (n: number) => StepState,
  ts: LetterTimelineProps["timestamps"],
): StepDef[] => [
  {
    id: 1,
    title: "Draft Creation",
    subtitle:
      stepState(1) === "completed"
        ? "Letter drafted by officer"
        : "Officer preparing draft",
    state: stepState(1),
    timestamp: ts?.created_at,
  },
  {
    id: 2,
    title: "Department Manager Review",
    subtitle:
      stepState(2) === "completed"
        ? "Reviewed and endorsed by Manager"
        : stepState(2) === "active"
          ? "Awaiting manager review & endorsement"
          : stepState(2) === "rejected"
            ? "Returned with requested changes"
            : "Pending draft",
    state: stepState(2),
    timestamp: ts?.reviewed_at,
  },
  {
    id: 3,
    title: "Main Admin Approval",
    subtitle:
      stepState(3) === "completed"
        ? "Approved and assigned official ref number"
        : stepState(3) === "active"
          ? "Awaiting Main Administrator approval"
          : stepState(3) === "rejected"
            ? "Rejected by Main Administrator"
            : "Pending manager review",
    state: stepState(3),
    timestamp: ts?.approved_at,
  },
  {
    id: 4,
    title: "Registration & Numbering",
    subtitle:
      stepState(4) === "completed"
        ? "Official OUT reference assigned"
        : stepState(4) === "active"
          ? "Assigning official reference number"
          : "Pending approval",
    state: stepState(4),
    timestamp: ts?.registered_at,
  },
  {
    id: 5,
    title: "Dispatch & Delivery",
    subtitle:
      norm === "DELIVERED"
        ? "Delivery confirmed"
        : stepState(5) === "completed"
          ? "Dispatched to recipient"
          : stepState(5) === "active"
            ? "Ready for dispatch"
            : "Pending registration",
    state: stepState(5),
    timestamp: ts?.dispatched_at,
  },
  {
    id: 6,
    title: "Completion & Archival",
    subtitle:
      norm === "ARCHIVED"
        ? "Archived in official records"
        : stepState(6) === "completed"
          ? "Completed and filed"
          : "Final archival",
    state: stepState(6),
    timestamp: ts?.completed_at,
  },
];

const buildInternalSteps = (
  norm: string,
  stepState: (n: number) => StepState,
  ts: LetterTimelineProps["timestamps"],
): StepDef[] => [
  {
    id: 1,
    title: "Draft & Submission",
    subtitle:
      stepState(1) === "completed"
        ? "Created by sending officer"
        : "Sending officer preparing memo",
    state: stepState(1),
    timestamp: ts?.created_at,
  },
  {
    id: 2,
    title: "Sending Manager Approval",
    subtitle:
      stepState(2) === "completed"
        ? "Approved by sending department manager"
        : stepState(2) === "active"
          ? "Awaiting sending manager approval"
          : stepState(2) === "rejected"
            ? "Returned / rejected by manager"
            : "Pending submission",
    state: stepState(2),
    timestamp: ts?.approved_at,
  },
  {
    id: 3,
    title: "Admin Registration & Routing",
    subtitle:
      stepState(3) === "completed"
        ? "Registered and routed to receiving department"
        : stepState(3) === "active"
          ? "Main Admin assigning INT reference & routing"
          : "Pending approval",
    state: stepState(3),
    timestamp: ts?.registered_at || ts?.routed_at,
  },
  {
    id: 4,
    title: "Receiving Department Processing",
    subtitle:
      stepState(4) === "completed"
        ? "Processed by receiving officer"
        : stepState(4) === "active"
          ? "Receiving officer processing the request"
          : "Pending routing",
    state: stepState(4),
    timestamp: ts?.assigned_at,
  },
  {
    id: 5,
    title: "Completion & Archival",
    subtitle:
      norm === "ARCHIVED"
        ? "Archived in official records"
        : stepState(5) === "completed"
          ? "Completed and filed"
          : "Final archival",
    state: stepState(5),
    timestamp: ts?.completed_at,
  },
];

/* ─── Main Component ──────────────────────────────────────── */

export const LetterTimeline: React.FC<LetterTimelineProps> = ({
  currentStatus,
  direction,
  letterType,
  rejectionReason,
  timestamps,
  className = "",
}) => {
  // Support legacy letterType prop as fallback for direction
  const dir = (direction || letterType || "INCOMING").toUpperCase();
  const norm = (currentStatus || "DRAFT").toUpperCase();
  const stage = getStage(norm, dir);
  const terminated = isTerminated(norm);

  const stepState = (stepNum: number): StepState => {
    if (stage > stepNum) return "completed";
    if (stage === stepNum) return terminated ? "rejected" : "active";
    return "upcoming";
  };

  let steps: StepDef[];
  if (dir === "OUTGOING") {
    steps = buildOutgoingSteps(norm, stepState, timestamps);
  } else if (dir === "INTERNAL") {
    steps = buildInternalSteps(norm, stepState, timestamps);
  } else {
    steps = buildIncomingSteps(norm, stepState, timestamps);
  }

  // Direction label & color
  const directionMeta: Record<
    string,
    { label: string; icon: string; color: string }
  > = {
    INCOMING: {
      label: "📥 Incoming Letter Workflow",
      icon: "📥",
      color: "text-[#526A55]",
    },
    OUTGOING: {
      label: "📤 Outgoing Letter Workflow",
      icon: "📤",
      color: "text-[#C48D3F]",
    },
    INTERNAL: {
      label: "🏢 Internal Letter Workflow",
      icon: "🏢",
      color: "text-[#6B5A8E]",
    },
  };
  const meta = directionMeta[dir] || directionMeta.INCOMING;

  const renderIcon = (step: StepDef) => {
    switch (step.state) {
      case "completed":
        return (
          <div className="w-8 h-8 rounded-full bg-[#4A6B4E] text-[#F5F3ED] flex items-center justify-center shadow-xs flex-shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "active":
        return (
          <div className="relative flex items-center justify-center flex-shrink-0">
            <span className="absolute inline-flex h-10 w-10 rounded-full bg-[#C48D3F]/25 animate-pulse motion-reduce:animate-none" />
            <div className="relative w-8 h-8 rounded-full bg-[#C48D3F] text-[#F5F3ED] flex items-center justify-center shadow-xs">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        );
      case "rejected":
        return (
          <div className="w-8 h-8 rounded-full bg-[#8B3232] text-[#F5F3ED] flex items-center justify-center shadow-xs flex-shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#ECEAE3] border-2 border-[#D8D7D1] text-[#8A8983] flex items-center justify-center font-bold text-xs flex-shrink-0">
            {step.id}
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3
          className={`text-sm font-semibold uppercase tracking-wider ${meta.color}`}
        >
          {meta.label}
        </h3>
        <Badge status={norm as LetterStatus} dot />
      </div>

      <ol className="relative flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-3 pt-2">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const connectorColor =
            step.state === "completed"
              ? "bg-[#4A6B4E]"
              : step.state === "rejected"
                ? "bg-[#8B3232]/50"
                : "bg-[#D8D7D1]/60";

          return (
            <li
              key={step.id}
              className="relative flex-1 flex md:flex-col items-start gap-4 md:gap-3"
              aria-current={step.state === "active" ? "step" : undefined}
            >
              {!isLast && (
                <>
                  <div
                    className={`hidden md:block absolute top-4 left-10 right-0 h-0.5 transition-colors ${connectorColor}`}
                    aria-hidden="true"
                  />
                  <div
                    className={`md:hidden absolute left-4 top-10 bottom-0 w-0.5 -ml-px transition-colors ${connectorColor}`}
                    aria-hidden="true"
                  />
                </>
              )}
              <div className="z-10">{renderIcon(step)}</div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs md:text-[13px] font-bold ${
                    step.state === "rejected"
                      ? "text-[#8B3232]"
                      : step.state === "active"
                        ? "text-[#292A27]"
                        : step.state === "completed"
                          ? "text-[#36513A]"
                          : "text-[#8A8983]"
                  }`}
                >
                  {step.title}
                </span>
                <p className="text-[11px] text-[#6B6A64] mt-0.5 leading-snug">
                  {step.subtitle}
                </p>
                {step.timestamp && (
                  <p className="text-[10px] text-[#8A8983] mt-1 font-medium">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {(norm === "REJECTED" || norm === "CHANGES_REQUESTED") &&
        rejectionReason && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#8B3232]/08 border border-[#8B3232]/20 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#8B3232]">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                {norm === "CHANGES_REQUESTED"
                  ? "Changes Requested"
                  : "Rejection Reason"}
              </span>
            </div>
            <p className="text-xs text-[#6B6A64] pl-6 leading-relaxed">
              {rejectionReason}
            </p>
          </div>
        )}
    </div>
  );
};

export default LetterTimeline;

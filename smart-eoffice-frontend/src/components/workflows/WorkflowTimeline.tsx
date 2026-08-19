import React from 'react';
import Badge, { DocumentStatus } from '@/components/common/Badge';

export interface WorkflowStepTimestamps {
  created_at?: string;
  submitted_at?: string;
  reviewed_at?: string;
  completed_at?: string;
}

export interface WorkflowTimelineProps {
  currentStatus: DocumentStatus | 'PENDING' | 'CHANGES_REQUESTED' | string;
  rejectionReason?: string;
  timestamps?: WorkflowStepTimestamps;
  className?: string;
}

type StepState = 'completed' | 'active' | 'rejected' | 'upcoming';

interface StepDefinition {
  id: number;
  title: string;
  subtitle: string;
  state: StepState;
  timestamp?: string;
  statusBadgeLabel?: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  currentStatus,
  rejectionReason,
  timestamps,
  className = '',
}) => {
  const normStatus = (currentStatus || 'DRAFT').toUpperCase();

  // Normalize status into 3 distinct steps
  let step1State: StepState = 'completed';
  let step2State: StepState = 'upcoming';
  let step3State: StepState = 'upcoming';

  if (normStatus === 'DRAFT' || normStatus === 'SUBMITTED') {
    step1State = 'active';
    step2State = 'upcoming';
    step3State = 'upcoming';
  } else if (normStatus === 'PENDING_APPROVAL' || normStatus === 'PENDING') {
    step1State = 'completed';
    step2State = 'active';
    step3State = 'upcoming';
  } else if (normStatus === 'REJECTED' || normStatus === 'CHANGES_REQUESTED') {
    step1State = 'completed';
    step2State = 'rejected';
    step3State = 'upcoming';
  } else if (normStatus === 'APPROVED' || normStatus === 'ARCHIVED') {
    step1State = 'completed';
    step2State = 'completed';
    step3State = 'completed';
  }

  const steps: StepDefinition[] = [
    {
      id: 1,
      title: 'Creation & Submission',
      subtitle: normStatus === 'DRAFT' ? 'Draft created by author' : 'Submitted for review',
      state: step1State,
      timestamp: timestamps?.created_at || timestamps?.submitted_at,
    },
    {
      id: 2,
      title: 'Department Manager Review',
      subtitle:
        step2State === 'rejected'
          ? normStatus === 'CHANGES_REQUESTED'
            ? 'Changes Requested by Manager'
            : 'Rejected by Department Manager'
          : step2State === 'completed'
          ? 'Signed off & approved'
          : step2State === 'active'
          ? 'Awaiting manager sign-off'
          : 'Pending prior stage',
      state: step2State,
      timestamp: timestamps?.reviewed_at,
    },
    {
      id: 3,
      title: 'Final Verification & Storage',
      subtitle:
        step3State === 'completed'
          ? normStatus === 'ARCHIVED'
            ? 'Archived in Official Records'
            : 'Approved & Verified'
          : 'Final record repository archival',
      state: step3State,
      timestamp: timestamps?.completed_at,
    },
  ];

  /* Icon Renderer */
  const renderStepIcon = (step: StepDefinition) => {
    switch (step.state) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-[#4A6B4E] text-[#F5F3ED] flex items-center justify-center shadow-xs flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="sr-only">Step {step.id} completed</span>
          </div>
        );
      case 'active':
        return (
          <div className="relative flex items-center justify-center flex-shrink-0">
            {/* Animated Pulse Ring */}
            <span className="absolute inline-flex h-10 w-10 rounded-full bg-[#C48D3F]/25 animate-pulse motion-reduce:animate-none" />
            <div className="relative w-8 h-8 rounded-full bg-[#C48D3F] text-[#F5F3ED] flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="sr-only">Step {step.id} in progress</span>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-8 h-8 rounded-full bg-[#8B3232] text-[#F5F3ED] flex items-center justify-center shadow-xs flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Step {step.id} rejected</span>
          </div>
        );
      case 'upcoming':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#ECEAE3] border-2 border-[#D8D7D1] text-[#8A8983] flex items-center justify-center font-bold text-xs flex-shrink-0">
            {step.id}
            <span className="sr-only">Step {step.id} upcoming</span>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Title Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#292A27] uppercase tracking-wider">
          Workflow Progression
        </h3>
        <Badge status={normStatus as DocumentStatus} dot />
      </div>

      {/* Main Responsive Timeline List */}
      <ol className="relative flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-4 pt-2">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          // Connector line styling
          const connectorColor =
            step.state === 'completed'
              ? 'bg-[#4A6B4E]'
              : step.state === 'rejected'
              ? 'bg-[#8B3232]/50 border-dashed border-[#8B3232]'
              : 'bg-[#D8D7D1]/60';

          return (
            <li
              key={step.id}
              className="relative flex-1 flex md:flex-col items-start gap-4 md:gap-3 group"
              aria-current={step.state === 'active' ? 'step' : undefined}
            >
              {/* Connector line (Desktop horizontal / Mobile vertical) */}
              {!isLast && (
                <>
                  {/* Desktop horizontal line */}
                  <div
                    className={`hidden md:block absolute top-4 left-10 right-0 h-0.5 transition-colors ${connectorColor}`}
                    aria-hidden="true"
                  />
                  {/* Mobile vertical line */}
                  <div
                    className={`md:hidden absolute left-4 top-10 bottom-0 w-0.5 -ml-px transition-colors ${connectorColor}`}
                    aria-hidden="true"
                  />
                </>
              )}

              {/* Icon */}
              <div className="z-10">{renderStepIcon(step)}</div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs md:text-sm font-bold ${
                      step.state === 'rejected'
                        ? 'text-[#8B3232]'
                        : step.state === 'active'
                        ? 'text-[#292A27]'
                        : step.state === 'completed'
                        ? 'text-[#36513A]'
                        : 'text-[#8A8983]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                <p className="text-xs text-[#6B6A64] mt-0.5 leading-snug">{step.subtitle}</p>

                {step.timestamp && (
                  <p className="text-[11px] text-[#8A8983] mt-1 font-medium">{step.timestamp}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Rejection Reason Callout Box */}
      {(normStatus === 'REJECTED' || normStatus === 'CHANGES_REQUESTED') && rejectionReason && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#8B3232]/08 border border-[#8B3232]/20 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#8B3232]">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{normStatus === 'CHANGES_REQUESTED' ? 'Revision Notes' : 'Rejection Reason'}</span>
          </div>
          <p className="text-xs text-[#6B6A64] pl-6 leading-relaxed">{rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowTimeline;

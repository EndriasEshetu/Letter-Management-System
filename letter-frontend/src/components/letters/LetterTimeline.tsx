import React from 'react';
import Badge, { LetterStatus } from '@/components/common/Badge';

export interface LetterTimelineProps {
  currentStatus: LetterStatus | string;
  letterType?: string;
  rejectionReason?: string;
  timestamps?: {
    created_at?: string;
    submitted_at?: string;
    reviewed_at?: string;
    dispatched_at?: string;
    completed_at?: string;
  };
  className?: string;
}

type StepState = 'completed' | 'active' | 'rejected' | 'upcoming';

interface StepDef {
  id: number;
  title: string;
  subtitle: string;
  state: StepState;
  timestamp?: string;
}

/**
 * Maps a letter status to a numeric lifecycle stage (1–4)
 */
const getStage = (status: string): number => {
  switch (status.toUpperCase()) {
    case 'DRAFT':
    case 'REGISTERED':
    case 'RECEIVED':
      return 1;
    case 'ASSIGNED':
    case 'FORWARDED':
    case 'UNDER_REVIEW':
    case 'PENDING_APPROVAL':
      return 2;
    case 'APPROVED':
    case 'REJECTED':
    case 'RETURNED':
    case 'CHANGES_REQUESTED':
      return 3;
    case 'DISPATCHED':
    case 'COMPLETED':
    case 'ARCHIVED':
    case 'RESPONSE_REQUIRED':
      return 4;
    default:
      return 1;
  }
};

const isTerminated = (status: string): boolean =>
  ['REJECTED', 'RETURNED', 'CHANGES_REQUESTED'].includes(status.toUpperCase());

export const LetterTimeline: React.FC<LetterTimelineProps> = ({
  currentStatus,
  letterType = 'INCOMING',
  rejectionReason,
  timestamps,
  className = '',
}) => {
  const norm = (currentStatus || 'DRAFT').toUpperCase();
  const stage = getStage(norm);
  const terminated = isTerminated(norm);

  const stepState = (stepNum: number): StepState => {
    if (stage > stepNum) return 'completed';
    if (stage === stepNum) return terminated ? 'rejected' : 'active';
    return 'upcoming';
  };

  const isOutgoing = letterType === 'OUTGOING';

  const steps: StepDef[] = [
    {
      id: 1,
      title: isOutgoing ? 'Drafting & Registration' : 'Receipt & Registration',
      subtitle:
        norm === 'DRAFT'
          ? 'Draft being prepared'
          : norm === 'REGISTERED'
          ? 'Registered in the system'
          : 'Received and registered',
      state: stepState(1),
      timestamp: timestamps?.created_at,
    },
    {
      id: 2,
      title: 'Review & Assignment',
      subtitle:
        stepState(2) === 'active'
          ? 'Under review / awaiting assignment'
          : stepState(2) === 'completed'
          ? 'Reviewed and assigned'
          : 'Pending prior stage',
      state: stepState(2),
      timestamp: timestamps?.submitted_at,
    },
    {
      id: 3,
      title: 'Approval Decision',
      subtitle:
        stepState(3) === 'rejected'
          ? norm === 'RETURNED'
            ? 'Returned for revision'
            : 'Rejected by reviewer'
          : stepState(3) === 'completed'
          ? 'Approved and signed off'
          : stepState(3) === 'active'
          ? 'Awaiting sign-off'
          : 'Pending prior stage',
      state: stepState(3),
      timestamp: timestamps?.reviewed_at,
    },
    {
      id: 4,
      title: isOutgoing ? 'Dispatch & Archival' : 'Response & Archival',
      subtitle:
        stepState(4) === 'completed'
          ? norm === 'ARCHIVED'
            ? 'Archived in official records'
            : norm === 'COMPLETED'
            ? 'Completed and filed'
            : isOutgoing
            ? 'Dispatched to recipient'
            : 'Response sent and filed'
          : 'Final dispatch and archival',
      state: stepState(4),
      timestamp: timestamps?.completed_at,
    },
  ];

  const renderIcon = (step: StepDef) => {
    switch (step.state) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-[#4A6B4E] text-[#F5F3ED] flex items-center justify-center shadow-xs flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'active':
        return (
          <div className="relative flex items-center justify-center flex-shrink-0">
            <span className="absolute inline-flex h-10 w-10 rounded-full bg-[#C48D3F]/25 animate-pulse motion-reduce:animate-none" />
            <div className="relative w-8 h-8 rounded-full bg-[#C48D3F] text-[#F5F3ED] flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-8 h-8 rounded-full bg-[#8B3232] text-[#F5F3ED] flex items-center justify-center shadow-xs flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
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
        <h3 className="text-sm font-semibold text-[#292A27] uppercase tracking-wider">
          Letter Lifecycle
        </h3>
        <Badge status={norm as LetterStatus} dot />
      </div>

      <ol className="relative flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-4 pt-2">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const connectorColor =
            step.state === 'completed'
              ? 'bg-[#4A6B4E]'
              : step.state === 'rejected'
              ? 'bg-[#8B3232]/50'
              : 'bg-[#D8D7D1]/60';

          return (
            <li
              key={step.id}
              className="relative flex-1 flex md:flex-col items-start gap-4 md:gap-3"
              aria-current={step.state === 'active' ? 'step' : undefined}
            >
              {!isLast && (
                <>
                  <div className={`hidden md:block absolute top-4 left-10 right-0 h-0.5 transition-colors ${connectorColor}`} aria-hidden="true" />
                  <div className={`md:hidden absolute left-4 top-10 bottom-0 w-0.5 -ml-px transition-colors ${connectorColor}`} aria-hidden="true" />
                </>
              )}
              <div className="z-10">{renderIcon(step)}</div>
              <div className="flex-1 min-w-0">
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
                <p className="text-xs text-[#6B6A64] mt-0.5 leading-snug">{step.subtitle}</p>
                {step.timestamp && (
                  <p className="text-[11px] text-[#8A8983] mt-1 font-medium">{step.timestamp}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {(norm === 'REJECTED' || norm === 'RETURNED') && rejectionReason && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#8B3232]/08 border border-[#8B3232]/20 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#8B3232]">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{norm === 'RETURNED' ? 'Reason for Return' : 'Rejection Reason'}</span>
          </div>
          <p className="text-xs text-[#6B6A64] pl-6 leading-relaxed">{rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default LetterTimeline;

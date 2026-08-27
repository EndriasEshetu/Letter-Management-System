import React from 'react';
import Card from '@/components/common/Card';
import Badge, { LetterStatus } from '@/components/common/Badge';

interface LetterTrackingCardProps {
  referenceNumber: string;
  subject: string;
  status: LetterStatus | string;
  /** 'Central Registry' | 'Main Administration' | Directorate name */
  currentLocation?: string;
  responsibleUser?: string;
  currentTask?: string;
  dueDate?: string;
  priority?: string;
  compact?: boolean;
}

const locationIcon = (location?: string): string => {
  if (!location) return '🏛️';
  if (location.toLowerCase().includes('registry')) return '📋';
  if (location.toLowerCase().includes('main admin') || location.toLowerCase().includes('administration')) return '🏛️';
  if (location.toLowerCase().includes('archive')) return '🗄️';
  return '🏢';
};

export const LetterTrackingCard: React.FC<LetterTrackingCardProps> = ({
  referenceNumber,
  subject,
  status,
  currentLocation,
  responsibleUser,
  currentTask,
  dueDate,
}) => {
  // Calculate days remaining if due date is available
  let daysRemaining: number | null = null;
  let isOverdue = false;

  if (dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) isOverdue = true;
  }

  // Normalise location label
  const displayLocation = currentLocation || 'Main Administration';

  return (
    <Card className="bg-[#ECEAE3] border border-[#D8D7D1]">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-md">
              {referenceNumber}
            </span>
            <h3 className="text-sm font-bold text-[#292A27] mt-1.5 line-clamp-2">{subject}</h3>
          </div>
          <Badge status={status as LetterStatus} dot />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#D8D7D1]/60 text-xs">
          {/* Current Location */}
          <div className="col-span-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">Current Location</dt>
            <dd className="flex items-center space-x-1.5 font-semibold text-[#292A27] mt-0.5">
              <span className="text-base leading-none">{locationIcon(displayLocation)}</span>
              <span className="truncate">{displayLocation}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">Responsible Person</dt>
            <dd className="font-semibold text-[#292A27] mt-0.5 truncate">{responsibleUser || 'Main Administrator'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">Current Action</dt>
            <dd className="font-medium text-[#6B6A64] mt-0.5 truncate">{currentTask || 'Workflow Processing'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">SLA Deadline</dt>
            <dd className="font-semibold mt-0.5">
              {dueDate ? (
                <span className={isOverdue ? 'text-[#8B3232] font-bold' : 'text-[#292A27]'}>
                  {dueDate}{daysRemaining !== null && (
                    <span className="text-[10px] font-normal ml-1">
                      ({isOverdue ? `${Math.abs(daysRemaining)}d OVERDUE` : `${daysRemaining}d left`})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[#8A8983] font-normal">No SLA set</span>
              )}
            </dd>
          </div>
        </div>

        {isOverdue && (
          <div className="p-2.5 rounded-xl bg-[#8B3232]/10 border border-[#8B3232]/20 flex items-center space-x-2 text-xs font-bold text-[#8B3232]">
            <svg className="w-4 h-4 flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>ACTION OVERDUE: Escalated to Directorate Manager</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LetterTrackingCard;

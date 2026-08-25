import React from 'react';
import { ApprovalActivity as ApprovalActivityType, ActivityAction } from '@/types/approval';

interface ApprovalActivityProps {
  activities: ApprovalActivityType[];
  isLoading?: boolean;
}

const actionStyles: Record<ActivityAction, { icon: React.ReactNode; color: string; label: string }> = {
  APPROVED: {
    label: 'Approved',
    color: 'bg-[#4A6B4E]/12 text-[#36513A]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-[#8B3232]/12 text-[#8B3232]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  CHANGES_REQUESTED: {
    label: 'Requested Changes',
    color: 'bg-[#C48D3F]/12 text-[#8A5D19]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-[#526A55]/12 text-[#3E5140]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
};

const formatTimeAgo = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return isoString;
  }
};

export const ApprovalActivity: React.FC<ApprovalActivityProps> = ({ activities, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-3 animate-pulse">
        <div className="h-4 bg-[#D8D7D1] rounded-md w-1/3" />
        <div className="space-y-2">
          <div className="h-10 bg-[#D8D7D1]/60 rounded-xl" />
          <div className="h-10 bg-[#D8D7D1]/60 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-4">
      <h4 className="text-xs font-bold text-[#292A27] uppercase tracking-wider">Recent Activity</h4>

      {activities.length === 0 ? (
        <p className="text-xs text-[#8A8983] py-2">No recent approval activity recorded.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => {
            const style = actionStyles[item.action] || actionStyles.SUBMITTED;
            return (
              <div key={item.id} className="flex items-start gap-3 text-xs">
                <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${style.color}`}>
                  {style.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#292A27] font-medium leading-tight">
                    <span className="font-semibold">{item.user_name}</span>{' '}
                    <span className="text-[#6B6A64]">{style.label.toLowerCase()}</span>{' '}
                    <span className="font-semibold text-[#292A27] truncate block sm:inline">{item.letter_subject}</span>
                  </p>
                  <span className="text-[10px] text-[#8A8983] block mt-0.5">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApprovalActivity;

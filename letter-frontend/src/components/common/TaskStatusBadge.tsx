import React from 'react';
import { TaskStatus } from '@/types/letter';

interface TaskStatusBadgeProps {
  status: TaskStatus | string;
  className?: string;
  dot?: boolean;
}

type BadgeVariant = 'info' | 'warning' | 'error' | 'success' | 'neutral';

const taskStatusMap: Record<string, { variant: BadgeVariant; label: string; dotColor: string; bgStyle: string }> = {
  ASSIGNED: {
    variant: 'info',
    label: 'Assigned',
    dotColor: 'bg-[#526A55]',
    bgStyle: 'bg-[#526A55]/12 text-[#3E5140] border-[#526A55]/20',
  },
  PENDING_ACTION: {
    variant: 'warning',
    label: 'Pending Action',
    dotColor: 'bg-[#C48D3F]',
    bgStyle: 'bg-[#C48D3F]/12 text-[#8A5D19] border-[#C48D3F]/20',
  },
  IN_PROGRESS: {
    variant: 'info',
    label: 'In Progress',
    dotColor: 'bg-[#526A55]',
    bgStyle: 'bg-[#526A55]/12 text-[#3E5140] border-[#526A55]/20',
  },
  RESPONSE_REQUIRED: {
    variant: 'warning',
    label: 'Response Required',
    dotColor: 'bg-[#C48D3F]',
    bgStyle: 'bg-[#C48D3F]/15 text-[#8A5D19] border-[#C48D3F]/30 font-bold',
  },
  OVERDUE: {
    variant: 'error',
    label: 'Overdue',
    dotColor: 'bg-[#8B3232]',
    bgStyle: 'bg-[#8B3232]/15 text-[#8B3232] border-[#8B3232]/30 font-bold animate-pulse',
  },
  COMPLETED: {
    variant: 'success',
    label: 'Completed',
    dotColor: 'bg-[#4A6B4E]',
    bgStyle: 'bg-[#4A6B4E]/12 text-[#36513A] border-[#4A6B4E]/20',
  },
};

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  className = '',
  dot = true,
}) => {
  const norm = (status || 'ASSIGNED').toUpperCase();
  const config = taskStatusMap[norm] || taskStatusMap.ASSIGNED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bgStyle} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotColor}`} aria-hidden="true" />}
      {config.label}
    </span>
  );
};

export default TaskStatusBadge;

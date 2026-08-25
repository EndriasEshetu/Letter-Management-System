import React from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'purple';

/* ─── Letter Status ─────────────────────────────────────────── */

export type LetterStatus =
  | 'DRAFT'
  | 'REGISTERED'
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'ARCHIVED'
  /* Legacy aliases for backward compatibility */
  | 'ASSIGNED'
  | 'FORWARDED'
  | 'UNDER_REVIEW'
  | 'RETURNED'
  | 'RESPONSE_REQUIRED';

/* ─── Keep DocumentStatus as alias for backward compat ──────── */
/** @deprecated Use LetterStatus instead */
export type DocumentStatus = LetterStatus;

interface BadgeProps {
  variant?: BadgeVariant;
  status?: LetterStatus | string;
  children?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-[#D8D7D1]/60 text-[#6B6A64]',
  success: 'bg-[#4A6B4E]/12 text-[#36513A]',
  warning: 'bg-[#C48D3F]/12 text-[#8A5D19]',
  error:   'bg-[#8B3232]/12 text-[#8B3232]',
  info:    'bg-[#526A55]/12 text-[#3E5140]',
  purple:  'bg-[#6B5A8E]/12 text-[#4A3A6B]',
};

const dotColors: Record<BadgeVariant, string> = {
  neutral: 'bg-[#8A8983]',
  success: 'bg-[#4A6B4E]',
  warning: 'bg-[#C48D3F]',
  error:   'bg-[#8B3232]',
  info:    'bg-[#526A55]',
  purple:  'bg-[#6B5A8E]',
};

const statusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  DRAFT:              { variant: 'neutral', label: 'Draft' },
  REGISTERED:         { variant: 'info',    label: 'Registered' },
  RECEIVED:           { variant: 'info',    label: 'Received' },
  IN_PROGRESS:        { variant: 'info',    label: 'In Progress' },
  PENDING_REVIEW:     { variant: 'warning', label: 'Pending Review' },
  CHANGES_REQUESTED:  { variant: 'warning', label: 'Changes Requested' },
  PENDING_APPROVAL:   { variant: 'warning', label: 'Pending Approval' },
  APPROVED:           { variant: 'success', label: 'Approved' },
  READY_FOR_DISPATCH: { variant: 'purple',  label: 'Ready for Dispatch' },
  DISPATCHED:         { variant: 'purple',  label: 'Dispatched' },
  DELIVERED:          { variant: 'success', label: 'Delivered' },
  COMPLETED:          { variant: 'success', label: 'Completed' },
  REJECTED:           { variant: 'error',   label: 'Rejected' },
  ARCHIVED:           { variant: 'neutral', label: 'Archived' },

  /* Legacy aliases */
  ASSIGNED:           { variant: 'info',    label: 'Assigned' },
  FORWARDED:          { variant: 'warning', label: 'Forwarded' },
  UNDER_REVIEW:       { variant: 'warning', label: 'Under Review' },
  RETURNED:           { variant: 'error',   label: 'Returned' },
  RESPONSE_REQUIRED:  { variant: 'warning', label: 'Response Required' },
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  status,
  children,
  className = '',
  dot = false,
}) => {
  // If a letter status is provided, resolve variant + label from it
  const resolved = status ? statusMap[status] : null;
  const finalVariant: BadgeVariant = variant ?? resolved?.variant ?? 'neutral';
  const finalLabel = children ?? resolved?.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[finalVariant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[finalVariant]}`}
          aria-hidden="true"
        />
      )}
      {finalLabel}
    </span>
  );
};

export default Badge;

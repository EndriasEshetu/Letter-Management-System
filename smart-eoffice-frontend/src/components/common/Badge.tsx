import React from 'react';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info';
type DocumentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

interface BadgeProps {
  variant?: BadgeVariant;
  status?: DocumentStatus;
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
};

const dotColors: Record<BadgeVariant, string> = {
  neutral: 'bg-[#8A8983]',
  success: 'bg-[#4A6B4E]',
  warning: 'bg-[#C48D3F]',
  error:   'bg-[#8B3232]',
  info:    'bg-[#526A55]',
};

const statusMap: Record<DocumentStatus, { variant: BadgeVariant; label: string }> = {
  DRAFT:            { variant: 'neutral', label: 'Draft' },
  PENDING_APPROVAL: { variant: 'warning', label: 'Pending Approval' },
  APPROVED:         { variant: 'success', label: 'Approved' },
  REJECTED:         { variant: 'error',   label: 'Rejected' },
  ARCHIVED:         { variant: 'neutral', label: 'Archived' },
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  status,
  children,
  className = '',
  dot = false,
}) => {
  // If a document status is provided, resolve variant + label from it
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

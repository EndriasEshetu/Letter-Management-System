import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const DefaultIcon = () => (
  <svg
    className="w-10 h-10 text-[#B8B7AF]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}
    >
      {/* Icon */}
      <div className="w-16 h-16 bg-[#ECEAE3] rounded-2xl flex items-center justify-center mb-5">
        {icon ?? <DefaultIcon />}
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-[#292A27] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B6A64] max-w-xs">{description}</p>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;

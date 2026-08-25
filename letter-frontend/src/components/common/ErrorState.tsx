import React from 'react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We encountered a problem while loading this content. Please try again.',
  retryLabel = 'Try Again',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}
      role="alert"
    >
      {/* Error icon */}
      <div className="w-16 h-16 bg-[#8B3232]/08 rounded-2xl flex items-center justify-center mb-5">
        <svg
          className="w-8 h-8 text-[#8B3232]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-[#292A27] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B6A64] max-w-xs">{description}</p>
      )}

      {/* Retry */}
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;

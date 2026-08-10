import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  label = 'Loading Smart E-Office...',
}) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`${sizeMap[size]} border-[#526A55] border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {label && <p className="text-sm font-medium text-[#292A27]">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#F5F3ED] flex items-center justify-center z-50 p-4">
        <div className="bg-[#ECEAE3] px-8 py-10 rounded-3xl border border-[#292A27]/10 shadow-sm max-w-sm w-full text-center">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;

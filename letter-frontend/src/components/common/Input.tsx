import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#292A27] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 bg-[#F9F8F6] text-[#252622] placeholder-[#8A8983] border ${
            error ? 'border-[#8B3232] focus:ring-[#8B3232]' : 'border-[#D8D7D1] focus:border-[#526A55] focus:ring-[#526A55]'
          } rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 disabled:bg-[#ECEAE3] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[#8B3232] font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-xs text-[#6B6A64]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

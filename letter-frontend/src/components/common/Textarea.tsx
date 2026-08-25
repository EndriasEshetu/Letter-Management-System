import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      showCharCount = false,
      maxLength,
      rows = 4,
      id,
      value,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-[#292A27]"
            >
              {label}
              {required && <span className="text-[#8B3232] ml-0.5">*</span>}
            </label>
            {showCharCount && maxLength && (
              <span className="text-xs text-[#8A8983]">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={`w-full px-4 py-3 bg-[#F9F8F6] text-[#252622] placeholder-[#8A8983] border ${
            error
              ? 'border-[#8B3232] focus:ring-[#8B3232]'
              : 'border-[#D8D7D1] focus:border-[#526A55] focus:ring-[#526A55]'
          } rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 disabled:bg-[#ECEAE3] disabled:cursor-not-allowed resize-y ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[#8B3232] font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-xs text-[#6B6A64]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

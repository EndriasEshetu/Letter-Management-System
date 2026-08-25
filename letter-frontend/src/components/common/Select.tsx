import React, { useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  options,
  value = '',
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  id,
  className = '',
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[#292A27] mb-1.5"
        >
          {label}
          {required && <span className="text-[#8B3232] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-[#F9F8F6] text-[#252622] border ${
            error
              ? 'border-[#8B3232] focus:ring-[#8B3232]'
              : 'border-[#D8D7D1] focus:border-[#526A55] focus:ring-[#526A55]'
          } rounded-xl text-sm appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 disabled:bg-[#ECEAE3] disabled:cursor-not-allowed ${
            value === '' ? 'text-[#8A8983]' : 'text-[#252622]'
          } ${className}`}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-[#6B6A64]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-[#8B3232] font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-[#6B6A64]">{helperText}</p>}
    </div>
  );
};

export default Select;

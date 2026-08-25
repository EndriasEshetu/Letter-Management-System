import React, { useRef } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  id,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-[#8A8983]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-9 py-2.5 bg-[#F9F8F6] text-[#252622] placeholder-[#8A8983] border border-[#D8D7D1] focus:border-[#526A55] focus:ring-[#526A55] rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 disabled:bg-[#ECEAE3] disabled:cursor-not-allowed"
        aria-label={placeholder}
      />

      {/* Clear button */}
      {value && !disabled && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-3 flex items-center text-[#8A8983] hover:text-[#292A27] transition-colors focus:outline-none"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;

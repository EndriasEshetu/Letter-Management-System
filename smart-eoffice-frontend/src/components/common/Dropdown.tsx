import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  dividerBefore?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, close]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-2 min-w-[10rem] bg-[#F9F8F5] border border-[#292A27]/10 rounded-2xl shadow-md py-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.dividerBefore && (
                <div className="my-1.5 border-t border-[#D8D7D1]/60" />
              )}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    close();
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors rounded-none first:rounded-t-2xl last:rounded-b-2xl focus:outline-none focus:bg-[#ECEAE3] ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed text-[#6B6A64]'
                    : item.danger
                    ? 'text-[#8B3232] hover:bg-[#8B3232]/08'
                    : 'text-[#292A27] hover:bg-[#ECEAE3]'
                }`}
              >
                {item.icon && (
                  <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                )}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

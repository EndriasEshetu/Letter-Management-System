import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-[#292A27]/30 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Dialog Panel */}
      <div
        className={`relative w-full ${sizeMap[size]} bg-[#ECEAE3] border border-[#292A27]/10 rounded-[1.75rem] shadow-lg transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-7 pt-7 pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-[#292A27] tracking-tight"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-[#6B6A64]">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-xl hover:bg-[#D8D7D1]/60 text-[#6B6A64] hover:text-[#292A27] transition-colors focus:outline-none focus:ring-2 focus:ring-[#526A55]"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-7 py-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-7 pb-7 pt-0 flex items-center justify-end gap-3 border-t border-[#D8D7D1]/50 pt-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

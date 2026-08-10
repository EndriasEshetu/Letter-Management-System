import React, { useEffect, useCallback, createContext, useContext, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

/* ─── Types ──────────────────────────────────────────────── */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

/* ─── Context ─────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

/* ─── Individual Toast ────────────────────────────────────── */

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-[#F9F8F5]',
    border: 'border-[#4A6B4E]/30',
    text: 'text-[#36513A]',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    bg: 'bg-[#F9F8F5]',
    border: 'border-[#8B3232]/30',
    text: 'text-[#8B3232]',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg: 'bg-[#F9F8F5]',
    border: 'border-[#C48D3F]/30',
    text: 'text-[#8A5D19]',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  info: {
    bg: 'bg-[#F9F8F5]',
    border: 'border-[#526A55]/30',
    text: 'text-[#3E5140]',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

const SingleToast: React.FC<{ toast: ToastItem; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const style = toastStyles[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => onRemove(toast.id), [toast.id, onRemove]);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    timerRef.current = setTimeout(dismiss, duration);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [dismiss, toast.duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 w-full max-w-sm ${style.bg} border ${style.border} rounded-2xl px-4 py-3.5 shadow-md`}
    >
      <svg
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.text}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={style.icon} />
      </svg>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold ${style.text}`}>{toast.title}</p>
        )}
        <p className="text-sm text-[#292A27]">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-[#D8D7D1]/50 text-[#8A8983] hover:text-[#292A27] transition-colors focus:outline-none"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/* ─── Provider ────────────────────────────────────────────── */

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div
          className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 items-end"
          aria-label="Notifications"
        >
          {toasts.map((t) => (
            <SingleToast key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;

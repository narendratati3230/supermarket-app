import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, addToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite" aria-label="Notifications">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} role="alert">
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToastMsg = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastMsg must be within ToastProvider');
  return ctx;
};

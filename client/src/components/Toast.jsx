import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={16} className="text-emerald-500 shrink-0" />,
  error:   <XCircle    size={16} className="text-red-500 shrink-0" />,
  warning: <AlertCircle size={16} className="text-amber-500 shrink-0" />,
  info:    <Info        size={16} className="text-blue-500 shrink-0" />,
};
const COLORS = {
  success: 'border-emerald-200 dark:border-emerald-800',
  error:   'border-red-200 dark:border-red-800',
  warning: 'border-amber-200 dark:border-amber-800',
  info:    'border-blue-200 dark:border-blue-800',
};

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_id;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 360 }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white dark:bg-slate-800 ${COLORS[t.type]}`}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {ICONS[t.type]}
              <p className="flex-1 text-sm text-gray-700 dark:text-slate-200 leading-snug">{t.message}</p>
              <button onClick={() => dismiss(t.id)}
                className="shrink-0 text-gray-300 hover:text-gray-500 dark:hover:text-slate-400 transition">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

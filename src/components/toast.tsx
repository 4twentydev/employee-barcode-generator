"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error";
};

type ToastContextValue = {
  pushToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function Toasts({ items, onDismiss }: { items: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 flex w-[320px] flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{toast.title}</p>
                {toast.description ? (
                  <p className="text-xs text-zinc-600">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-700"
              >
                Close
              </button>
            </div>
            <div
              className={`mt-2 h-1 w-full rounded-full ${
                toast.variant === "error" ? "bg-rose-400" : "bg-emerald-400"
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toasts items={items} onDismiss={(id) => setItems((prev) => prev.filter((item) => item.id !== id))} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}

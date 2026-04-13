import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, variant = "info") => {
    const id = crypto.randomUUID();
    const toast = { id, message, variant };
    setToasts((t) => [toast, ...t].slice(0, 4));
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toastWrap" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <strong style={{ display: "block", marginBottom: 4 }}>
              {t.variant === "success" ? "Success" : t.variant === "error" ? "Error" : "Notice"}
            </strong>
            <div style={{ color: "var(--muted)" }}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


import { useState, useCallback } from "react";

// Hook para reemplazar window.prompt / window.alert
// Los modales se renderizan inline desde el componente que use este hook

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const success = useCallback((msg: string) => show(msg, "success"), [show]);
  const error   = useCallback((msg: string) => show(msg, "error"),   [show]);
  const info    = useCallback((msg: string) => show(msg, "info"),    [show]);

  return { toasts, success, error, info };
}

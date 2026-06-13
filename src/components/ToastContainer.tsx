import type { ToastType } from "../hooks/useToast";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface Props {
  toasts: ToastItem[];
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const colors: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: "var(--success-dim)", border: "var(--success)", color: "var(--success)" },
  error:   { bg: "var(--danger-dim)",  border: "var(--danger)",  color: "var(--danger)"  },
  info:    { bg: "var(--accent-dim)",  border: "var(--accent)",  color: "var(--accent)"  },
};

export default function ToastContainer({ toasts }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      maxWidth: 340,
    }}>
      {toasts.map((t) => {
        const c = colors[t.type];
        return (
          <div key={t.id} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 16px",
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            animation: "slideIn 0.2s ease",
          }}>
            <span style={{
              color: c.color,
              fontWeight: 700,
              fontSize: "0.875rem",
              lineHeight: 1.6,
              flexShrink: 0,
            }}>
              {icons[t.type]}
            </span>
            <span style={{
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              lineHeight: 1.5,
            }}>
              {t.message}
            </span>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  requireTyping?: string; // si se pasa, el usuario debe escribir esta cadena
  danger?: boolean;
}

interface ModalState extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

// Este hook devuelve { confirm, ConfirmModal }
// ConfirmModal debe renderizarse en el componente
export function useConfirm() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [typed, setTyped] = useState("");

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setTyped("");
      setModal({ ...opts, resolve });
    });
  }, []);

  const handleClose = (ok: boolean) => {
    modal?.resolve(ok);
    setModal(null);
    setTyped("");
  };

  const canConfirm = modal?.requireTyping
    ? typed === modal.requireTyping
    : true;

  const ConfirmModal = modal ? (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
      onClick={() => handleClose(false)}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-xl)",
          padding: 28,
          width: "100%",
          maxWidth: 420,
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: 10, fontSize: "1.125rem" }}>{modal.title}</h2>

        {modal.description && (
          <p style={{ marginBottom: 20, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {modal.description}
          </p>
        )}

        {modal.requireTyping && (
          <div style={{ marginBottom: 20 }} className="field-group">
            <label>Escribe <strong style={{ color: "var(--text-primary)", textTransform: "none" }}>{modal.requireTyping}</strong> para confirmar</label>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canConfirm && handleClose(true)}
              placeholder={modal.requireTyping}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={() => handleClose(false)}>
            Cancelar
          </button>
          <button
            className={`btn ${modal.danger ? "btn-danger" : "btn-primary"}`}
            disabled={!canConfirm}
            onClick={() => handleClose(true)}
            style={modal.danger && canConfirm ? { background: "var(--danger)", color: "#fff" } : {}}
          >
            {modal.confirmText || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmModal };
}

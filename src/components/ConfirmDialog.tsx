interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  danger,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-responsive"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="confirm-sheet-responsive card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-sheet__icon-wrap">
          <span className={`confirm-sheet__icon ${danger ? "confirm-sheet__icon--danger" : ""}`}>
            {danger ? "⚠️" : "ℹ️"}
          </span>
        </div>

        <h2 className="confirm-sheet__title">{title}</h2>
        <p className="confirm-sheet__message">{message}</p>

        <div className="confirm-sheet__actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="button button--secondary button--lg confirm-sheet__btn"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`button button--lg confirm-sheet__btn ${
              danger ? "button--danger" : "button--primary"
            }`}
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

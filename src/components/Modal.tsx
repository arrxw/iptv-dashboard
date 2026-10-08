import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-responsive"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-sheet-responsive"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-sheet__drag-handle" aria-hidden="true" />
        
        {title && (
          <div className="modal-sheet__header">
            <h2 className="modal-sheet__title">{title}</h2>
            <button
              onClick={onClose}
              className="modal-sheet__close-btn"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="modal-sheet__body">{children}</div>
      </div>
    </div>
  );
}

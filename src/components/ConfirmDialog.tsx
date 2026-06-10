interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  danger?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  danger,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
          width: '90%',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
            }}
          >
            {message}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#6b7280',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: danger ? '#ef4444' : '#667eea',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = danger
                    ? '#dc2626'
                    : '#5568d3';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = danger
                  ? '#ef4444'
                  : '#667eea';
              }}
            >
              {isLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

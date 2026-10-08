import { useState } from "react";
import { Eye, EyeOff, Copy, Check, Mail, Lock, Calendar } from "lucide-react";

interface Props {
  subscription: any;
}

export default function SubscriptionDetails({ subscription }: Props) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const profit = Number(subscription.sale_price) - Number(subscription.cost_price);

  const copyText = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      alert("Copiado: " + text);
    }
  };

  return (
    <div className="subscription-details-sheet">
      <div className="subscription-details__header">
        <div>
          <span className="card__eyebrow">Detalles del Servicio</span>
          <h2 className="card__title">{subscription.services?.name || "Servicio"}</h2>
          <p className="subscription-details__account muted-text">
            Cuenta: <strong>{subscription.account_name}</strong>
          </p>
        </div>

        <button
          type="button"
          className="button button--secondary button--sm"
          onClick={() => setShowSensitive(!showSensitive)}
        >
          {showSensitive ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{showSensitive ? "Ocultar" : "Mostrar"}</span>
        </button>
      </div>

      <div className="subscription-details__credentials-group">
        <div className="credential-box">
          <div className="credential-box__info">
            <span className="credential-box__label">
              <Mail size={13} /> Correo de acceso
            </span>
            <code className="credential-box__value">{subscription.email}</code>
          </div>
          <button
            type="button"
            className="button button--secondary button--sm credential-copy-btn"
            onClick={() => copyText(subscription.email, "email")}
            aria-label="Copiar correo"
          >
            {copiedField === "email" ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span>{copiedField === "email" ? "Copiado" : "Copiar"}</span>
          </button>
        </div>

        <div className="credential-box">
          <div className="credential-box__info">
            <span className="credential-box__label">
              <Lock size={13} /> Contraseña
            </span>
            <code className="credential-box__value">
              {showSensitive ? subscription.password : "••••••••••••"}
            </code>
          </div>
          <button
            type="button"
            className="button button--secondary button--sm credential-copy-btn"
            onClick={() => copyText(subscription.password, "password")}
            aria-label="Copiar contraseña"
          >
            {copiedField === "password" ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span>{copiedField === "password" ? "Copiada" : "Copiar"}</span>
          </button>
        </div>
      </div>

      <div className="subscription-details__financials">
        <div className="financial-cell">
          <span className="text-muted text-xs">Coste de compra</span>
          <strong>{showSensitive ? `${subscription.cost_price} €` : "•••"}</strong>
        </div>
        <div className="financial-cell">
          <span className="text-muted text-xs">Precio de venta</span>
          <strong>{showSensitive ? `${subscription.sale_price} €` : "•••"}</strong>
        </div>
        <div className="financial-cell financial-cell--profit">
          <span className="text-muted text-xs">Margen de ganancia</span>
          <strong className="text-success">
            {showSensitive ? `+${profit.toFixed(2)} €` : "•••"}
          </strong>
        </div>
      </div>

      <div className="subscription-details__dates muted-text text-sm">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Inicio: {subscription.start_date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Vencimiento: {subscription.end_date}</span>
        </div>
      </div>

      {subscription.notes && (
        <div className="subscription-details__notes">
          <span className="text-xs text-muted">Notas y perfiles:</span>
          <p className="text-sm">{subscription.notes}</p>
        </div>
      )}
    </div>
  );
}

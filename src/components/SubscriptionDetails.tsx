import { useState } from "react";

interface Props {
  subscription: any;
}

export default function SubscriptionDetails({ subscription }: Props) {
  const [showSensitive, setShowSensitive] = useState(false);
  const profit = Number(subscription.sale_price) - Number(subscription.cost_price);

  return (
    <div className="card card--shadow">
      <div className="card__header">
        <div>
          <p className="card__eyebrow">Suscripción</p>
          <h2 className="card__title">{subscription.services?.name}</h2>
          <p className="card__subtitle">Cuenta {subscription.account_name}</p>
        </div>
        <div className="card__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setShowSensitive(!showSensitive)}
          >
            {showSensitive ? "🙈 Ocultar datos" : "👁 Mostrar datos"}
          </button>
        </div>
      </div>

      <div className="card__body">
        <div className="card-grid card-grid--columns-2">
          <div>
            <p className="text-sm text-muted">Correo</p>
            <p className="text-strong">{subscription.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Contraseña</p>
            <p className="text-strong">
              {showSensitive ? subscription.password : "••••••••••"}
            </p>
          </div>
        </div>

        <div className="card-grid card-grid--columns-3">
          <div>
            <p className="text-sm text-muted">Compra</p>
            <p className="text-strong">
              {showSensitive ? `${subscription.cost_price} €` : "••••••"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Venta</p>
            <p className="text-strong">
              {showSensitive ? `${subscription.sale_price} €` : "••••••"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Beneficio</p>
            <p className="text-strong">
              {showSensitive ? `${profit.toFixed(2)} €` : "••••••"}
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="card-grid card-grid--columns-2">
          <div>
            <p className="text-sm text-muted">Inicio</p>
            <p>{subscription.start_date}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Caduca</p>
            <p>{subscription.end_date}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted">Notas</p>
          <p>{subscription.notes || "-"}</p>
        </div>
      </div>

      <div className="card__footer card__footer--actions">
        <button type="button" className="button button--secondary button--sm">
          ✏ Editar
        </button>
        <button type="button" className="button button--danger button--sm">
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}

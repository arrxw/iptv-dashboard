import { Calendar, Mail, Edit2, RotateCcw, Trash2 } from "lucide-react";

interface Props {
  subscription: any;
  onEdit?: () => void;
  onRenew?: () => void;
  onDelete?: () => void;
}

export default function SubscriptionCard({
  subscription,
  onEdit,
  onRenew,
  onDelete,
}: Props) {
  const cost = Number(subscription.cost_price) || 0;
  const sale = Number(subscription.sale_price) || 0;
  const profit = sale - cost;

  const isProfitPositive = profit > 0;

  return (
    <div className="subscription-card card">
      <div className="subscription-card__header">
        <div>
          <h3 className="subscription-card__title">
            {subscription.services?.name || "Suscripción"}
          </h3>
          <p className="subscription-card__account muted-text text-sm">
            {subscription.account_name}
          </p>
        </div>

        <span className="badge badge--success">
          Activa
        </span>
      </div>

      <div className="subscription-card__body">
        <div className="subscription-card__detail-row">
          <Mail size={15} className="text-muted" />
          <span className="text-sm">{subscription.email}</span>
        </div>

        <div className="subscription-card__prices-row">
          <div className="subscription-card__price-item">
            <span className="text-muted text-xs">Coste:</span>
            <strong>{cost.toFixed(2)} €</strong>
          </div>
          <div className="subscription-card__price-item">
            <span className="text-muted text-xs">PVP:</span>
            <strong>{sale.toFixed(2)} €</strong>
          </div>
          <div className="subscription-card__price-item subscription-card__price-item--profit">
            <span className="text-muted text-xs">Beneficio:</span>
            <span
              className={`text-strong ${
                isProfitPositive ? "text-success" : "text-danger"
              }`}
            >
              {isProfitPositive ? "+" : ""}
              {profit.toFixed(2)} €
            </span>
          </div>
        </div>

        <div className="subscription-card__detail-row muted-text text-xs" style={{ marginTop: "10px" }}>
          <Calendar size={14} />
          <span>Vencimiento: {subscription.end_date}</span>
        </div>
      </div>

      <div className="subscription-card__actions-row">
        {onEdit && (
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={onEdit}
            title="Editar suscripción"
          >
            <Edit2 size={14} />
            <span>Editar</span>
          </button>
        )}

        {onRenew && (
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={onRenew}
            title="Renovar suscripción"
          >
            <RotateCcw size={14} />
            <span>Renovar</span>
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={onDelete}
            title="Eliminar suscripción"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

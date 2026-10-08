import { useEffect, useState } from "react";
import { Plus, TrendingUp, DollarSign, Calendar, Layers } from "lucide-react";
import { supabase } from "../services/supabase";
import Modal from "../components/Modal";
import NewSubscription from "../components/NewSubscription";
import SubscriptionDetails from "../components/SubscriptionDetails";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";
import LoadingScreen from "../components/LoadingScreen";

export default function Subscriptions() {
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        services(name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setSubscriptions(data || []);
    setLoading(false);
  }

  if (loading) {
    return <LoadingScreen message="Cargando suscripciones..." />;
  }

  // Cálculos financieros para métricas móviles
  const totalCost = subscriptions.reduce(
    (acc, s) => acc + (Number(s.cost_price) || 0),
    0
  );
  const totalSales = subscriptions.reduce(
    (acc, s) => acc + (Number(s.sale_price) || 0),
    0
  );
  const totalProfit = totalSales - totalCost;

  return (
    <PageShell>
      <div className="subscriptions-page">
        <PageHeader
          title="Suscripciones"
          subtitle="Gestiona tus servicios de streaming y cuentas de clientes"
          variant="hero"
          actions={
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={() => setShowNewSubscription(true)}
            >
              <Plus size={16} />
              <span>Nueva suscripción</span>
            </button>
          }
        />

        {/* Resumen financiero Mobile-First */}
        <section className="subscriptions-kpi-grid" aria-label="Métricas financieras">
          <div className="stat-card">
            <div className="stat-card__icon-wrap">
              <Layers size={16} />
            </div>
            <span className="stat-card__label">Total Activas</span>
            <strong className="stat-card__val">{subscriptions.length}</strong>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon-wrap">
              <DollarSign size={16} />
            </div>
            <span className="stat-card__label">Coste mensual</span>
            <strong className="stat-card__val">{totalCost.toFixed(2)} €</strong>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon-wrap">
              <TrendingUp size={16} />
            </div>
            <span className="stat-card__label">Facturación</span>
            <strong className="stat-card__val">{totalSales.toFixed(2)} €</strong>
          </div>

          <div className="stat-card stat-card--highlight">
            <div className="stat-card__icon-wrap text-success">
              <TrendingUp size={16} />
            </div>
            <span className="stat-card__label">Beneficio Neto</span>
            <strong className="stat-card__val text-success">
              +{totalProfit.toFixed(2)} €
            </strong>
          </div>
        </section>

        {/* Grid de Suscripciones */}
        <div className="section-title">
          <h2>Cuentas contratadas ({subscriptions.length})</h2>
        </div>

        {subscriptions.length === 0 ? (
          <section className="card empty-state">
            <div className="empty-state__icon">💳</div>
            <p className="empty-state__msg">No hay suscripciones registradas todavía.</p>
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={() => setShowNewSubscription(true)}
              style={{ marginTop: "12px" }}
            >
              + Añadir primera suscripción
            </button>
          </section>
        ) : (
          <div className="card-grid card-grid--columns-3">
            {subscriptions.map((item) => {
              const cost = Number(item.cost_price) || 0;
              const sale = Number(item.sale_price) || 0;
              const profit = sale - cost;

              return (
                <article
                  key={item.id}
                  className="subscription-card card"
                  onClick={() => setSelectedSubscription(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelectedSubscription(item);
                  }}
                >
                  <div className="subscription-card__header">
                    <div className="subscription-card__service-info">
                      <h3 className="subscription-card__title">
                        {item.services?.name || "Servicio"}
                      </h3>
                      <p className="subscription-card__account muted-text">
                        Cuenta: <strong>{item.account_name}</strong>
                      </p>
                    </div>
                    <span className="badge badge--success">Activa</span>
                  </div>

                  <div className="subscription-card__body">
                    <p className="subscription-card__email muted-text text-sm">
                      📧 {item.email}
                    </p>

                    <div className="subscription-card__prices-row">
                      <div className="subscription-card__price-item">
                        <span className="text-muted text-xs">Compra:</span>
                        <strong>{cost.toFixed(2)} €</strong>
                      </div>
                      <div className="subscription-card__price-item">
                        <span className="text-muted text-xs">Venta:</span>
                        <strong>{sale.toFixed(2)} €</strong>
                      </div>
                      <div className="subscription-card__price-item subscription-card__price-item--profit">
                        <span className="text-muted text-xs">Margen:</span>
                        <span className="text-success text-strong">
                          +{profit.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="subscription-card__footer">
                    <div className="flex items-center gap-1 muted-text text-xs">
                      <Calendar size={13} />
                      <span>Caduca: {item.end_date}</span>
                    </div>
                    <span className="subscription-card__tap-hint text-xs">
                      Ver detalles →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal: Nueva Suscripción */}
        <Modal
          isOpen={showNewSubscription}
          onClose={() => setShowNewSubscription(false)}
          title="Nueva suscripción"
        >
          <NewSubscription
            onCreated={() => {
              setShowNewSubscription(false);
              loadSubscriptions();
            }}
          />
        </Modal>

        {/* Modal: Detalles de Suscripción */}
        <Modal
          isOpen={selectedSubscription !== null}
          onClose={() => setSelectedSubscription(null)}
          title="Detalles de suscripción"
        >
          {selectedSubscription && (
            <SubscriptionDetails subscription={selectedSubscription} />
          )}
        </Modal>
      </div>
    </PageShell>
  );
}

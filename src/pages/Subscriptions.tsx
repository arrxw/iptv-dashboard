import { useEffect, useState } from "react";
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

  return (
    <PageShell>
      <div className="subscriptions-page">
        <PageHeader
          title="Suscripciones"
          subtitle="Gestiona tus servicios y sus planes desde un panel ordenado y claro."
          actions={
            <button className="button button--primary button--sm" onClick={() => setShowNewSubscription(true)}>
              ➕ Nueva suscripción
            </button>
          }
        />

        <div className="subscriptions-hero card page-header page-header--purple">
          <div>
            <h2>Control completo de suscripciones</h2>
            <p className="muted-text">Netflix, Spotify, HBO, Disney+ y más en un solo lugar.</p>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <section className="card empty-state">
            <p className="muted-text">No hay suscripciones todavía.</p>
          </section>
        ) : (
          <div className="card-grid card-grid--columns-3">
            {subscriptions.map((item) => (
              <button
                type="button"
                key={item.id}
                className="subscription-card"
                onClick={() => setSelectedSubscription(item)}
              >
                <div className="subscription-card__content">
                  <h3>{item.services?.name}</h3>
                  <p className="muted-text">Cuenta: {item.account_name}</p>
                  <p className="muted-text">Correo: {item.email}</p>
                  <div className="subscription-card__row">
                    <span>Compra: {item.cost_price} €</span>
                    <span>Venta: {item.sale_price} €</span>
                  </div>
                  <span className="badge badge--success">
                    Beneficio: {(Number(item.sale_price) - Number(item.cost_price)).toFixed(2)} €
                  </span>
                </div>
                <div className="subscription-card__footer">
                  <strong>Caduca:</strong> {item.end_date}
                </div>
              </button>
            ))}
          </div>
        )}

        <Modal isOpen={showNewSubscription} onClose={() => setShowNewSubscription(false)} title="Nueva suscripción">
          <NewSubscription
            onCreated={() => {
              setShowNewSubscription(false);
              loadSubscriptions();
            }}
          />
        </Modal>

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

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Modal from "../components/Modal";
import NewSubscription from "../components/NewSubscription";
import SubscriptionDetails from "../components/SubscriptionDetails";
// SubscriptionCard component not found in project; render subscription details inline

export default function Subscriptions() {
  const [showNewSubscription, setShowNewSubscription] =
    useState(false);

  const [subscriptions, setSubscriptions] =
    useState<any[]>([]);

  const [selectedSubscription, setSelectedSubscription] =
    useState<any>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        `
        *,
        services(name)
      `
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setSubscriptions(data || []);
  }

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>🎬 Suscripciones</h1>

      <div
  style={{
    background:
      "linear-gradient(135deg,#7c3aed,#5b21b6)",
    borderRadius: "22px",
    padding: "35px",
    color: "white",
    marginBottom: "30px",
    boxShadow:
      "0 12px 30px rgba(91,33,182,.25)",
  }}
>
  <button
    onClick={() => window.history.back()}
    style={{
      background: "rgba(255,255,255,.15)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      padding: "10px 16px",
      cursor: "pointer",
      marginBottom: "25px",
    }}
  >
    ← Volver al Dashboard IPTV
  </button>

  <h1
    style={{
      margin: 0,
      fontSize: "38px",
    }}
  >
    🎬 Suscripciones
  </h1>

  <p
    style={{
      opacity: .9,
      marginTop: "12px",
      fontSize: "17px",
    }}
  >
    Gestiona Netflix, Spotify, HBO, Disney+ y cualquier otra suscripción.
  </p>
</div>

<button
  onClick={() =>
    setShowNewSubscription(true)
  }
  style={{
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px 22px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "30px",
  }}
>
  ➕ Nueva suscripción
</button>

      <Modal
        isOpen={showNewSubscription}
        onClose={() =>
          setShowNewSubscription(false)
        }
        title="Nueva suscripción"
      >

        <Modal
  isOpen={selectedSubscription !== null}
  onClose={() =>
    setSelectedSubscription(null)
  }
  title="Detalles"
>
  {selectedSubscription && (
    <SubscriptionDetails
      subscription={selectedSubscription}
    />
  )}
</Modal>
        <NewSubscription
          onCreated={() => {
            setShowNewSubscription(false);
            loadSubscriptions();
          }}
        />
      </Modal>

      <div>
        {subscriptions.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No hay suscripciones todavía.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
            }}
          >
            {subscriptions.map((item) => (
              <div
                key={item.id}
                onClick={() =>
  setSelectedSubscription(item)
}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "15px",
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                }}
              >
                <h3 style={{ margin: 0, marginBottom: "10px" }}>
                  {item.services?.name}
                </h3>

                <p>
                  <strong>Cuenta:</strong> {item.account_name}
                </p>

                <p>
                  <strong>Correo:</strong> {item.email}
                </p>

                <p>
                  <strong>Compra:</strong> {item.cost_price} €
                </p>

                <p>
                  <strong>Venta:</strong> {item.sale_price} €
                </p>

                <p style={{ color: "#16a34a", fontWeight: "600" }}>
                  Beneficio: {(Number(item.sale_price) - Number(item.cost_price)).toFixed(2)} €
                </p>

                <p>
                  <strong>Caduca:</strong> {item.end_date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
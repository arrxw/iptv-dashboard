import { useState } from "react";

interface Props {
  subscription: any;
}

export default function SubscriptionDetails({
  subscription,
}: Props) {
  const [showSensitive, setShowSensitive] =
    useState(false);

  const profit =
    Number(subscription.sale_price) -
    Number(subscription.cost_price);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        {subscription.services?.name}
      </h2>

      <p>
        <strong>Cuenta</strong>
        <br />
        {subscription.account_name}
      </p>

      <p>
        <strong>Correo</strong>
        <br />
        {subscription.email}
      </p>

      <p>
        <strong>Contraseña</strong>
        <br />
        {showSensitive
          ? subscription.password
          : "••••••••••"}
      </p>

      <hr />

      <p>
        <strong>Compra</strong>
        <br />
        {showSensitive
          ? `${subscription.cost_price} €`
          : "••••••"}
      </p>

      <p>
        <strong>Venta</strong>
        <br />
        {showSensitive
          ? `${subscription.sale_price} €`
          : "••••••"}
      </p>

      <p>
        <strong>Beneficio</strong>
        <br />
        {showSensitive
          ? `${profit.toFixed(2)} €`
          : "••••••"}
      </p>

      <hr />

      <p>
        <strong>Inicio</strong>
        <br />
        {subscription.start_date}
      </p>

      <p>
        <strong>Caduca</strong>
        <br />
        {subscription.end_date}
      </p>

      <p>
        <strong>Notas</strong>
        <br />
        {subscription.notes || "-"}
      </p>

      <button
        onClick={() =>
          setShowSensitive(!showSensitive)
        }
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: "#7c3aed",
          color: "white",
          cursor: "pointer",
        }}
      >
        {showSensitive
          ? "🙈 Ocultar datos"
          : "👁 Mostrar datos"}
      </button>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button style={{ flex: 1 }}>
          ✏ Editar
        </button>

        <button style={{ flex: 1 }}>
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}
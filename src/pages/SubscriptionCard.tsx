interface Props {
  subscription: any;
}

export default function SubscriptionCard({
  subscription,
}: Props) {
  const profit =
    Number(subscription.sale_price) -
    Number(subscription.cost_price);

  const profitColor =
    profit > 0
      ? "#16a34a"
      : profit < 0
      ? "#dc2626"
      : "#f59e0b";

  return (
    <div
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "22px",
        boxShadow: "0 6px 20px rgba(0,0,0,.08)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
          }}
        >
          {subscription.services?.name}
        </h2>

        <span
          style={{
            background: "#ede9fe",
            color: "#6d28d9",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Activa
        </span>
      </div>

      <div>
        <strong>Cuenta</strong>

        <br />

        {subscription.account_name}
      </div>

      <div>
        <strong>Correo</strong>

        <br />

        {subscription.email}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>Compra</strong>

          <br />

          {subscription.cost_price} €
        </div>

        <div>
          <strong>Venta</strong>

          <br />

          {subscription.sale_price} €
        </div>
      </div>

      <div
        style={{
          fontWeight: "700",
          color: profitColor,
          fontSize: "18px",
        }}
      >
        Beneficio: {profit.toFixed(2)} €
      </div>

      <div>
        <strong>Caduca</strong>

        <br />

        {subscription.end_date}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <button>✏ Editar</button>

        <button>🔄 Renovar</button>

        <button>🗑 Eliminar</button>
      </div>
    </div>
  );
}
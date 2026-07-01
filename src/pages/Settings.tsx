export default function Settings() {
  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>⚙️ Configuración</h1>

      <p>
        Desde aquí podrás administrar la aplicación.
      </p>

      <div
        style={{
          display: "grid",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          📺 Aplicaciones IPTV
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          🔗 Enlaces rápidos
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          👤 Cuenta
        </div>
      </div>
    </div>
  );
}
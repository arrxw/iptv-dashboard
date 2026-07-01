import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

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
          onClick={() =>
            navigate("/settings/apps")
          }
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow:
              "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h2>📺 Aplicaciones IPTV</h2>

          <p>
            Gestionar aplicaciones
          </p>
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
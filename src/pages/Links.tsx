
import { useNavigate } from "react-router-dom";

export default function Links() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/")}>
        ← Volver
      </button>

      <h1>Enlaces rápidos</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <a
          href="https://AQUI-LINK-1.com"
          target="_blank"
        >
          Panel IPTV
        </a>

        <a
          href="https://AQUI-LINK-2.com"
          target="_blank"
        >
          Activación Elk Player
        </a>

        <a
          href="https://AQUI-LINK-3.com"
          target="_blank"
        >
          Activación Hot IPTV
        </a>

        <a
          href="https://AQUI-LINK-4.com"
          target="_blank"
        >
          Formuler
        </a>
      </div>
    </div>
  );
}
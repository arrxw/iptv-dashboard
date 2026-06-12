import { useNavigate } from "react-router-dom";

export default function Tools() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/")}>
        ← Volver
      </button>

      <h1>Herramientas</h1>

      <ul>
        <li>
          Calculadora de renovaciones
        </li>

        <li>
          Conversor de fechas
        </li>

        <li>
          Bloc de notas rápido
        </li>
      </ul>
    </div>
  );
}
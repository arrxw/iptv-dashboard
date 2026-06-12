import { useNavigate } from "react-router-dom";

export default function Tools() {
  const navigate = useNavigate();

  const tools = [
    {
      id: 1,
      name: "Calculadora de renovaciones",
      description: "Calcula fechas de renovación y plazos de vencimiento",
      icon: "📅",
      color: "#667eea",
      bgColor: "rgba(102, 126, 234, 0.1)",
      href: "#",
    },
    {
      id: 2,
      name: "Conversor de fechas",
      description: "Convierte entre diferentes formatos de fecha",
      icon: "🔄",
      color: "#764ba2",
      bgColor: "rgba(118, 75, 162, 0.1)",
      href: "#",
    },
    {
      id: 3,
      name: "Bloc de notas rápido",
      description: "Notas instantáneas sin guardar",
      icon: "📝",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      href: "#",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        paddingBottom: "40px",
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px 20px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border:
                  "1px solid rgba(255,255,255,0.2)",
                background:
                  "rgba(255,255,255,0.1)",
                color: "white",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                transition: "all 0.2s",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.1)";
              }}
            >
              ← Volver
            </button>
          </div>

          <div>
            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "32px",
                fontWeight: "700",
                letterSpacing: "-1px",
              }}
            >
              🛠 Herramientas
            </h1>

            <p
              style={{
                margin: "0",
                opacity: 0.9,
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Acceso rápido a utilidades
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={tool.href}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "28px",
                  border: "2px solid #e5e7eb",
                  cursor: "pointer",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                  transition:
                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(0,0,0,0.15)";
                  e.currentTarget.style.borderColor =
                    tool.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor =
                    "#e5e7eb";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background:
                      tool.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    fontSize: "24px",
                  }}
                >
                  {tool.icon}
                </div>

                {/* Content */}
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#1f2937",
                    }}
                  >
                    {tool.name}
                  </h3>

                  <p
                    style={{
                      margin: "0",
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.5",
                    }}
                  >
                    {tool.description}
                  </p>
                </div>

                {/* Button */}
                <button
                  style={{
                    marginTop: "8px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      tool.bgColor,
                    color: tool.color,
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    transition:
                      "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      tool.color;
                    e.currentTarget.style.color =
                      "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      tool.bgColor;
                    e.currentTarget.style.color =
                      tool.color;
                  }}
                >
                  Abrir →
                </button>
              </div>
            </a>
          ))}
        </div>

        {/* Info Box */}
        <div
          style={{
            marginTop: "40px",
            padding: "24px",
            background: "#f0f4ff",
            borderRadius: "12px",
            borderLeft: "4px solid #667eea",
          }}
        >
          <p
            style={{
              margin: "0",
              color: "#4c51bf",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            ℹ️ Las herramientas están disponibles para facilitar tus tareas
            diarias. Accede a ellas cuando las necesites desde aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
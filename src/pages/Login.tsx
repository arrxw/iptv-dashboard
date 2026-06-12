import { useState } from "react";
import { supabase } from "../services/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError(
          authError.message ||
            "Error al iniciar sesión"
        );
      }
    } catch (err) {
      setError(
        "Error inesperado. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Card */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "48px 32px",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Logo/Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              📺
            </div>

            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "28px",
                fontWeight: "700",
                color: "#1f2937",
                letterSpacing: "-0.5px",
              }}
            >
              IPTV Dashboard
            </h1>

            <p
              style={{
                margin: "0",
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              Gestión de clientes y
              dispositivos
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "8px",
                background:
                  "#fee2e2",
                border: "1px solid #fca5a5",
                color: "#eb1414",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div
              style={{
                marginBottom: "16px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "6px",
                  textTransform:
                    "uppercase",
                }}
              >
                Correo
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border:
                    "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition:
                    "all 0.2s",
                  background: loading
                    ? "#94b5d6"
                    : "white",
                  opacity: loading ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor =
                      "#667eea";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "#e5e7eb";
                  e.currentTarget.style.boxShadow =
                    "none";
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "6px",
                  textTransform:
                    "uppercase",
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                disabled={loading}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border:
                    "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition:
                    "all 0.2s",
                  background: loading
                    ? "#f9fafb"
                    : "white",
                  opacity: loading ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor =
                      "#667eea";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "#e5e7eb";
                  e.currentTarget.style.boxShadow =
                    "none";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition:
                  "all 0.2s",
                opacity: loading
                  ? 0.8
                  : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform =
                    "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(102, 126, 234, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "none";
              }}
            >
              {loading
                ? "Accediendo al sistema..."
                : "Iniciar sesión 🚀"}
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              marginTop: "24px",
              textAlign: "center",
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            Acceso restringido a
            usuarios autorizados
          </p>
        </div>
      </div>
    </div>
  );
}
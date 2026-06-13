import { useState } from "react";
import { supabase } from "../services/supabase";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const { toasts, error }       = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      error(err.message);
    }

    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: 20,
    }}>
      {/* Logo / marca */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          background: "var(--accent-dim)",
          border: "1px solid var(--accent-glow)",
          borderRadius: "var(--radius-lg)",
          marginBottom: 16,
          fontSize: 24,
        }}>
          📺
        </div>
        <h1 style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
          IPTV Dashboard
        </h1>
        <p style={{ marginTop: 6, color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Panel de gestión de clientes
        </p>
      </div>

      {/* Card del formulario */}
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="admin@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 4, justifyContent: "center", padding: "11px 16px" }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Entrando...
              </>
            ) : "Entrar"}
          </button>
        </form>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

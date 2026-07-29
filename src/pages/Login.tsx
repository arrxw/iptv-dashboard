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
    } catch {
      setError(
        "Error inesperado. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel card">
        <div className="login-brand">
          <div className="login-brand-mark">IPTV</div>
          <div>
            <h1>IPTV Dashboard</h1>
            <p className="muted-text">
              Gestión moderna de clientes y dispositivos.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert-panel alert-panel--critical">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-field">
            <label className="form-field__label">Correo</label>
            <input
              type="email"
              className="input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-field__label">Contraseña</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="button button--primary button--lg"
            disabled={loading}
          >
            {loading ? "Accediendo al sistema..." : "Iniciar sesión 🚀"}
          </button>
        </form>

        <p className="login-footer muted-text">
          Acceso restringido a usuarios autorizados.
        </p>
      </div>
    </div>
  );
}

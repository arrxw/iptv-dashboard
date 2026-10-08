import { useState } from "react";
import { supabase } from "../services/supabase";
import { Lock, Mail, Tv } from "lucide-react";

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
          <div className="login-brand-mark">
            <Tv size={26} />
          </div>
          <div>
            <h1 className="login-brand__title">Gestor de Clientes</h1>
            <p className="login-brand__subtitle muted-text">
              Panel de control IPTV y suscripciones
            </p>
          </div>
        </div>

        {error && (
          <div className="alert-panel alert-panel--critical" role="alert">
            <strong>Acceso denegado</strong>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-field">
            <label className="form-field__label" htmlFor="login-email">
              Correo Electrónico
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="input input--has-icon"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className="input input--has-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="button button--primary button--lg"
            disabled={loading}
            style={{ width: "100%", marginTop: "8px" }}
          >
            {loading ? "Accediendo al sistema..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="login-footer muted-text">
          Acceso seguro y restringido a administradores autorizados.
        </p>
      </div>
    </div>
  );
}

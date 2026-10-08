import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppWindow,
  Link2,
  Bell,
  ChevronRight,
  Save,
  Check,
  Shield,
  Smartphone,
} from "lucide-react";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";

const ANNOUNCEMENT_STORAGE_KEYS = {
  enabled: "client-dashboard-announcement-enabled",
  message: "client-dashboard-announcement-message",
  dismissed: "client-dashboard-announcement-dismissed",
};

const DEFAULT_ANNOUNCEMENT_MESSAGE =
  "Novedad: hemos añadido nuevas funciones y mejoras en la plataforma. Revisa la última información antes de continuar.";

export default function Settings() {
  const navigate = useNavigate();
  const [announcementMessage, setAnnouncementMessage] = useState(DEFAULT_ANNOUNCEMENT_MESSAGE);
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementSaved, setAnnouncementSaved] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedMessage = window.localStorage.getItem(ANNOUNCEMENT_STORAGE_KEYS.message);
    const storedEnabled = window.localStorage.getItem(ANNOUNCEMENT_STORAGE_KEYS.enabled);

    setAnnouncementMessage(storedMessage?.trim() ? storedMessage : DEFAULT_ANNOUNCEMENT_MESSAGE);
    setAnnouncementEnabled(storedEnabled !== "false");
  }, []);

  const saveAnnouncement = () => {
    if (typeof window === "undefined") {
      return;
    }

    const sanitizedMessage = announcementMessage.trim() || DEFAULT_ANNOUNCEMENT_MESSAGE;
    window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEYS.message, sanitizedMessage);
    window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEYS.enabled, String(announcementEnabled));
    window.localStorage.setItem(
      ANNOUNCEMENT_STORAGE_KEYS.dismissed,
      announcementEnabled ? "false" : "true"
    );

    setAnnouncementMessage(sanitizedMessage);
    setAnnouncementSaved(
      announcementEnabled
        ? "Aviso activado y listo para mostrarse."
        : "Aviso desactivado; no volverá a mostrarse."
    );
    window.dispatchEvent(new Event("announcement:updated"));

    setTimeout(() => {
      setAnnouncementSaved("");
    }, 3000);
  };

  const toggleAnnouncement = () => {
    setAnnouncementEnabled((previous) => !previous);
  };

  return (
    <PageShell>
      <div className="settings-page">
        <PageHeader
          title="Configuración"
          subtitle="Ajustes de la plataforma, aplicaciones, enlaces y notificaciones del sistema"
          variant="hero"
        />

        {/* Grupo de accesos móviles estilo iOS */}
        <section className="settings-group card">
          <div
            className="settings-row"
            onClick={() => navigate("/settings/apps")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/settings/apps");
            }}
          >
            <div className="settings-row__icon-wrap">
              <AppWindow size={20} className="text-accent" />
            </div>
            <div className="settings-row__content">
              <h3 className="settings-row__title">Aplicaciones IPTV</h3>
              <p className="settings-row__subtitle muted-text text-sm">
                Gestionar catálogo de apps (Elk Player, Hot Player, IBO Player...)
              </p>
            </div>
            <ChevronRight size={18} className="text-muted settings-row__arrow" />
          </div>

          <div
            className="settings-row"
            onClick={() => navigate("/links")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/links");
            }}
          >
            <div className="settings-row__icon-wrap">
              <Link2 size={20} className="text-accent" />
            </div>
            <div className="settings-row__content">
              <h3 className="settings-row__title">Enlaces Rápidos</h3>
              <p className="settings-row__subtitle muted-text text-sm">
                Accesos directos a portales de activación y paneles de control
              </p>
            </div>
            <ChevronRight size={18} className="text-muted settings-row__arrow" />
          </div>

          <div
            className="settings-row"
            onClick={() => navigate("/subscriptions")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/subscriptions");
            }}
          >
            <div className="settings-row__icon-wrap">
              <Smartphone size={20} className="text-accent" />
            </div>
            <div className="settings-row__content">
              <h3 className="settings-row__title">Suscripciones & Streaming</h3>
              <p className="settings-row__subtitle muted-text text-sm">
                Servicios y cuentas compartidas contratadas
              </p>
            </div>
            <ChevronRight size={18} className="text-muted settings-row__arrow" />
          </div>
        </section>

        {/* Sección: Configuración del Aviso General */}
        <section className="card">
          <div className="card__header">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-accent" />
              <h3 className="card__title" style={{ fontSize: "1.1rem" }}>
                Aviso global en pantalla (Modal Popup)
              </h3>
            </div>
          </div>

          <div className="card__body">
            <p className="muted-text text-sm" style={{ marginBottom: "16px" }}>
              Define un anuncio emergente que verán los usuarios al ingresar a la plataforma.
            </p>

            <div className="form-field">
              <label className="form-field__label">Mensaje del aviso</label>
              <textarea
                className="textarea"
                value={announcementMessage}
                onChange={(event) => setAnnouncementMessage(event.target.value)}
                placeholder="Escribe el mensaje del comunicado..."
                rows={3}
              />
            </div>

            <div className="settings-toggle-row" style={{ marginTop: "16px" }}>
              <div className="settings-toggle-label">
                <strong>Estado del aviso:</strong>
                <span className={`badge ${announcementEnabled ? "badge--success" : "badge--warning"}`}>
                  {announcementEnabled ? "Activado" : "Desactivado"}
                </span>
              </div>
              <button
                type="button"
                className={`button button--sm ${announcementEnabled ? "button--secondary" : "button--primary"}`}
                onClick={toggleAnnouncement}
              >
                {announcementEnabled ? "Desactivar aviso" : "Activar aviso"}
              </button>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="button button--primary button--lg"
                style={{ width: "100%" }}
                onClick={saveAnnouncement}
              >
                <Save size={16} />
                <span>Guardar configuración de aviso</span>
              </button>
            </div>

            {announcementSaved && (
              <div
                className="alert-panel alert-panel--success"
                style={{ marginTop: "14px", padding: "12px" }}
              >
                <div className="flex items-center gap-2 text-sm text-success">
                  <Check size={16} />
                  <span>{announcementSaved}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Información del Sistema */}
        <section className="card">
          <div className="card__header">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-accent" />
              <h3 className="card__title" style={{ fontSize: "1.1rem" }}>
                Seguridad y Plataforma
              </h3>
            </div>
          </div>
          <div className="card__body">
            <div className="system-info-list muted-text text-sm">
              <div className="system-info-item">
                <span>Versión:</span>
                <strong>2.0 Mobile-First</strong>
              </div>
              <div className="system-info-item">
                <span>Motor:</span>
                <strong>React 19 + Vite</strong>
              </div>
              <div className="system-info-item">
                <span>Estado de sesión:</span>
                <span className="badge badge--success">Conectado</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

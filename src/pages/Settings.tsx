import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";

const ANNOUNCEMENT_STORAGE_KEYS = {
  enabled: "iptv-dashboard-announcement-enabled",
  message: "iptv-dashboard-announcement-message",
  dismissed: "iptv-dashboard-announcement-dismissed",
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
        ? "Aviso activado y listo para mostrarse la próxima vez."
        : "Aviso desactivado; no volverá a mostrarse."
    );
    window.dispatchEvent(new Event("announcement:updated"));
  };

  const toggleAnnouncement = () => {
    setAnnouncementEnabled((previous) => !previous);
  };

  return (
    <PageShell>
      <div className="settings-page">
        <PageHeader
          title="Configuración"
          subtitle="Ajusta los elementos centrales de la plataforma IPTV desde un panel ordenado."
        />

        <div className="card-grid card-grid--columns-2">
          <button className="card card--clickable" type="button" onClick={() => navigate("/settings/apps")}>
            <div className="card__header">
              <h3>Aplicaciones IPTV</h3>
            </div>
            <div className="card__body">
              <p className="muted-text">Gestionar aplicaciones que pueden asignarse al crear dispositivos.</p>
            </div>
          </button>

          <section className="card">
            <div className="card__header">
              <h3>Enlaces rápidos</h3>
            </div>
            <div className="card__body">
              <p className="muted-text">Revisa y actualiza tus accesos directos a servicios externos.</p>
            </div>
          </section>

          <section className="card">
            <div className="card__header">
              <h3>Cuenta</h3>
            </div>
            <div className="card__body">
              <p className="muted-text">Detalles básicos de tu cuenta, seguridad y preferencias.</p>
            </div>
          </section>

          <section className="card">
            <div className="card__header">
              <h3>Aviso de novedades</h3>
            </div>
            <div className="card__body">
              <div className="form-grid">
                <label className="form-field">
                  <span className="form-field__label">Mensaje del aviso</span>
                  <textarea
                    className="textarea"
                    value={announcementMessage}
                    onChange={(event) => setAnnouncementMessage(event.target.value)}
                    placeholder="Escribe aquí el aviso que verán los usuarios al entrar..."
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
                <button type="button" className="button button--secondary button--sm" onClick={toggleAnnouncement}>
                  {announcementEnabled ? "Desactivar aviso" : "Activar aviso"}
                </button>
                <button type="button" className="button button--primary button--sm" onClick={saveAnnouncement}>
                  Guardar aviso
                </button>
              </div>

              {announcementSaved ? <p className="muted-text" style={{ marginTop: "16px" }}>{announcementSaved}</p> : null}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

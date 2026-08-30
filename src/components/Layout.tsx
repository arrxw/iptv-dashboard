import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Settings2, X } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/subscriptions": "Suscripciones",
  "/links": "Enlaces",
  "/settings": "Configuración",
  "/settings/apps": "Aplicaciones IPTV",
};

const ANNOUNCEMENT_STORAGE_KEYS = {
  enabled: "iptv-dashboard-announcement-enabled",
  message: "iptv-dashboard-announcement-message",
  dismissed: "iptv-dashboard-announcement-dismissed",
};

const DEFAULT_ANNOUNCEMENT_MESSAGE =
  "Novedad: hemos añadido nuevas funciones y mejoras en la plataforma. Revisa la última información antes de continuar.";

function getStoredAnnouncementValue(key: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
}

function AnnouncementModal() {
  const [announcement, setAnnouncement] = useState(() => ({
    enabled: getStoredAnnouncementValue(ANNOUNCEMENT_STORAGE_KEYS.enabled, "true") === "true",
    message: getStoredAnnouncementValue(ANNOUNCEMENT_STORAGE_KEYS.message, DEFAULT_ANNOUNCEMENT_MESSAGE).trim(),
    dismissed: getStoredAnnouncementValue(ANNOUNCEMENT_STORAGE_KEYS.dismissed, "false") === "true",
  }));

  useEffect(() => {
    const syncAnnouncement = () => {
      setAnnouncement({
        enabled: getStoredAnnouncementValue(ANNOUNCEMENT_STORAGE_KEYS.enabled, "true") === "true",
        message: getStoredAnnouncementValue(ANNOUNCEMENT_STORAGE_KEYS.message, DEFAULT_ANNOUNCEMENT_MESSAGE).trim(),
        dismissed: getStoredAnnouncementValue(ANNOUNCEMENT_STORAGE_KEYS.dismissed, "false") === "true",
      });
    };

    window.addEventListener("announcement:updated", syncAnnouncement);
    window.addEventListener("storage", syncAnnouncement);

    return () => {
      window.removeEventListener("announcement:updated", syncAnnouncement);
      window.removeEventListener("storage", syncAnnouncement);
    };
  }, []);

  if (!announcement.enabled || !announcement.message || announcement.dismissed) {
    return null;
  }

  const handleDismiss = () => {
    window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEYS.dismissed, "true");
    window.dispatchEvent(new Event("announcement:updated"));
  };

  return (
    <div className="announcement-modal-overlay">
      <div className="announcement-modal">
        <button
          type="button"
          className="announcement-modal__close"
          onClick={handleDismiss}
          aria-label="Cerrar aviso"
        >
          <X size={24} />
        </button>
        
        <div className="announcement-modal__content">
          <div className="announcement-modal__icon">📣</div>
          <h2 className="announcement-modal__title">Aviso importante</h2>
          <p className="announcement-modal__message">{announcement.message}</p>
        </div>

        <button type="button" className="button button--primary button--lg" onClick={handleDismiss}>
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();

  const currentTitle = useMemo(() => {
    if (location.pathname.startsWith("/settings/apps")) {
      return "Aplicaciones IPTV";
    }

    return routeTitles[location.pathname] || "IPTV SaaS";
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <AnnouncementModal />
      <div className="app-shell__workspace">
        <div className="topbar">
          <div className="topbar__breadcrumb">
            <span className="topbar__breadcrumb-label">{currentTitle}</span>
          </div>
          <div className="topbar__status">
            <NavLink to="/settings" aria-label="Ajustes" className="button button--ghost topbar__settings">
              <Settings2 size={18} />
            </NavLink>
          </div>
        </div>

        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}


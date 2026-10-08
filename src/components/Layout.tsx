import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Users, CreditCard, Link2, Settings2, X } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/": "Clientes",
  "/subscriptions": "Suscripciones",
  "/links": "Enlaces",
  "/settings": "Configuración",
  "/settings/apps": "Aplicaciones",
};

const ANNOUNCEMENT_STORAGE_KEYS = {
  enabled: "client-dashboard-announcement-enabled",
  message: "client-dashboard-announcement-message",
  dismissed: "client-dashboard-announcement-dismissed",
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
          <X size={20} />
        </button>
        
        <div className="announcement-modal__content">
          <div className="announcement-modal__icon">📣</div>
          <h2 className="announcement-modal__title">Aviso importante</h2>
          <p className="announcement-modal__message">{announcement.message}</p>
        </div>

        <button type="button" className="button button--primary button--lg" style={{ width: "100%" }} onClick={handleDismiss}>
          Entendido
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
      return "Aplicaciones";
    }
    if (location.pathname.startsWith("/client/")) {
      return "Ficha de cliente";
    }

    return routeTitles[location.pathname] || "Gestor de clientes";
  }, [location.pathname]);

  const navItems = [
    { to: "/", label: "Clientes", icon: Users },
    { to: "/subscriptions", label: "Suscripciones", icon: CreditCard },
    { to: "/links", label: "Enlaces", icon: Link2 },
    { to: "/settings", label: "Ajustes", icon: Settings2 },
  ];

  return (
    <div className="app-shell">
      <AnnouncementModal />
      <div className="app-shell__workspace">
        <header className="topbar">
          <div className="topbar__brand-group">
            <span className="topbar__logo-dot" />
            <h1 className="topbar__title">{currentTitle}</h1>
          </div>

          <nav className="topbar__desktop-nav" aria-label="Navegación principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`topbar__nav-link ${isActive ? "topbar__nav-link--active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="topbar__status">
            <NavLink
              to="/settings"
              aria-label="Ajustes de la plataforma"
              className="topbar__icon-btn"
            >
              <Settings2 size={18} />
            </NavLink>
          </div>
        </header>

        <main className="app-shell__content">{children}</main>

        <nav className="mobile-nav" aria-label="Barra de navegación móvil">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}
              >
                <div className="mobile-nav__icon-box">
                  <Icon size={20} />
                </div>
                <span className="mobile-nav__label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

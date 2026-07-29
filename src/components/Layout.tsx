import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Tv,
  Settings2,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/subscriptions",
    label: "Suscripciones",
    icon: Tv,
  },
  {
    to: "/links",
    label: "Enlaces",
    icon: LinkIcon,
  },
  {
    to: "/settings",
    label: "Ajustes",
    icon: Settings2,
  },
];

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/subscriptions": "Suscripciones",
  "/links": "Enlaces",
  "/settings": "Configuración",
  "/settings/apps": "Aplicaciones IPTV",
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentTitle = useMemo(() => {
    if (location.pathname.startsWith("/settings/apps")) {
      return "Aplicaciones IPTV";
    }

    return routeTitles[location.pathname] || "IPTV SaaS";
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">IPTV</div>
          <div>
            <p className="sidebar__brand-name">IPTV Manager</p>
            <p className="sidebar__brand-subtitle">Control premium</p>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
            >
              <span className="sidebar__link-icon">
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__footer-badge">
            <ShieldCheck size={14} />
            <span>Seguro</span>
          </div>
          <p className="sidebar__footer-copy">
            Navegación rápida y confiable.
          </p>
        </div>
      </aside>

      <div className="app-shell__workspace">
        <div className="topbar">
          <button
            type="button"
            className="topbar__toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar__breadcrumb">
            <span className="topbar__breadcrumb-label">
              {currentTitle}
            </span>
          </div>
          <div className="topbar__status">
            <span className="badge badge--success">Activa</span>
          </div>
        </div>

        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}

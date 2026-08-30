import { useMemo, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Settings2 } from "lucide-react";

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

  const currentTitle = useMemo(() => {
    if (location.pathname.startsWith("/settings/apps")) {
      return "Aplicaciones IPTV";
    }

    return routeTitles[location.pathname] || "IPTV SaaS";
  }, [location.pathname]);

  return (
    <div className="app-shell">
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

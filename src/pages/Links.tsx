import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";

type LinkItem = {
  id: number;
  name: string;
  description: string;
  icon: string;
  variant: string;
  href: string;
  category: string;
  badgeClass: "success" | "info" | "warning" | "danger";
  ctaLabel: string;
  secondaryLabel: string;
};

export default function Links() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const links: LinkItem[] = [
    {
      id: 1,
      name: "Panel IPTV",
      description: "Acceso directo al panel principal para revisar y gestionar clientes.",
      icon: "📺",
      variant: "success",
      href: "https://greatott.pro/login.php",
      category: "Panel",
      badgeClass: "success",
      ctaLabel: "Abrir",
      secondaryLabel: "Copiar",
    },
    {
      id: 2,
      name: "Activación Elk Player",
      description: "Portal de activación para Elk Player en dispositivo o app.",
      icon: "🍊",
      variant: "amber",
      href: "https://elkplayer.com/activationho",
      category: "Activación",
      badgeClass: "warning",
      ctaLabel: "Ir al sitio",
      secondaryLabel: "Copiar",
    },
    {
      id: 3,
      name: "Activación Hot IPTV",
      description: "Portal oficial para activar la suscripción en Hot IPTV.",
      icon: "🔥",
      variant: "danger",
      href: "https://hotplayer.app/upload",
      category: "Activación",
      badgeClass: "danger",
      ctaLabel: "Abrir",
      secondaryLabel: "Copiar",
    },
    {
      id: 4,
      name: "IBOPlayer",
      description: "Activa IBOPlayer con tus credenciales en el portal del cliente.",
      icon: "🔴",
      variant: "red",
      href: "https://iboplayer.com/device/login",
      category: "Cliente",
      badgeClass: "info",
      ctaLabel: "Entrar",
      secondaryLabel: "Copiar",
    },
    {
      id: 5,
      name: "MEGA IPTV",
      description: "Plataforma para dispositivos compatibles con la app MEGA IPTV.",
      icon: "Ⓜ️",
      variant: "violet",
      href: "https://mega-iptv.app/mylist",
      category: "App",
      badgeClass: "info",
      ctaLabel: "Abrir app",
      secondaryLabel: "Copiar",
    },
    {
      id: 6,
      name: "SmartONE",
      description: "Portal SmartONE para generar la configuración del dispositivo.",
      icon: "🐈",
      variant: "cyan",
      href: "https://smartone-iptv.com/es/plugin/smart_one/main_generate",
      category: "Generador",
      badgeClass: "success",
      ctaLabel: "Configurar",
      secondaryLabel: "Copiar",
    },
    {
      id: 7,
      name: "Tivimate",
      description: "Accede a la guía de configuración de Tivimate para TV y Android.",
      icon: "📱",
      variant: "blue",
      href: "https://tivimate.com/",
      category: "Soporte",
      badgeClass: "info",
      ctaLabel: "Ver guía",
      secondaryLabel: "Copiar",
    },
    {
      id: 8,
      name: "IPTV Smarters",
      description: "Portal de ayuda para configuración de IPTV Smarters Pro.",
      icon: "🧩",
      variant: "indigo",
      href: "https://www.iptvsmarters.com/",
      category: "App",
      badgeClass: "success",
      ctaLabel: "Abrir",
      secondaryLabel: "Copiar",
    },
    {
      id: 9,
      name: "Ayuda general",
      description: "Revisa instrucciones, solución de problemas y pasos rápidos.",
      icon: "🛠️",
      variant: "slate",
      href: "https://support.google.com/",
      category: "Guía",
      badgeClass: "warning",
      ctaLabel: "Abrir ayuda",
      secondaryLabel: "Copiar",
    },
  ];

  const handleCopy = async (link: LinkItem) => {
    try {
      await navigator.clipboard.writeText(link.href);
      setCopiedId(link.id);
      window.setTimeout(() => setCopiedId((current) => (current === link.id ? null : current)), 1200);
    } catch {
      window.prompt("Copia este enlace:", link.href);
    }
  };

  return (
    <PageShell>
      <div className="links-page">
        <PageHeader
          title="Enlaces rápidos"
          subtitle="⚠️ Asegúrate de tener las credenciales correctas antes de acceder a cada servicio."
          actions={
            <button className="button button--secondary button--sm" onClick={() => navigate(-1)} type="button">
              ← Volver
            </button>
          }
        />

        <div className="card-grid card-grid--columns-3">
          {links.map((link) => (
            <article key={link.id} className="link-card">
              <div className="link-card__header">
                <div className={`link-card__icon link-card__icon--${link.variant}`}>
                  {link.icon}
                </div>
                <span className={`badge badge--${link.badgeClass}`}>{link.category}</span>
              </div>

              <div className="link-card__content">
                <h3>{link.name}</h3>
                <p className="muted-text">{link.description}</p>
              </div>

              <div className="link-card__actions">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary button--sm"
                >
                  {link.ctaLabel}
                </a>
                <button
                  type="button"
                  className="button button--secondary button--sm"
                  onClick={() => handleCopy(link)}
                >
                  {copiedId === link.id ? "¡Copiado!" : link.secondaryLabel}
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="card alert-panel alert-panel--success">
          <p className="BOLD-text">
            ℹ️ Asegúrate de tener las credenciales correctas antes de acceder a cada servicio.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

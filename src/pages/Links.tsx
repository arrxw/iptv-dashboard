import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Copy, Check, AlertCircle } from "lucide-react";
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
      name: "Panel de gestión OTT",
      description: "Acceso directo al panel principal para revisar y gestionar clientes.",
      icon: "📺",
      variant: "success",
      href: "https://greatott.pro/login.php",
      category: "Panel",
      badgeClass: "success",
      ctaLabel: "Abrir panel",
      secondaryLabel: "Copiar enlace",
    },
    {
      id: 2,
      name: "Activación Elk Player",
      description: "Portal de activación oficial para Elk Player en dispositivos Android y Smart TV.",
      icon: "🍊",
      variant: "amber",
      href: "https://elkplayer.com/activationho",
      category: "Activación",
      badgeClass: "warning",
      ctaLabel: "Ir al sitio",
      secondaryLabel: "Copiar enlace",
    },
    {
      id: 3,
      name: "Activación Hot Player",
      description: "Portal oficial para subir listas y activar la suscripción en Hot Player.",
      icon: "🔥",
      variant: "danger",
      href: "https://hotplayer.app/upload",
      category: "Activación",
      badgeClass: "danger",
      ctaLabel: "Abrir Hot Player",
      secondaryLabel: "Copiar enlace",
    },
    {
      id: 4,
      name: "IBO Player Portal",
      description: "Activa IBO Player con tus credenciales y MAC en el portal del cliente.",
      icon: "🔴",
      variant: "red",
      href: "https://iboplayer.com/device/login",
      category: "Cliente",
      badgeClass: "info",
      ctaLabel: "Entrar a IBO",
      secondaryLabel: "Copiar enlace",
    },
    {
      id: 5,
      name: "TiviMate Portal",
      description: "Accede a la guía de configuración y licencia de TiviMate para TV y Android.",
      icon: "📱",
      variant: "blue",
      href: "https://tivimate.com/",
      category: "Soporte",
      badgeClass: "info",
      ctaLabel: "Ver guía",
      secondaryLabel: "Copiar enlace",
    },
    {
      id: 6,
      name: "Soporte y Guías",
      description: "Instrucciones de configuración, solución de problemas y soporte rápido.",
      icon: "🛠️",
      variant: "slate",
      href: "https://support.google.com/",
      category: "Guía",
      badgeClass: "warning",
      ctaLabel: "Abrir ayuda",
      secondaryLabel: "Copiar enlace",
    },
  ];

  const handleCopy = async (link: LinkItem) => {
    try {
      await navigator.clipboard.writeText(link.href);
      setCopiedId(link.id);
      window.setTimeout(
        () => setCopiedId((current) => (current === link.id ? null : current)),
        1500
      );
    } catch {
      window.prompt("Copia este enlace:", link.href);
    }
  };

  return (
    <PageShell>
      <div className="links-page">
        <PageHeader
          title="Enlaces rápidos"
          subtitle="Accesos directos a paneles de activación, reproductores y herramientas IPTV"
          variant="hero"
          backButton={
            <button
              className="button button--secondary button--sm"
              onClick={() => navigate(-1)}
              type="button"
            >
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>
          }
        />

        <div className="card-grid card-grid--columns-3">
          {links.map((link) => (
            <article key={link.id} className="link-card card">
              <div className="link-card__header">
                <div className={`link-card__icon link-card__icon--${link.variant}`}>
                  <span>{link.icon}</span>
                </div>
                <span className={`badge badge--${link.badgeClass}`}>{link.category}</span>
              </div>

              <div className="link-card__content">
                <h3 className="link-card__title">{link.name}</h3>
                <p className="link-card__desc muted-text">{link.description}</p>
              </div>

              <div className="link-card__actions">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary button--sm"
                  style={{ flex: 1 }}
                >
                  <ExternalLink size={14} />
                  <span>{link.ctaLabel}</span>
                </a>

                <button
                  type="button"
                  className="button button--secondary button--sm"
                  onClick={() => handleCopy(link)}
                  aria-label={`Copiar enlace de ${link.name}`}
                >
                  {copiedId === link.id ? (
                    <>
                      <Check size={14} className="text-success" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="alert-panel alert-panel--success">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-info" />
            <p className="text-sm">
              <strong>Nota importante:</strong> Asegúrate de tener a mano las claves y direcciones MAC correctas antes de solicitar la activación en cada plataforma.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

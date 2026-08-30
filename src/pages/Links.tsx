import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";

export default function Links() {
  const navigate = useNavigate();

  const links = [
    {
      id: 1,
      name: "Panel IPTV",
      description: "Acceso al panel",
      icon: "📺",
      variant: "accent",
      href: "https://greatott.pro/login.php",
    },
    {
      id: 2,
      name: "Activación Elk Player",
      description: "Portal de activación para Elk Player",
      icon: "🍊",
      variant: "black",
      href: "https://elkplayer.com/activationho",
    },
    {
      id: 3,
      name: "Activación Hot IPTV",
      description: "Portal de activación para Hot IPTV",
      icon: "🔥",
      variant: "danger",
      href: "https://AQUI-LINK-3.com",
    },
    {
      id: 4,
      name: "IBOPlayer",
      description: "Activar IBOPlayer en tu dispositivo",
      icon: "🔴",
      variant: "success",
      href: "https://iboplayer.com/device/login",
    },
        {
      id: 5,
      name: "MEGA IPTV",
      description: "Plataforma MEGA IPTV para dispositivos",
      icon: "Ⓜ️",
      variant: "success",
      href: "https://mega-iptv.app/mylist",
    },
  ];

  return (
    <PageShell>
      <div className="links-page">
        <PageHeader
          title="Enlaces rápidos"
          subtitle="Accede a servicios externos y portales de activación desde un solo lugar."
          actions={
            <button className="button button--secondary button--sm" onClick={() => navigate(-1)}>
              ← Volver
            </button>
          }
        />

        <div className="card-grid card-grid--columns-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <div className={`link-card__icon link-card__icon--${link.variant}`}>
                {link.icon}
              </div>
              <div>
                <h3>{link.name}</h3>
                <p className="muted-text">{link.description}</p>
              </div>
              <span className="badge badge--info">Ir al sitio</span>
            </a>
          ))}
        </div>

        <section className="card alert-panel alert-panel--success">
          <p className="muted-text">
            ℹ️ Los enlaces se abren en una nueva pestaña. Asegúrate de tener las credenciales correctas antes de acceder a cada servicio.
          </p>
        </section>

        <section className="card">
          <h3>Consejo rápido</h3>
          <p className="muted-text">
            Guarda esta página en marcadores para acceso inmediato a tus herramientas más utilizadas.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

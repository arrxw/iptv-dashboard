import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const navigate = useNavigate();

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
        </div>
      </div>
    </PageShell>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";

interface App {
  id: string;
  name: string;
}

export default function SettingsApps() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [newApp, setNewApp] = useState("");

  async function loadApps() {
    const { data } = await supabase.from("apps").select("*").order("name");
    setApps(data || []);
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function addApp() {
    if (!newApp.trim()) return;

    const { error } = await supabase.from("apps").insert({
      name: newApp,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNewApp("");
    loadApps();
  }

  async function editApp(app: App) {
    const newName = prompt("Editar nombre de la aplicación", app.name);
    if (newName === null) return;
    if (!newName.trim()) {
      alert("El nombre de la aplicación no puede estar vacío");
      return;
    }

    const { error } = await supabase.from("apps").update({ name: newName.trim() }).eq("id", app.id);
    if (error) {
      alert(error.message);
      return;
    }

    loadApps();
  }

  async function deleteApp(id: string) {
    if (!confirm("¿Seguro que quieres eliminar esta aplicación?")) return;

    const { error } = await supabase.from("apps").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }

    loadApps();
  }

  return (
    <PageShell>
      <div className="settings-apps-page">
        <PageHeader
          title="Aplicaciones IPTV"
          subtitle="Administra las aplicaciones disponibles para asignar a cada dispositivo."
          actions={
            <button className="button button--secondary button--sm" onClick={() => navigate("/settings")}>← Volver</button>
          }
        />

        <section className="card">
          <div className="card__body">
            <div className="form-grid">
              <div className="form-field">
                <label className="form-field__label">Nueva aplicación</label>
                <input
                  className="input"
                  placeholder="Nombre de la aplicación..."
                  value={newApp}
                  onChange={(e) => setNewApp(e.target.value)}
                />
              </div>
              <button type="button" className="button button--primary button--lg" onClick={addApp}>
                Añadir
              </button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__body">
            <div className="app-list">
              {apps.map((app) => (
                <div key={app.id} className="app-list__item">
                  <span>{app.name}</span>
                  <div className="app-list__actions">
                    <button className="button button--secondary button--sm" type="button" onClick={() => editApp(app)}>
                      Editar
                    </button>
                    <button className="button button--danger button--sm" type="button" onClick={() => deleteApp(app.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

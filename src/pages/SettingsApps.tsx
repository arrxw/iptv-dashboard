import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, Tv } from "lucide-react";
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
      name: newApp.trim(),
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
          variant="hero"
          backButton={
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => navigate("/settings")}
            >
              <ArrowLeft size={16} />
              <span>Ajustes</span>
            </button>
          }
        />

        {/* Input móvil para agregar nueva app */}
        <section className="card">
          <div className="card__body">
            <label className="form-field__label">Añadir nueva aplicación</label>
            <div className="app-add-row" style={{ marginTop: "8px" }}>
              <input
                className="input"
                placeholder="Nombre de la app (ej. Smart IPTV)..."
                value={newApp}
                onChange={(e) => setNewApp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addApp();
                }}
              />
              <button
                type="button"
                className="button button--primary button--lg"
                onClick={addApp}
                disabled={!newApp.trim()}
              >
                <Plus size={18} />
                <span>Añadir</span>
              </button>
            </div>
          </div>
        </section>

        {/* Lista interactiva de aplicaciones */}
        <section className="card">
          <div className="card__header">
            <h3>Catálogo de apps activas ({apps.length})</h3>
          </div>
          <div className="card__body">
            {apps.length === 0 ? (
              <p className="muted-text text-sm">No hay aplicaciones registradas.</p>
            ) : (
              <div className="app-list">
                {apps.map((app) => (
                  <div key={app.id} className="app-list__item">
                    <div className="flex items-center gap-3">
                      <div className="app-item__icon-wrap">
                        <Tv size={16} className="text-accent" />
                      </div>
                      <strong className="app-item__name">{app.name}</strong>
                    </div>

                    <div className="app-list__actions">
                      <button
                        className="button button--secondary button--sm"
                        type="button"
                        onClick={() => editApp(app)}
                        title="Editar nombre"
                      >
                        <Edit2 size={14} />
                        <span>Editar</span>
                      </button>
                      <button
                        className="button button--ghost button--sm"
                        type="button"
                        onClick={() => deleteApp(app.id)}
                        title="Eliminar app"
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

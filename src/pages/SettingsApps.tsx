import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

interface App {
  id: string;
  name: string;
}

export default function SettingsApps() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [newApp, setNewApp] = useState("");

  async function loadApps() {
    const { data } = await supabase
      .from("apps")
      .select("*")
      .order("name");

    setApps(data || []);
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function addApp() {
    if (!newApp.trim()) return;

    const { error } = await supabase
      .from("apps")
      .insert({
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

    const { error } = await supabase
      .from("apps")
      .update({ name: newName.trim() })
      .eq("id", app.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadApps();
  }

  async function deleteApp(id: string) {
    if (!confirm("¿Seguro que quieres eliminar esta aplicación?")) return;

    const { error } = await supabase
      .from("apps")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadApps();
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <button
        onClick={() => navigate("/settings")}
        style={{
          background: "none",
          border: "none",
          color: "#667eea",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "20px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        ← Volver a Configuración
      </button>

      <h1 style={{ marginBottom: "20px" }}>📺 Aplicaciones IPTV</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
        }}
      >
        <input
          placeholder="Nueva aplicación..."
          value={newApp}
          onChange={(e) =>
            setNewApp(e.target.value)
          }
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
        />

        <button
          onClick={addApp}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            background: "#667eea",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
        >
          Añadir
        </button>
      </div>

      {apps.map((app) => (
        <div
          key={app.id}
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            padding: "15px",
            marginBottom: "10px",
            background: "white",
            borderRadius: "10px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#1f2937" }}>{app.name}</span>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => editApp(app)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: "5px",
              }}
              title="Editar"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteApp(app.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: "5px",
              }}
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
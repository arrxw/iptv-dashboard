import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

interface App {
  id: string;
  name: string;
}

export default function SettingsApps() {
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

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>📺 Aplicaciones IPTV</h1>

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
          }}
        />

        <button onClick={addApp}>
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
          <span>{app.name}</span>

          <button>
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}
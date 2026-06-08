import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { Client } from "../types/client";
import NewClient from "./NewClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
  }

  async function loadClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>IPTV Dashboard</h1>

          <button onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        <input
          placeholder="Buscar cliente..."
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        />
        <NewClient
  onCreated={loadClients}
/>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() =>
                navigate(`/client/${client.id}`)
                }
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "12px",
                 cursor: "pointer",
                }}
              >
                <h2>{client.name}</h2>

                {client.whatsapp && (
                  <p>WhatsApp: {client.whatsapp}</p>
                )}

                {client.notes && (
                  <p>{client.notes}</p>
                )}
              </div>
            ))}
          </>
        )}
      </div>

    </div>
  );
}
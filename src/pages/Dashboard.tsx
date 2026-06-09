import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import NewClient from "./NewClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
  }

  async function deleteClient(
    clientId: string,
    clientName: string
  ) {
    const confirmDelete = window.prompt(
      `Escribe "${clientName}" para eliminar`
    );

    if (confirmDelete !== clientName) {
      return;
    }

    const { error: devicesError } =
      await supabase
        .from("devices")
        .delete()
        .eq("client_id", clientId);

    if (devicesError) {
      alert(devicesError.message);
      return;
    }

    const { error } =
      await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadClients();

    alert("Cliente eliminado");
  }

  async function loadClients() {
    const { data, error } =
      await supabase
        .from("clients")
        .select("*")
        .order("name");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    const clientsWithCount =
      await Promise.all(
        (data || []).map(
          async (client) => {
            const {
              count,
            } = await supabase
              .from("devices")
              .select("*", {
                count: "exact",
                head: true,
              })
              .eq(
                "client_id",
                client.id
              );

            return {
              ...client,
              devicesCount:
                count || 0,
            };
          }
        )
      );

    setClients(clientsWithCount);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients =
    clients.filter((client) =>
      client.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

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
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1>IPTV Dashboard</h1>

          <button onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        <input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border:
              "1px solid #ccc",
          }}
        />

        <NewClient
          onCreated={
            loadClients
          }
        />

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <p>
              Clientes:{" "}
              {
                filteredClients.length
              }
            </p>

            {filteredClients.map(
              (client) => (
                <div
                  key={client.id}
                  onClick={() =>
                    navigate(
                      `/client/${client.id}`
                    )
                  }
                  style={{
                    background:
                      "white",
                    padding:
                      "20px",
                    borderRadius:
                      "12px",
                    marginBottom:
                      "12px",
                    cursor:
                      "pointer",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <h2>
                      {client.name}
                    </h2>

                    <span>
                      📺{" "}
                      {
                        client.devicesCount
                      }
                    </span>
                  </div>

                  {client.whatsapp && (
                    <p>
                      📱{" "}
                      {
                        client.whatsapp
                      }
                    </p>
                  )}

                  {client.notes && (
                    <p>
                      {client.notes}
                    </p>
                  )}

                  <button
                    onClick={(
                      e
                    ) => {
                      e.stopPropagation();

                      deleteClient(
                        client.id,
                        client.name
                      );
                    }}
                  >
                    🗑 Eliminar cliente
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import NewClient from "./NewClient";
import Modal from "../components/Modal";
import { formatDate } from "../utils/dateUtils";
import { useNavigate } from "react-router-dom";

const styles = `
  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  .pulse-subtle {
    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewClient, setShowNewClient] =
  useState(false);
  const [showUpcoming, setShowUpcoming] =
  useState(false);

  const navigate = useNavigate();

  function getMinDaysRemaining(
    clientId: string
  ): number {
    const clientDevices = devices.filter(
      (d) => d.client_id === clientId
    );
    if (clientDevices.length === 0)
      return 999;

    return Math.min(
      ...clientDevices.map((d) =>
        daysRemaining(d.end_date)
      )
    );
  }

  function daysRemaining(
    endDate: string
  ): number {
    const today =
      new Date().getTime();

    const end =
      new Date(endDate).getTime();

    const diff =
      end - today;

    return Math.ceil(
      diff /
        (1000 * 60 * 60 * 24)
    );
  }

  function getAlertStatus(
    minDays: number
  ): "normal" | "warning" | "danger" | "critical" {
    if (minDays < 7)
      return "critical";
    if (minDays < 15)
      return "danger";
    if (minDays < 30)
      return "warning";
    return "normal";
  }

  const [devices, setDevices] =
    useState<any[]>([]);

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

    const {
      data: devicesData,
      error: devicesError,
    } = await supabase
      .from("devices")
      .select("*");

    if (devicesError) {
      console.error(devicesError);
    }

    setDevices(devicesData || []);

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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: "18px",
          }}
        >
          Cargando...
        </p>
      </div>
    );
  }

  const upcomingDevices =
    devices
      .filter((d) =>
        daysRemaining(d.end_date) <=
        30 &&
        daysRemaining(d.end_date) >
        0
      )
      .sort(
        (a, b) =>
          daysRemaining(a.end_date) -
          daysRemaining(b.end_date)
      );

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fa",
          paddingBottom: "40px",
        }}
      >
        {/* Cabecera moderna */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "40px 20px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "32px",
                    fontWeight:
                      "700",
                    letterSpacing:
                      "-1px",
                  }}
                >
                  IPTV Manager
                </h1>

                <p
                  style={{
                    margin: "0",
                    opacity: 0.9,
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Gestión de clientes
                  y dispositivos
                </p>
              </div>

              <button
                onClick={logout}
                style={{
                  padding: "10px 20px",
                  borderRadius:
                    "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background:
                    "rgba(255,255,255,0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  transition:
                    "all 0.2s",
                  backdropFilter:
                    "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.1)";
                }}
              >
                ← Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "40px 20px 0",
          }}
        >
          {/* Buscador mejorado */}
          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <input
              placeholder="🔍 Buscar cliente..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius:
                  "12px",
                border:
                  "2px solid #e5e7eb",
                fontSize: "15px",
                transition:
                  "all 0.2s",
                boxSizing:
                  "border-box",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.05)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  "#667eea";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  "#e5e7eb";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.05)";
              }}
            />
          </div>

          {/* Botones de acción */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                setShowNewClient(
                  !showNewClient
                )
              }
              style={{
                padding:
                  "12px 24px",
                borderRadius:
                  "10px",
                border: "none",
                background:
                  showNewClient
                    ? "#667eea"
                    : "white",
                color: showNewClient
                  ? "white"
                  : "#333",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition:
                  "all 0.2s",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => {
                if (!showNewClient) {
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(102, 126, 234, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!showNewClient) {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.08)";
                }
              }}
            >
              {showNewClient
                ? "▲ Ocultar"
                : "+ Nuevo cliente"}
            </button>

            {upcomingDevices.length >
              0 && (
              <button
                onClick={() =>
                  setShowUpcoming(
                    !showUpcoming
                  )
                }
                style={{
                  padding:
                    "12px 24px",
                  borderRadius:
                    "10px",
                  border: "none",
                  background: "#fef3c7",
                  color: "#92400e",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition:
                    "all 0.2s",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(217, 119, 6, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.08)";
                }}
              >
                ⚠️ {upcomingDevices.length}{" "}
                próximos
              </button>
            )}
          </div>

          {/* Formulario nuevo cliente EN MODAL */}
          <Modal
            isOpen={showNewClient}
            onClose={() => setShowNewClient(false)}
            title="Crear nuevo cliente"
          >
            <NewClient
              onCreated={() => {
                setShowNewClient(false);
                loadClients();
              }}
            />
          </Modal>

          {/* Panel próximos vencimientos */}
          {showUpcoming && (
            <div
              style={{
                background:
                  "white",
                borderRadius:
                  "12px",
                padding: "24px",
                marginBottom: "30px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
                border: "2px solid #fbbf24",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                ⚠️ Próximos
                vencimientos
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "12px",
                }}
              >
                {upcomingDevices.map(
                  (device) => {
                    const client =
                      clients.find(
                        (c) =>
                          c.id ===
                          device.client_id
                      );

                    const days =
                      daysRemaining(
                        device.end_date
                      );

                    return (
                      <div
                        key={
                          device.id
                        }
                        style={{
                          background:
                            "#f9fafb",
                          borderRadius:
                            "8px",
                          padding:
                            "12px",
                          borderLeft:
                            days <
                            7
                              ? "4px solid #ef4444"
                              : days <
                                15
                              ? "4px solid #f97316"
                              : "4px solid #eab308",
                          cursor:
                            "pointer",
                        }}
                        onClick={() => {
                          navigate(
                            `/client/${device.client_id}`
                          );
                        }}
                      >
                        <p
                          style={{
                            margin:
                              "0 0 4px 0",
                            fontWeight:
                              "600",
                            fontSize:
                              "14px",
                            color:
                              "#1f2937",
                          }}
                        >
                          {
                            client?.name
                          }
                        </p>

                        <p
                          style={{
                            margin:
                              "0 0 4px 0",
                            fontSize:
                              "13px",
                            color:
                              "#6b7280",
                          }}
                        >
                          {
                            device.alias
                          }
                        </p>

                        <p
                          style={{
                            margin:
                              "0 0 8px 0",
                            fontSize:
                              "12px",
                            color:
                              "#9ca3af",
                          }}
                        >
                          {formatDate(
                            device.end_date
                          )}
                        </p>

                        <p
                          style={{
                            margin:
                              "0",
                            fontSize:
                              "12px",
                            fontWeight:
                              "500",
                            color:
                              days <
                              7
                                ? "#dc2626"
                                : days <
                                  15
                                ? "#ea580c"
                                : "#ca8a04",
                          }}
                        >
                          {days ===
                          1
                            ? "1 día restante"
                            : `${days} días restantes`}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Título de clientes */}
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginBottom:
                "20px",
            }}
          >
            <h2
              style={{
                margin: "0",
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Clientes ({
                filteredClients.length
              })
            </h2>
          </div>

          {/* Grid de tarjetas */}
          {filteredClients.length ===
          0 ? (
            <div
              style={{
                textAlign:
                  "center",
                padding: "40px 20px",
                color: "#9ca3af",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                }}
              >
                {search
                  ? "No se encontraron clientes"
                  : "No hay clientes aún"}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredClients.map(
                (client) => {
                  const minDays =
                    getMinDaysRemaining(
                      client.id
                    );

                  const status =
                    getAlertStatus(
                      minDays
                    );

                  const cardStyles = {
                    normal: {
                      borderColor:
                        "#e5e7eb",
                    },
                    warning: {
                      borderColor:
                        "#fbbf24",
                    },
                    danger: {
                      borderColor:
                        "#f97316",
                    },
                    critical: {
                      borderColor:
                        "#ef4444",
                    },
                  };

                  const alertStyles = {
                    normal: {
                      display:
                        "none",
                    },
                    warning: {
                      color:
                        "#ca8a04",
                    },
                    danger: {
                      color:
                        "#ea580c",
                    },
                    critical: {
                      color:
                        "#dc2626",
                    },
                  };

                  return (
                    <div
                      key={client.id}
                      onClick={() =>
                        navigate(
                          `/client/${client.id}`
                        )
                      }
                      className={
                        status ===
                        "critical"
                          ? "pulse-subtle"
                          : ""
                      }
                      style={{
                        background:
                          "white",
                        borderRadius:
                          "12px",
                        padding:
                          "24px",
                        border:
                          "2px solid",
                        ...cardStyles[
                          status
                        ],
                        cursor:
                          "pointer",
                        boxShadow:
                          "0 2px 8px rgba(0,0,0,0.08)",
                        transition:
                          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseEnter={(
                        e
                      ) => {
                        e.currentTarget.style.transform =
                          "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 24px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(
                        e
                      ) => {
                        e.currentTarget.style.transform =
                          "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.08)";
                      }}
                    >
                      {/* Cabecera tarjeta */}
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          marginBottom:
                            "12px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin:
                                "0",
                              fontSize:
                                "18px",
                              fontWeight:
                                "700",
                              color:
                                "#1f2937",
                            }}
                          >
                            {
                              client.name
                            }
                          </h3>
                        </div>

                        {minDays <
                          30 && (
                          <span
                            style={{
                              fontSize:
                                "12px",
                              fontWeight:
                                "600",
                              padding:
                                "4px 8px",
                              borderRadius:
                                "6px",
                              background:
                                status ===
                                "warning"
                                  ? "#fef3c7"
                                  : status ===
                                    "danger"
                                  ? "#fed7aa"
                                  : "#fecaca",
                              color:
                                status ===
                                "warning"
                                  ? "#ca8a04"
                                  : status ===
                                  "danger"
                                  ? "#ea580c"
                                  : "#dc2626",
                              ...alertStyles[
                                status
                              ],
                            }}
                          >
                            {minDays ===
                            1
                              ? "Hoy"
                              : `${minDays}d`}
                          </span>
                        )}
                      </div>

                      {/* Información */}
                      <div
                        style={{
                          marginBottom:
                            "16px",
                        }}
                      >
                        {
                          client.whatsapp && (
                            <p
                              style={{
                                margin:
                                  "0 0 8px 0",
                                fontSize:
                                  "14px",
                                color:
                                  "#6b7280",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                              }}
                            >
                              <span>
                                📱
                              </span>
                              {
                                client.whatsapp
                              }
                            </p>
                          )
                        }

                        <p
                          style={{
                            margin:
                              "0 0 8px 0",
                            fontSize:
                              "14px",
                            color:
                              "#6b7280",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "6px",
                          }}
                        >
                          <span>
                            📺
                          </span>
                          {
                            client.devicesCount
                          }{" "}
                          dispositivo
                          {
                            client.devicesCount !==
                            1
                              ? "s"
                              : ""
                          }
                        </p>

                        {minDays <
                          30 && (
                          <p
                            style={{
                              margin:
                                "0",
                              fontSize:
                                "13px",
                              fontWeight:
                                "500",
                              ...alertStyles[
                                status
                              ],
                            }}
                          >
                            ⏰ Caduca en{" "}
                            {minDays ===
                            1
                              ? "1 día"
                              : `${minDays} días`}
                          </p>
                        )}
                      </div>

                      {/* Botón eliminar */}
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
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px",
                          borderRadius:
                            "8px",
                          border: "1px solid #e5e7eb",
                          background:
                            "white",
                          color:
                            "#dc2626",
                          cursor:
                            "pointer",
                          fontSize:
                            "13px",
                          fontWeight:
                            "500",
                          transition:
                            "all 0.2s",
                        }}
                        onMouseEnter={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "#fee2e2";
                          e.currentTarget.style.borderColor =
                            "#fca5a5";
                        }}
                        onMouseLeave={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "white";
                          e.currentTarget.style.borderColor =
                            "#e5e7eb";
                        }}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
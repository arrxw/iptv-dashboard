import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { supabase } from "../services/supabase";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatDate, daysRemaining } from "../utils/dateUtils";

import type { Client } from "../types/client";
import type { Device } from "../types/device";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [, setClient] = useState<Client | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);

  // Confirmación de renovación
  const [renewalConfirm, setRenewalConfirm] = useState<{
    device: Device;
    months: number;
    step: 'first' | 'second';
  } | null>(null);

  // Form states
  const [alias, setAlias] = useState("");
  const [mac, setMac] = useState("");
  const [app, setApp] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  async function loadData() {
    if (!id) return;

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (clientError) {
      console.error(clientError);
      return;
    }

    const { data: devicesData, error: devicesError } = await supabase
      .from("devices")
      .select("*")
      .eq("client_id", id)
      .order("created_at");

    if (devicesError) {
      console.error(devicesError);
      return;
    }

    setClient(clientData);
    setClientName(clientData.name || "");
    setClientWhatsapp(clientData.whatsapp || "");
    setClientNotes(clientData.notes || "");
    setDevices(devicesData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function copyMac(mac: string) {
    await navigator.clipboard.writeText(mac);
    alert("MAC copiada");
  }

  async function addDevice() {
    if (!id) return;

    if (!alias || !mac || !startDate || !endDate) {
      alert("Completa los campos obligatorios");
      return;
    }

    const { error } = await supabase.from("devices").insert({
      client_id: id,
      alias,
      mac_address: mac,
      app_name: app,
      start_date: startDate,
      end_date: endDate,
      notes,
      active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setAlias("");
    setMac("");
    setApp("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setShowAddDevice(false);

    await loadData();
    alert("Dispositivo añadido");
  }

  async function renewDevice(device: Device, months: number) {
    // Mostrar primer diálogo de confirmación
    setRenewalConfirm({
      device,
      months,
      step: 'first',
    });
  }

  async function confirmRenewal() {
    if (!renewalConfirm) return;

    const { device, months, step } = renewalConfirm;

    if (step === 'first') {
      // Mostrar segundo diálogo
      setRenewalConfirm({
        device,
        months,
        step: 'second',
      });
    } else {
      // Ejecutar renovación
      const current = new Date(device.end_date);
      current.setMonth(current.getMonth() + months);
      const newDate = current.toISOString().split("T")[0];

      const { error } = await supabase
        .from("devices")
        .update({
          end_date: newDate,
          active: true,
        })
        .eq("id", device.id);

      if (error) {
        alert(error.message);
        setRenewalConfirm(null);
        return;
      }

      setRenewalConfirm(null);
      await loadData();
      alert("Dispositivo renovado correctamente");
    }
  }

  async function deleteDevice(deviceId: string) {
    const confirmDelete = window.prompt("Escribe ELIMINAR");

    if (confirmDelete !== "ELIMINAR") {
      return;
    }

    const { error } = await supabase.from("devices").delete().eq("id", deviceId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  async function saveClient() {
    if (!id) return;

    const { error } = await supabase
      .from("clients")
      .update({
        name: clientName,
        whatsapp: clientWhatsapp,
        notes: clientNotes,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
    alert("Cliente actualizado");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#9ca3af" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        paddingBottom: "40px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "30px 20px",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              marginBottom: "20px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            ← Volver al Dashboard
          </button>

          <h1
            style={{
              margin: "0",
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "-1px",
            }}
          >
            {clientName || "Cliente"}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        {/* Two Column Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "24px",
            marginBottom: "30px",
          }}
        >
          {/* Card: Datos Cliente */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              📋 Datos del Cliente
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                Nombre
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                WhatsApp
              </label>
              <input
                value={clientWhatsapp}
                onChange={(e) => setClientWhatsapp(e.target.value)}
                placeholder="+34 666 123 456"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                URL del Servidor
              </label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Url del servidor o notas adicionales..."
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  resize: "vertical",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={saveClient}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: "#667eea",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#5568d3";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#667eea";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ✓ Guardar Cliente
            </button>
          </div>

          {/* Card: Dispositivos */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                📱 Dispositivos ({devices.length})
              </h2>

              <button
                onClick={() => setShowAddDevice(!showAddDevice)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#667eea",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#5568d3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#667eea";
                }}
              >
                {showAddDevice ? "✕ Cancelar" : "+ Añadir"}
              </button>
            </div>

            {devices.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0" }}>
                Sin dispositivos
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {devices.map((device) => (
                  <div
                    key={device.id}
                    style={{
                      background: "#f9fafb",
                      padding: "12px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #667eea",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontWeight: "600",
                        fontSize: "14px",
                        color: "#1f2937",
                      }}
                    >
                      {device.alias}
                    </p>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      MAC:{" "}
                      <code
                        style={{
                          background: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {device.mac_address}
                      </code>
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => copyMac(device.mac_address)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "4px",
                          border: "1px solid #e5e7eb",
                          background: "white",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                        }}
                      >
                        📋 Copiar
                      </button>
                      <button
                        onClick={async () => {
                          const newAlias = prompt("Alias", device.alias || "");
                          if (newAlias === null) return;

                          const newMac = prompt("MAC", device.mac_address);
                          if (newMac === null) return;

                          const newApp = prompt("App IPTV", device.app_name || "");
                          if (newApp === null) return;

                          const { error } = await supabase
                            .from("devices")
                            .update({
                              alias: newAlias,
                              mac_address: newMac,
                              app_name: newApp,
                            })
                            .eq("id", device.id);

                          if (error) {
                            alert(error.message);
                            return;
                          }

                          await loadData();
                          alert("Dispositivo actualizado");
                        }}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "4px",
                          border: "1px solid #e5e7eb",
                          background: "white",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deleteDevice(device.id)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "4px",
                          border: "1px solid #ef4444",
                          background: "white",
                          color: "#ef4444",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fee2e2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                        }}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de Renovaciones */}
        {devices.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              ⏳ Renovaciones
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {devices.map((device) => (
                <div
                  key={device.id}
                  style={{
                    background: "#f9fafb",
                    padding: "16px",
                    borderRadius: "8px",
                    borderTop: "2px solid #667eea",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#1f2937",
                    }}
                  >
                    {device.alias}
                  </p>

                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    Vence:{" "}
                    <strong>
                      {formatDate(device.end_date)} ({daysRemaining(device.end_date)}{" "}
                      días)
                    </strong>
                  </p>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => renewDevice(device, 1)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#667eea";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.color = "#1f2937";
                      }}
                    >
                      +1 mes
                    </button>

                    <button
                      onClick={() => renewDevice(device, 3)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#667eea";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.color = "#1f2937";
                      }}
                    >
                      +3 meses
                    </button>

                    <button
                      onClick={() => renewDevice(device, 6)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#667eea";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.color = "#1f2937";
                      }}
                    >
                      +6 meses
                    </button>

                    <button
                      onClick={() => renewDevice(device, 12)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#667eea";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.color = "#1f2937";
                      }}
                    >
                      +12 meses
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Añadir Dispositivo */}
      <Modal
        isOpen={showAddDevice}
        onClose={() => setShowAddDevice(false)}
        title="Añadir nuevo dispositivo"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addDevice();
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              Alias *
            </label>
            <input
              placeholder="Nombre del dispositivo"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              MAC *
            </label>
            <input
              placeholder="Dirección MAC"
              value={mac}
              onChange={(e) => setMac(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              App IPTV
            </label>
            <input
              placeholder="Nombre de la aplicación"
              value={app}
              onChange={(e) => setApp(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              Inicio *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              Fin *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              Notas
            </label>
            <textarea
              placeholder="Notas del dispositivo"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#667eea",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#5568d3";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            + Añadir Dispositivo
          </button>
        </form>
      </Modal>

      {/* Confirmación Renovación - Primer Paso */}
      <ConfirmDialog
        isOpen={renewalConfirm?.step === 'first'}
        title="Confirmar renovación"
        message={`¿Seguro que quieres renovar este dispositivo por ${renewalConfirm?.months || 1} ${renewalConfirm?.months === 1 ? 'mes' : 'meses'}?`}
        onConfirm={() => confirmRenewal()}
        onCancel={() => setRenewalConfirm(null)}
      />

      {/* Confirmación Renovación - Segundo Paso */}
      <ConfirmDialog
        isOpen={renewalConfirm?.step === 'second'}
        title="Confirmar renovación (2/2)"
        message="Esta acción modificará la fecha de vencimiento del dispositivo. ¿Deseas continuar?"
        onConfirm={() => confirmRenewal()}
        onCancel={() => setRenewalConfirm(null)}
      />
    </div>
  );
}

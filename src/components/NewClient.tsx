import { useState } from "react";
import { supabase } from "../services/supabase";
import { useToast } from "../hooks/useToast";
import ToastContainer from "./ToastContainer";

interface Props {
  onCreated: () => void;
}

export default function NewClient({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  // Datos cliente
  const [name, setName]               = useState("");
  const [whatsapp, setWhatsapp]       = useState("");
  const [clientNotes, setClientNotes] = useState("");

  // Datos dispositivo
  const [alias, setAlias]           = useState("");
  const [mac, setMac]               = useState("");
  const [app, setApp]               = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [deviceNotes, setDeviceNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const { toasts, success, error } = useToast();

  function resetForm() {
    setName(""); setWhatsapp(""); setClientNotes("");
    setAlias(""); setMac(""); setApp("");
    setStartDate(""); setEndDate(""); setDeviceNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !alias || !mac || !startDate || !endDate) {
      error("Completa todos los campos obligatorios (*)");
      return;
    }

    setLoading(true);

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({ name, whatsapp, notes: clientNotes })
      .select()
      .single();

    if (clientError) {
      error(clientError.message);
      setLoading(false);
      return;
    }

    const { error: deviceError } = await supabase
      .from("devices")
      .insert({
        client_id: client.id,
        alias,
        mac_address: mac,
        app_name: app,
        start_date: startDate,
        end_date: endDate,
        notes: deviceNotes,
        active: true,
      });

    if (deviceError) {
      error(deviceError.message);
      setLoading(false);
      return;
    }

    resetForm();
    setOpen(false);
    onCreated();
    success("Cliente creado correctamente");
    setLoading(false);
  }

  if (!open) {
    return (
      <div style={{ marginBottom: 20 }}>
        <button
          className="btn btn-primary"
          onClick={() => setOpen(true)}
          style={{ gap: 8 }}
        >
          <span style={{ fontSize: "1.1em", lineHeight: 1 }}>+</span>
          Nuevo cliente
        </button>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return (
    <>
      {/* Overlay modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        overflowY: "auto",
      }}
        onClick={() => setOpen(false)}
      >
        <div
          className="card"
          style={{ width: "100%", maxWidth: 560 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2>Nuevo cliente</h2>
            <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)} aria-label="Cerrar">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Sección: Datos del cliente */}
            <p style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 12,
            }}>
              Datos del cliente
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div className="field-group">
                <label htmlFor="nc-name">Nombre *</label>
                <input
                  id="nc-name"
                  autoFocus
                  placeholder="Ej: Juan García"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label htmlFor="nc-wp">WhatsApp</label>
                <input
                  id="nc-wp"
                  placeholder="+34 600 000 000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label htmlFor="nc-notes">Notas del cliente</label>
                <textarea
                  id="nc-notes"
                  placeholder="Observaciones, plan contratado..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  style={{ minHeight: 72 }}
                />
              </div>
            </div>

            <hr className="divider" style={{ marginBottom: 20 }} />

            {/* Sección: Primer dispositivo */}
            <p style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 12,
            }}>
              Primer dispositivo
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field-group">
                  <label htmlFor="nc-alias">Alias *</label>
                  <input
                    id="nc-alias"
                    placeholder="Ej: TV Salón"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="nc-app">App IPTV</label>
                  <input
                    id="nc-app"
                    placeholder="Ej: Tivimate"
                    value={app}
                    onChange={(e) => setApp(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="nc-mac">Dirección MAC *</label>
                <input
                  id="nc-mac"
                  placeholder="00:1A:79:XX:XX:XX"
                  value={mac}
                  onChange={(e) => setMac(e.target.value)}
                  className="mono"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field-group">
                  <label htmlFor="nc-start">Fecha inicio *</label>
                  <input
                    id="nc-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="nc-end">Fecha fin *</label>
                  <input
                    id="nc-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="nc-dnotes">Notas del dispositivo</label>
                <textarea
                  id="nc-dnotes"
                  placeholder="Número de serie, ubicación..."
                  value={deviceNotes}
                  onChange={(e) => setDeviceNotes(e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 14, height: 14 }} />Guardando...</>
                ) : "Guardar cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}

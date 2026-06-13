import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import type { Client } from "../types/client";
import type { Device } from "../types/device";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";

// ─── Helpers ───────────────────────────────────────────────────────

function daysRemaining(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function DeviceStatusBadge({ endDate, active }: { endDate: string; active: boolean }) {
  if (!active) return <span className="badge badge-inactive">Inactivo</span>;
  const d = daysRemaining(endDate);
  if (d < 0)   return <span className="badge badge-inactive">Expirado</span>;
  if (d <= 7)  return <span className="badge badge-warning">Vence en {d}d</span>;
  return <span className="badge badge-active">Activo · {d}d</span>;
}

// ─── Componente: tarjeta de dispositivo ────────────────────────────

interface DeviceCardProps {
  device: Device;
  onRenew: (device: Device, months: number) => void;
  onDelete: (device: Device) => void;
  onEdit: (device: Device) => void;
}

function DeviceCard({ device, onRenew, onDelete, onEdit }: DeviceCardProps) {
  const [copiedMac, setCopiedMac] = useState(false);

  async function copyMac() {
    await navigator.clipboard.writeText(device.mac_address);
    setCopiedMac(true);
    setTimeout(() => setCopiedMac(false), 2000);
  }

  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      {/* Header del dispositivo */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 14,
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "0.9375rem" }}>{device.alias || "Dispositivo"}</h3>
            <DeviceStatusBadge endDate={device.end_date} active={device.active} />
          </div>
          {device.app_name && (
            <p style={{ fontSize: "0.8rem", marginTop: 3, color: "var(--text-muted)" }}>
              {device.app_name}
            </p>
          )}
        </div>

        {/* Botón editar */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(device)}
          title="Editar dispositivo"
        >
          ✏️ Editar
        </button>
      </div>

      {/* MAC address */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg-base)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        marginBottom: 14,
      }}>
        <code className="mono" style={{
          flex: 1, fontSize: "0.875rem",
          color: "var(--text-secondary)",
          letterSpacing: "0.05em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {device.mac_address}
        </code>
        <button
          className="btn btn-ghost btn-sm"
          onClick={copyMac}
          style={{ flexShrink: 0 }}
        >
          {copiedMac ? "✓ Copiada" : "Copiar"}
        </button>
      </div>

      {/* Fechas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 14,
        fontSize: "0.8125rem",
        color: "var(--text-muted)",
      }}>
        <div>
          <div style={{ color: "var(--text-secondary)", marginBottom: 2 }}>Inicio</div>
          {formatDate(device.start_date)}
        </div>
        <div>
          <div style={{ color: "var(--text-secondary)", marginBottom: 2 }}>Fin</div>
          {formatDate(device.end_date)}
        </div>
      </div>

      {/* Notas */}
      {device.notes && (
        <p style={{
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          marginBottom: 14,
          padding: "8px 12px",
          background: "var(--bg-base)",
          borderRadius: "var(--radius-sm)",
        }}>
          {device.notes}
        </p>
      )}

      {/* Botones renovar + eliminar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: 4 }}>Renovar:</span>
        {[1, 3, 6, 12].map((m) => (
          <button
            key={m}
            className="btn btn-secondary btn-sm"
            onClick={() => onRenew(device, m)}
          >
            +{m}m
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(device)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: editar dispositivo ─────────────────────────────────────

interface EditDeviceModalProps {
  device: Device;
  onClose: () => void;
  onSaved: () => void;
}

function EditDeviceModal({ device, onClose, onSaved }: EditDeviceModalProps) {
  const [alias, setAlias]   = useState(device.alias || "");
  const [mac, setMac]       = useState(device.mac_address);
  const [app, setApp]       = useState(device.app_name || "");
  const [notes, setNotes]   = useState(device.notes || "");
  const [loading, setLoading] = useState(false);
  const { toasts, success, error } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error: err } = await supabase
      .from("devices")
      .update({ alias, mac_address: mac, app_name: app, notes })
      .eq("id", device.id);

    if (err) { error(err.message); setLoading(false); return; }
    success("Dispositivo actualizado");
    setTimeout(() => { onSaved(); onClose(); }, 500);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2>Editar dispositivo</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field-group">
            <label>Alias</label>
            <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Ej: TV Salón" />
          </div>
          <div className="field-group">
            <label>MAC *</label>
            <input value={mac} onChange={(e) => setMac(e.target.value)} className="mono" required />
          </div>
          <div className="field-group">
            <label>App IPTV</label>
            <input value={app} onChange={(e) => setApp(e.target.value)} placeholder="Ej: Tivimate" />
          </div>
          <div className="field-group">
            <label>Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 60 }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Guardando...</> : "Guardar"}
            </button>
          </div>
        </form>
        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );
}

// ─── Modal: añadir dispositivo ─────────────────────────────────────

interface AddDeviceFormProps {
  clientId: string;
  onAdded: () => void;
}

function AddDeviceForm({ clientId, onAdded }: AddDeviceFormProps) {
  const [open, setOpen]         = useState(false);
  const [alias, setAlias]       = useState("");
  const [mac, setMac]           = useState("");
  const [app, setApp]           = useState("");
  const [startDate, setStart]   = useState("");
  const [endDate, setEnd]       = useState("");
  const [notes, setNotes]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { toasts, success, error } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!alias || !mac || !startDate || !endDate) {
      error("Completa los campos obligatorios (*)");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.from("devices").insert({
      client_id: clientId,
      alias, mac_address: mac, app_name: app,
      start_date: startDate, end_date: endDate,
      notes, active: true,
    });
    if (err) { error(err.message); setLoading(false); return; }
    setAlias(""); setMac(""); setApp(""); setStart(""); setEnd(""); setNotes("");
    setOpen(false);
    onAdded();
    success("Dispositivo añadido");
    setLoading(false);
  }

  if (!open) return (
    <div style={{ marginBottom: 4 }}>
      <button className="btn btn-secondary" onClick={() => setOpen(true)}>
        + Añadir dispositivo
      </button>
      <ToastContainer toasts={toasts} />
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={() => setOpen(false)}>
      <div className="card" style={{ width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2>Añadir dispositivo</h2>
          <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field-group">
              <label>Alias *</label>
              <input autoFocus value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Ej: TV Salón" />
            </div>
            <div className="field-group">
              <label>App IPTV</label>
              <input value={app} onChange={(e) => setApp(e.target.value)} placeholder="Ej: Tivimate" />
            </div>
          </div>
          <div className="field-group">
            <label>MAC *</label>
            <input value={mac} onChange={(e) => setMac(e.target.value)} className="mono" placeholder="00:1A:79:XX:XX:XX" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field-group">
              <label>Inicio *</label>
              <input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Fin *</label>
              <input type="date" value={endDate} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label>Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 60 }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Guardando...</> : "Añadir"}
            </button>
          </div>
        </form>
        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );
}

// ─── Página principal: ClientDetail ────────────────────────────────

export default function ClientDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [client, setClient]           = useState<Client | null>(null);
  const [devices, setDevices]         = useState<Device[]>([]);
  const [loading, setLoading]         = useState(true);
  const [savingClient, setSavingClient] = useState(false);

  // Edición cliente
  const [clientName, setClientName]       = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [clientNotes, setClientNotes]     = useState("");

  // Modal editar dispositivo
  const [editDevice, setEditDevice] = useState<Device | null>(null);

  const { toasts, success, error: showError } = useToast();
  const { confirm, ConfirmModal } = useConfirm();

  async function loadData() {
    if (!id) return;
    setLoading(true);

    const { data: cData, error: cErr } = await supabase
      .from("clients").select("*").eq("id", id).single();

    if (cErr) { showError(cErr.message); setLoading(false); return; }

    const { data: dData, error: dErr } = await supabase
      .from("devices").select("*").eq("client_id", id).order("created_at");

    if (dErr) { showError(dErr.message); setLoading(false); return; }

    setClient(cData);
    setClientName(cData.name || "");
    setClientWhatsapp(cData.whatsapp || "");
    setClientNotes(cData.notes || "");
    setDevices(dData || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [id]);

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSavingClient(true);
    const { error: err } = await supabase
      .from("clients")
      .update({ name: clientName, whatsapp: clientWhatsapp, notes: clientNotes })
      .eq("id", id);

    if (err) { showError(err.message); } else { success("Cliente actualizado"); }
    setSavingClient(false);
  }

  async function renewDevice(device: Device, months: number) {
    const d = new Date(device.end_date);
    d.setMonth(d.getMonth() + months);
    const newDate = d.toISOString().split("T")[0];

    const { error: err } = await supabase
      .from("devices").update({ end_date: newDate, active: true }).eq("id", device.id);

    if (err) { showError(err.message); return; }
    await loadData();
    success(`Renovado +${months} mes${months > 1 ? "es" : ""}`);
  }

  async function deleteDevice(device: Device) {
    const ok = await confirm({
      title: "Eliminar dispositivo",
      description: `Se eliminará "${device.alias || device.mac_address}". No se puede deshacer.`,
      requireTyping: "ELIMINAR",
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    const { error: err } = await supabase.from("devices").delete().eq("id", device.id);
    if (err) { showError(err.message); return; }
    await loadData();
    success("Dispositivo eliminado");
  }

  // ─── Loading ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-base)",
      }}>
        <span className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ padding: 24, background: "var(--bg-base)", minHeight: "100dvh" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>← Volver</button>
        <p style={{ marginTop: 16 }}>Cliente no encontrado.</p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Topbar */}
      <header style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          ← Volver
        </button>
        <span style={{ color: "var(--border-light)" }}>|</span>
        <h1 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          {client.name}
        </h1>
      </header>

      <main style={{ maxWidth: 900, width: "100%", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>

          {/* ── Panel izquierdo: datos cliente ─────────────────── */}
          <section>
            <h2 style={{ marginBottom: 14, fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Datos del cliente
            </h2>
            <div className="card">
              <form onSubmit={saveClient} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field-group">
                  <label htmlFor="cd-name">Nombre</label>
                  <input id="cd-name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="field-group">
                  <label htmlFor="cd-wp">WhatsApp</label>
                  <input id="cd-wp" value={clientWhatsapp} onChange={(e) => setClientWhatsapp(e.target.value)} placeholder="Sin WhatsApp" />
                </div>
                <div className="field-group">
                  <label htmlFor="cd-notes">Notas</label>
                  <textarea id="cd-notes" value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} style={{ minHeight: 72 }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingClient}>
                  {savingClient ? <><span className="spinner" style={{ width: 14, height: 14 }} />Guardando...</> : "Guardar cambios"}
                </button>
              </form>
            </div>
          </section>

          {/* ── Panel derecho: resumen dispositivos ─────────────── */}
          <section>
            <h2 style={{ marginBottom: 14, fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Resumen
            </h2>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Dispositivos</span>
                <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--accent)" }}>{devices.length}</span>
              </div>
              <hr className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Activos</span>
                <span style={{ fontWeight: 600, color: "var(--success)" }}>
                  {devices.filter((d) => d.active && daysRemaining(d.end_date) >= 0).length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Por vencer (≤7d)</span>
                <span style={{ fontWeight: 600, color: "var(--warning)" }}>
                  {devices.filter((d) => { const r = daysRemaining(d.end_date); return r >= 0 && r <= 7; }).length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Expirados</span>
                <span style={{ fontWeight: 600, color: "var(--danger)" }}>
                  {devices.filter((d) => daysRemaining(d.end_date) < 0).length}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Dispositivos ─────────────────────────────────────── */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}>
            <h2 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Dispositivos
            </h2>
            <AddDeviceForm clientId={id!} onAdded={loadData} />
          </div>

          {devices.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--text-muted)" }}>No hay dispositivos. Añade el primero.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onRenew={renewDevice}
                  onDelete={deleteDevice}
                  onEdit={(d) => setEditDevice(d)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modales */}
      {editDevice && (
        <EditDeviceModal
          device={editDevice}
          onClose={() => setEditDevice(null)}
          onSaved={loadData}
        />
      )}
      {ConfirmModal}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

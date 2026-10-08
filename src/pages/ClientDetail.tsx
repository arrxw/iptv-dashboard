import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Save,
  KeyRound,
  Calendar,
} from "lucide-react";

import { supabase } from "../services/supabase";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatDate, daysRemaining } from "../utils/dateUtils";

import type { Client } from "../types/client";
import type { Device } from "../types/device";
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";
import LoadingScreen from "../components/LoadingScreen";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [, setClient] = useState<Client | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editAlias, setEditAlias] = useState("");
  const [editMac, setEditMac] = useState("");
  const [editApp, setEditApp] = useState("");
  const [editPin, setEditPin] = useState("");
  const [savingDevice, setSavingDevice] = useState(false);
  const [copiedMacId, setCopiedMacId] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [renewalConfirm, setRenewalConfirm] = useState<{
    device: Device;
    months: number;
    step: "first" | "second";
  } | null>(null);

  const [alias, setAlias] = useState("");
  const [mac, setMac] = useState("");
  const [app, setApp] = useState("");
  const [pin, setPin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("12");
  const [notes, setNotes] = useState("");
  const [appsList, setAppsList] = useState<{ id: string; name: string }[]>([]);

  const [clientName, setClientName] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [savingClient, setSavingClient] = useState(false);

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

  async function loadApps() {
    const { data } = await supabase.from("apps").select("*").order("name");
    setAppsList(data || []);
  }

  useEffect(() => {
    loadData();
    loadApps();
  }, [id]);

  async function copyMac(macAddress: string, devId?: string) {
    try {
      await navigator.clipboard.writeText(macAddress);
      if (devId) {
        setCopiedMacId(devId);
        setTimeout(() => setCopiedMacId(null), 2000);
      } else {
        alert("MAC copiada");
      }
    } catch {
      alert("MAC copiada: " + macAddress);
    }
  }

  async function copyPin(pinValue: string | null | undefined, devId?: string) {
    if (!pinValue) return;
    try {
      await navigator.clipboard.writeText(pinValue);
      if (devId) {
        setCopiedPinId(devId);
        setTimeout(() => setCopiedPinId(null), 2000);
      } else {
        alert("PIN copiado");
      }
    } catch {
      alert("PIN copiado: " + pinValue);
    }
  }

  function openDeviceEditor(device: Device) {
    setEditingDevice(device);
    setEditAlias(device.alias || "");
    setEditMac(device.mac_address);
    setEditApp(device.app_name || "");
    setEditPin(device.pin || "");
  }

  async function saveDevice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingDevice) return;

    const normalizedAlias = editAlias.trim();
    const normalizedMac = editMac.trim();
    const normalizedApp = editApp.trim();
    const normalizedPin = editPin.trim();

    if (!normalizedAlias || !normalizedMac) {
      alert("El alias y la MAC son obligatorios.");
      return;
    }

    if (
      normalizedApp.toLowerCase() === "ibo player" &&
      normalizedPin &&
      !/^[A-Za-z0-9]{4,12}$/.test(normalizedPin)
    ) {
      alert("PIN inválido. Debe tener entre 4 y 12 caracteres alfanuméricos.");
      return;
    }

    const updatePayload: Partial<Pick<Device, "alias" | "mac_address" | "app_name" | "pin">> = {
      alias: normalizedAlias,
      mac_address: normalizedMac,
      app_name: normalizedApp || null,
    };

    if (normalizedApp.toLowerCase() === "ibo player") {
      if (normalizedPin) updatePayload.pin = normalizedPin;
    } else if (editingDevice.pin) {
      updatePayload.pin = null;
    }

    setSavingDevice(true);
    const { error } = await supabase
      .from("devices")
      .update(updatePayload)
      .eq("id", editingDevice.id);
    setSavingDevice(false);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingDevice(null);
    await loadData();
    alert("Dispositivo actualizado");
  }

  async function addDevice() {
    if (!id) return;
    if (!alias || !mac || !startDate || !duration) {
      alert("Completa los campos obligatorios");
      return;
    }

    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setMonth(calculatedEndDate.getMonth() + parseInt(duration, 10));
    const endDate = calculatedEndDate.toISOString().split("T")[0];

    const devicePayload: any = {
      client_id: id,
      alias,
      mac_address: mac,
      app_name: app,
      start_date: startDate,
      end_date: endDate,
      notes,
      active: true,
    };

    const appNormalized = app.trim().toLowerCase();
    if (appNormalized === "ibo player") {
      const pinTrim = pin.trim();
      if (!/^[A-Za-z0-9]{4,12}$/.test(pinTrim)) {
        alert("PIN inválido. Debe tener entre 4 y 12 caracteres alfanuméricos.");
        return;
      }
      devicePayload.pin = pinTrim;
    }

    const { error } = await supabase.from("devices").insert(devicePayload);

    if (error) {
      alert(error.message);
      return;
    }

    setAlias("");
    setMac("");
    setApp("");
    setPin("");
    setStartDate("");
    setDuration("12");
    setNotes("");
    setShowAddDevice(false);

    await loadData();
    alert("Dispositivo añadido");
  }

  async function renewDevice(device: Device, months: number) {
    setRenewalConfirm({ device, months, step: "first" });
  }

  async function confirmRenewal() {
    if (!renewalConfirm) return;
    const { device, months, step } = renewalConfirm;

    if (step === "first") {
      setRenewalConfirm({ device, months, step: "second" });
      return;
    }

    const current = new Date();
    current.setMonth(current.getMonth() + months);
    const newDate = current.toISOString().split("T")[0];

    const { error } = await supabase
      .from("devices")
      .update({ end_date: newDate, active: true })
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

  async function deleteDevice(deviceId: string) {
    setDeviceToDelete(deviceId);
  }

  async function confirmDeleteDevice() {
    if (!deviceToDelete) return;
    const { error } = await supabase.from("devices").delete().eq("id", deviceToDelete);
    if (error) {
      alert(error.message);
      setDeviceToDelete(null);
      return;
    }
    setDeviceToDelete(null);
    await loadData();
    alert("Dispositivo eliminado");
  }

  async function saveClient() {
    if (!id) return;

    setSavingClient(true);
    const { error } = await supabase
      .from("clients")
      .update({
        name: clientName,
        whatsapp: clientWhatsapp,
        notes: clientNotes,
      })
      .eq("id", id);
    setSavingClient(false);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
    alert("Cliente actualizado");
  }

  if (loading) {
    return <LoadingScreen message="Cargando cliente..." />;
  }

  const cleanWhatsapp = clientWhatsapp.replace(/[^0-9]/g, "");

  return (
    <PageShell>
      <div className="client-detail-page">
        {/* Mobile-First Header with Back Navigation */}
        <PageHeader
          title={clientName || "Cliente"}
          subtitle="Gestión de información y dispositivos del cliente"
          variant="hero"
          backButton={
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => navigate("/")}
              aria-label="Volver al dashboard"
            >
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>
          }
          actions={
            <div className="dashboard-header-actions">
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--secondary button--sm"
                  title="Contactar por WhatsApp"
                >
                  <Phone size={15} className="text-success" />
                  <span>WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={() => setShowAddDevice(true)}
              >
                <Plus size={16} />
                <span>Añadir dispositivo</span>
              </button>
            </div>
          }
        />

        {/* Layout móvil con datos de cliente y dispositivos */}
        <div className="grid cols-2 gap-24">
          {/* Tarjeta de Datos del Cliente */}
          <section className="card">
            <div className="card__header">
              <h2>Datos del cliente</h2>
            </div>
            <div className="card__body">
              <div className="form-field">
                <label className="form-field__label">Nombre completo</label>
                <input
                  className="input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="form-field" style={{ marginTop: "16px" }}>
                <label className="form-field__label">WhatsApp / Teléfono</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon text-muted" />
                  <input
                    className="input input--has-icon"
                    value={clientWhatsapp}
                    onChange={(e) => setClientWhatsapp(e.target.value)}
                    placeholder="+34 666 123 456"
                    inputMode="tel"
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginTop: "16px" }}>
                <label className="form-field__label">Notas del cliente</label>
                <textarea
                  className="textarea"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Notas internas, pagos, preferencias..."
                  rows={3}
                />
              </div>
            </div>
            <div className="card__footer">
              <button
                type="button"
                className="button button--primary button--lg"
                style={{ width: "100%" }}
                disabled={savingClient}
                onClick={saveClient}
              >
                <Save size={16} />
                <span>{savingClient ? "Guardando..." : "Guardar cambios"}</span>
              </button>
            </div>
          </section>

          {/* Sección de Dispositivos */}
          <section className="client-devices-section">
            <div className="section-title">
              <h2>Dispositivos ({devices.length})</h2>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setShowAddDevice(true)}
              >
                <Plus size={15} />
                <span>Añadir</span>
              </button>
            </div>

            {devices.length === 0 ? (
              <div className="empty-state card" style={{ marginTop: "16px" }}>
                <div className="empty-state__icon">📺</div>
                <p>Este cliente aún no tiene dispositivos asociados.</p>
                <button
                  type="button"
                  className="button button--primary button--sm"
                  onClick={() => setShowAddDevice(true)}
                  style={{ marginTop: "12px" }}
                >
                  + Asociar primer dispositivo
                </button>
              </div>
            ) : (
              <div className="device-list" style={{ marginTop: "16px" }}>
                {devices.map((device) => {
                  const days = daysRemaining(device.end_date);
                  const isExpired = days <= 0;
                  const isUpcoming = days > 0 && days <= 30;

                  return (
                    <article
                      key={device.id}
                      className={`device-card card ${
                        isExpired
                          ? "device-card--danger client-card--expired"
                          : isUpcoming
                          ? "device-card--warning"
                          : ""
                      }`}
                    >
                      <div className="device-card__top">
                        <div className="device-card__title-box">
                          <h3 className="device-card__alias">{device.alias}</h3>
                          <span className="device-card__app-tag">
                            {device.app_name || "General"}
                          </span>
                        </div>
                        <span
                          className={`badge ${
                            isExpired
                              ? "badge--danger"
                              : isUpcoming
                              ? "badge--warning"
                              : "badge--success"
                          }`}
                        >
                          {isExpired
                            ? `CADUCADA (${Math.abs(days)}d)`
                            : days === 0
                            ? "CADUCA HOY"
                            : `${days} días`}
                        </span>
                      </div>

                      {/* Dirección MAC con botón copiar táctil */}
                      <div className="device-credential-row">
                        <span className="device-credential-label">MAC:</span>
                        <code className="device-credential-code">{device.mac_address}</code>
                        <button
                          type="button"
                          className="button button--secondary button--sm credential-copy-btn"
                          onClick={() => copyMac(device.mac_address, device.id)}
                          aria-label="Copiar MAC"
                        >
                          {copiedMacId === device.id ? (
                            <>
                              <Check size={14} className="text-success" />
                              <span>Copiada</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* PIN si existe */}
                      {device.pin && (
                        <div className="device-credential-row">
                          <span className="device-credential-label">
                            <KeyRound size={14} /> PIN:
                          </span>
                          <code className="device-credential-code">{device.pin}</code>
                          <button
                            type="button"
                            className="button button--secondary button--sm credential-copy-btn"
                            onClick={() => copyPin(device.pin, device.id)}
                            aria-label="Copiar PIN"
                          >
                            {copiedPinId === device.id ? (
                              <>
                                <Check size={14} className="text-success" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Fechas de inicio y fin */}
                      <div className="device-dates-row muted-text text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>Inicio: {formatDate(device.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>Fin: {formatDate(device.end_date)}</span>
                        </div>
                      </div>

                      {device.notes && (
                        <p className="device-notes-text muted-text text-sm">
                          📝 {device.notes}
                        </p>
                      )}

                      {/* Botones de acción del dispositivo */}
                      <div className="device-card__actions">
                        <div className="device-card__quick-renew">
                          <button
                            type="button"
                            className="button button--secondary button--sm"
                            onClick={() => renewDevice(device, 1)}
                            title="Renovar 1 mes"
                          >
                            +1m
                          </button>
                          <button
                            type="button"
                            className="button button--secondary button--sm"
                            onClick={() => renewDevice(device, 6)}
                            title="Renovar 6 meses"
                          >
                            +6m
                          </button>
                          <button
                            type="button"
                            className="button button--primary button--sm"
                            onClick={() => renewDevice(device, 12)}
                            title="Renovar 12 meses"
                          >
                            +12m
                          </button>
                        </div>

                        <div className="device-card__manage-btns">
                          <button
                            type="button"
                            className="button button--secondary button--sm"
                            onClick={() => openDeviceEditor(device)}
                            title="Editar dispositivo"
                          >
                            <Edit2 size={14} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className="button button--ghost button--sm"
                            onClick={() => deleteDevice(device.id)}
                            title="Eliminar dispositivo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Modal: Añadir nuevo dispositivo */}
        <Modal
          isOpen={showAddDevice}
          onClose={() => setShowAddDevice(false)}
          title="Añadir dispositivo"
        >
          <div className="modal-form">
            <div className="form-field">
              <label className="form-field__label">Alias del dispositivo *</label>
              <input
                className="input"
                placeholder="Ej. Smart TV Salón, Fire Stick..."
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Dirección MAC *</label>
              <input
                className="input"
                placeholder="00:1A:79:XX:XX:XX"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Aplicación</label>
              <select
                className="select"
                value={app}
                onChange={(e) => setApp(e.target.value)}
              >
                <option value="">Selecciona aplicación</option>
                {appsList.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {app.trim().toLowerCase() === "ibo player" && (
              <div className="form-field">
                <label className="form-field__label">PIN (Ibo Player) *</label>
                <input
                  className="input"
                  placeholder="PIN alfanumérico (4-12 caracteres)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label className="form-field__label">Fecha de inicio *</label>
                <input
                  className="input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">Duración</label>
                <select
                  className="select"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="1">1 mes</option>
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses (1 año)</option>
                  <option value="24">24 meses (2 años)</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Notas del dispositivo</label>
              <textarea
                className="textarea"
                placeholder="Detalles técnicos, conexión, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="modal-footer" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="button button--secondary button--lg"
                onClick={() => setShowAddDevice(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button--primary button--lg"
                onClick={addDevice}
              >
                Guardar dispositivo
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal: Editar dispositivo */}
        <Modal
          isOpen={!!editingDevice}
          onClose={() => setEditingDevice(null)}
          title="Editar dispositivo"
        >
          {editingDevice && (
            <form onSubmit={saveDevice} className="modal-form">
              <div className="form-field">
                <label className="form-field__label">Alias *</label>
                <input
                  className="input"
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">Dirección MAC *</label>
                <input
                  className="input"
                  value={editMac}
                  onChange={(e) => setEditMac(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">Aplicación</label>
                <select
                  className="select"
                  value={editApp}
                  onChange={(e) => setEditApp(e.target.value)}
                >
                  <option value="">Ninguna / Otra</option>
                  {appsList.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {editApp.trim().toLowerCase() === "ibo player" && (
                <div className="form-field">
                  <label className="form-field__label">PIN (Ibo Player)</label>
                  <input
                    className="input"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    placeholder="PIN alfanumérico (4-12 caracteres)"
                  />
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="button button--secondary button--lg"
                  onClick={() => setEditingDevice(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button button--primary button--lg"
                  disabled={savingDevice}
                >
                  {savingDevice ? "Guardando..." : "Actualizar dispositivo"}
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Diálogo de Confirmación: Eliminar Dispositivo */}
        <ConfirmDialog
          isOpen={!!deviceToDelete}
          title="⚠️ Eliminar dispositivo"
          message="¿Seguro que deseas eliminar este dispositivo? Esta acción no se puede deshacer."
          onConfirm={confirmDeleteDevice}
          onCancel={() => setDeviceToDelete(null)}
          danger
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
        />

        {/* Diálogo de Renovación en 2 pasos */}
        {renewalConfirm && (
          <ConfirmDialog
            isOpen={true}
            title={
              renewalConfirm.step === "first"
                ? "Renovar dispositivo"
                : "Confirmar renovación"
            }
            message={
              renewalConfirm.step === "first"
                ? `¿Deseas extender la suscripción de "${renewalConfirm.device.alias}" por ${renewalConfirm.months} meses adicionales?`
                : `Se actualizará la fecha de vencimiento a partir de hoy (+${renewalConfirm.months} meses). ¿Confirmas la operación?`
            }
            onConfirm={confirmRenewal}
            onCancel={() => setRenewalConfirm(null)}
            confirmLabel={
              renewalConfirm.step === "first" ? "Continuar" : "Sí, renovar ahora"
            }
            cancelLabel="Cancelar"
          />
        )}
      </div>
    </PageShell>
  );
}

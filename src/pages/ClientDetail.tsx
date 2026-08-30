import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

  async function copyMac(macAddress: string) {
    await navigator.clipboard.writeText(macAddress);
    alert("MAC copiada");
  }

  async function copyPin(pinValue: string | null | undefined) {
    if (!pinValue) return;
    await navigator.clipboard.writeText(pinValue);
    alert("PIN copiado");
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
      // Validación del PIN (4-12 caracteres alfanuméricos)
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
    const confirmDelete = window.prompt("Escribe ELIMINAR");
    if (confirmDelete !== "ELIMINAR") return;

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
    return <LoadingScreen message="Cargando cliente..." />;
  }

  return (
    <PageShell>
      <div className="client-detail-page">
        <PageHeader
          title={clientName || "Cliente"}
          subtitle="Gestión de información y dispositivos del cliente"
          actions={
            <button className="button button--secondary button--sm" onClick={() => navigate("/")}>Volver al dashboard</button>
          }
        />

        <div className="grid cols-2 gap-24">
          <section className="card">
            <div className="card__header">
              <h2>Datos del cliente</h2>
            </div>
            <div className="card__body">
              <div className="form-field">
                <label className="form-field__label">Nombre</label>
                <input
                  className="input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">WhatsApp</label>
                <input
                  className="input"
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  placeholder="+34 666 123 456"
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">URL del servidor</label>
                <textarea
                  className="textarea"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Url del servidor o notas adicionales..."
                />
              </div>
            </div>
            <div className="card__footer">
              <button className="button button--primary button--lg" type="button" onClick={saveClient}>
                Guardar cliente
              </button>
            </div>
          </section>

          <section className="card">
            <div className="card__header">
              <h2>Dispositivos ({devices.length})</h2>
              <button className="button button--primary button--sm" type="button" onClick={() => setShowAddDevice((value) => !value)}>
                {showAddDevice ? "Cancelar" : "+ Añadir dispositivo"}
              </button>
            </div>
            <div className="card__body">
              {devices.length === 0 ? (
                <p className="muted-text">Sin dispositivos</p>
              ) : (
                <div className="device-list">
                  {devices.map((device) => (
                    <article key={device.id} className="device-card">
                              <div className="device-card__main">
                        <h3>{device.alias}</h3>
                        <p className="muted-text">MAC: <span className="device-chip">{device.mac_address}</span></p>
                                {device.pin && (
                                  <p className="muted-text">PIN: <span className="device-chip">{device.pin}</span></p>
                                )}
                              </div>

                              <div className="device-card__meta">
                                <button className="button button--secondary button--sm" type="button" onClick={() => copyMac(device.mac_address)}>
                                  Copiar MAC
                                </button>
                                {device.pin && (
                                  <button className="button button--secondary button--sm" type="button" onClick={() => copyPin(device.pin)}>
                                    Copiar PIN
                                  </button>
                                )}
                                <button
                                  className="button button--secondary button--sm"
                                  type="button"
                                  onClick={async () => {
                                    const newAlias = prompt("Alias", device.alias || "");
                                    if (newAlias === null) return;

                                    const newMac = prompt("MAC", device.mac_address);
                                    if (newMac === null) return;

                                    const newApp = prompt("App IPTV", device.app_name || "");
                                    if (newApp === null) return;

                                    let updatePayload: any = {
                                      alias: newAlias,
                                      mac_address: newMac,
                                      app_name: newApp,
                                    };

                                    // If the app is Ibo Player (case-insensitive), ask for PIN (allow empty to leave unchanged)
                                    if (newApp.trim().toLowerCase() === "ibo player") {
                                      const newPin = prompt("PIN (dejar vacío para no cambiar)", device.pin || "");
                                      if (newPin !== null) {
                                        const newPinTrim = newPin.trim();
                                        if (newPinTrim !== "" && !/^[A-Za-z0-9]{4,12}$/.test(newPinTrim)) {
                                          alert("PIN inválido. Debe tener entre 4 y 12 caracteres alfanuméricos.");
                                          return;
                                        }
                                        // If empty string, leave unchanged; otherwise set value (allow empty to clear explicitly)
                                        if (newPinTrim !== "") {
                                          updatePayload.pin = newPinTrim;
                                        }
                                      }
                                    } else if (device.pin) {
                                      // If switching away from Ibo Player, remove pin
                                      updatePayload.pin = null;
                                    }

                                    const { error } = await supabase
                                      .from("devices")
                                      .update(updatePayload)
                                      .eq("id", device.id);

                                    if (error) {
                                      alert(error.message);
                                      return;
                                    }

                                    await loadData();
                                    alert("Dispositivo actualizado");
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  className="button button--danger button--sm"
                                  type="button"
                                  onClick={() => deleteDevice(device.id)}
                                >
                                  Eliminar
                                </button>
                              </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {devices.length > 0 && (
          <section className="card">
            <div className="card__header">
              <h2>Renovaciones</h2>
            </div>
            <div className="card__body">
              <div className="card-grid card-grid--columns-2">
                {devices.map((device) => (
                  <article key={device.id} className="renewal-card">
                    <div>
                      <h3>{device.alias}</h3>
                      <p className="muted-text">
                        Vence: <strong>{formatDate(device.end_date)}</strong> ({daysRemaining(device.end_date)} días)
                      </p>
                    </div>

                    <div className="renewal-actions">
                      {[1, 3, 6, 12].map((months) => (
                        <button
                          key={months}
                          className="button button--secondary button--sm"
                          type="button"
                          onClick={() => renewDevice(device, months)}
                        >
                          +{months} mes{months > 1 ? "es" : ""}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <Modal isOpen={showAddDevice} onClose={() => setShowAddDevice(false)} title="Añadir nuevo dispositivo">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addDevice();
            }}
            className="modal-form"
          >
            <div className="form-grid">
              <div className="form-field">
                <label className="form-field__label">Alias *</label>
                <input className="input" placeholder="Nombre del dispositivo" value={alias} onChange={(e) => setAlias(e.target.value)} />
              </div>

              <div className="form-field">
                <label className="form-field__label">MAC *</label>
                <input className="input" placeholder="Dirección MAC" value={mac} onChange={(e) => setMac(e.target.value)} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-field__label">App IPTV</label>
                <select className="select" value={app} onChange={(e) => setApp(e.target.value)}>
                  <option value="">Seleccionar aplicación</option>
                  {appsList.map((appItem) => (
                    <option key={appItem.id} value={appItem.name}>
                      {appItem.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN sólo visible para Ibo Player (case-insensitive) */}
              {app.trim().toLowerCase() === "ibo player" && (
                <div className="form-field">
                  <label className="form-field__label">PIN</label>
                  <input className="input" placeholder="PIN para Ibo Player" value={pin} onChange={(e) => setPin(e.target.value)} />
                </div>
              )}

              <div className="form-field">
                <label className="form-field__label">Inicio *</label>
                <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-field__label">Duración *</label>
                <select className="select" value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="9">9 meses</option>
                  <option value="12">12 meses</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-field__label">Notas</label>
                <textarea className="textarea" placeholder="Notas del dispositivo" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="button button--primary button--lg">
              Añadir dispositivo
            </button>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={renewalConfirm?.step === "first"}
          title="Confirmar renovación"
          message={`¿Seguro que quieres renovar este dispositivo por ${renewalConfirm?.months || 1} ${renewalConfirm?.months === 1 ? "mes" : "meses"}?`}
          onConfirm={() => confirmRenewal()}
          onCancel={() => setRenewalConfirm(null)}
        />

        <ConfirmDialog
          isOpen={renewalConfirm?.step === "second"}
          title="Confirmar renovación (2/2)"
          message="Esta acción modificará la fecha de vencimiento del dispositivo. ¿Deseas continuar?"
          onConfirm={() => confirmRenewal()}
          onCancel={() => setRenewalConfirm(null)}
        />
      </div>
    </PageShell>
  );
}

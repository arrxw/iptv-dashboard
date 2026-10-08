import { useState, useEffect } from "react";
import { User, Tv, KeyRound, Save } from "lucide-react";
import { supabase } from "../services/supabase";

interface Props {
  onCreated: () => void;
}

export default function NewClient({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [alias, setAlias] = useState("");
  const [mac, setMac] = useState("");
  const [app, setApp] = useState("");
  const [pin, setPin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("12");
  const [deviceNotes, setDeviceNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [appsList, setAppsList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadApps() {
      const { data } = await supabase.from("apps").select("*").order("name");
      setAppsList(data || []);
    }
    loadApps();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !alias || !mac || !startDate) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const appNormalized = app.trim().toLowerCase();

    // Si la app es Ibo Player, validar PIN (4-12 caracteres alfanuméricos)
    if (appNormalized === "ibo player") {
      const pinTrim = pin.trim();
      const pinValid = /^[A-Za-z0-9]{4,12}$/.test(pinTrim);
      if (!pinValid) {
        alert("PIN inválido. Debe tener entre 4 y 12 caracteres alfanuméricos.");
        return;
      }
    }

    setLoading(true);

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name,
        notes: clientNotes,
      })
      .select()
      .single();

    if (clientError) {
      alert(clientError.message);
      setLoading(false);
      return;
    }

    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setMonth(calculatedEndDate.getMonth() + parseInt(duration, 10));
    const endDate = calculatedEndDate.toISOString().split("T")[0];
    const devicePayload: any = {
      client_id: client.id,
      alias,
      mac_address: mac,
      app_name: app,
      start_date: startDate,
      end_date: endDate,
      notes: deviceNotes,
      active: true,
    };

    if (appNormalized === "ibo player") {
      devicePayload.pin = pin.trim();
    }

    const { error: deviceError } = await supabase.from("devices").insert(devicePayload);

    if (deviceError) {
      alert(deviceError.message);
      setLoading(false);
      return;
    }

    setName("");
    setClientNotes("");
    setAlias("");
    setMac("");
    setApp("");
    setPin("");
    setStartDate("");
    setDuration("12");
    setDeviceNotes("");

    onCreated();

    alert("Cliente creado correctamente");
    setLoading(false);
  }

  return (
    <form className="card new-client-form" onSubmit={handleSubmit}>
      <div className="card__header">
        <div>
          <span className="card__eyebrow">Formulario de registro</span>
          <h2 className="card__title">Nuevo Cliente y Dispositivo</h2>
        </div>
      </div>

      <div className="card__body">
        {/* Sección: Datos del Cliente */}
        <div className="form-section-group">
          <div className="form-section-title">
            <User size={16} className="text-accent" />
            <h3>1. Datos del Cliente</h3>
          </div>

          <div className="form-field">
            <label className="form-field__label">Nombre del cliente *</label>
            <input
              className="input"
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-field" style={{ marginTop: "14px" }}>
            <label className="form-field__label">URL del servidor o notas</label>
            <textarea
              className="textarea"
              placeholder="Pega aquí la URL del servidor m3u, enlace o notas..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Sección: Dispositivo Inicial */}
        <div className="form-section-group" style={{ marginTop: "24px" }}>
          <div className="form-section-title">
            <Tv size={16} className="text-accent" />
            <h3>2. Dispositivo Inicial</h3>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label">Alias dispositivo *</label>
              <input
                className="input"
                placeholder="Ej. Smart TV Salón"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Dirección MAC *</label>
              <input
                className="input"
                placeholder="00:1A:79:XX:XX:XX"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: "14px" }}>
            <div className="form-field">
              <label className="form-field__label">Aplicación</label>
              <select className="select" value={app} onChange={(e) => setApp(e.target.value)}>
                <option value="">Seleccionar aplicación</option>
                {appsList.map((appItem) => (
                  <option key={appItem.id} value={appItem.name}>
                    {appItem.name}
                  </option>
                ))}
              </select>
            </div>

            {app.trim().toLowerCase() === "ibo player" && (
              <div className="form-field">
                <label className="form-field__label">PIN (Ibo Player)</label>
                <div className="input-with-icon">
                  <KeyRound size={16} className="input-icon text-muted" />
                  <input
                    className="input input--has-icon"
                    placeholder="PIN para Ibo Player"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-grid" style={{ marginTop: "14px" }}>
            <div className="form-field">
              <label className="form-field__label">Fecha de Inicio *</label>
              <input
                className="input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Duración *</label>
              <select
                className="select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="1">1 mes</option>
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="9">9 meses</option>
                <option value="12">12 meses (1 año)</option>
                <option value="24">24 meses (2 años)</option>
              </select>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: "14px" }}>
            <label className="form-field__label">Notas del dispositivo</label>
            <textarea
              className="textarea"
              placeholder="Notas técnicas del dispositivo..."
              value={deviceNotes}
              onChange={(e) => setDeviceNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="card__footer">
        <button
          type="submit"
          className="button button--primary button--lg"
          style={{ width: "100%" }}
          disabled={loading}
        >
          <Save size={16} />
          <span>{loading ? "Creando cliente..." : "Guardar cliente y dispositivo"}</span>
        </button>
      </div>
    </form>
  );
}

import { useState, useEffect } from "react";
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
    const { error: deviceError } = await supabase.from("devices").insert({
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
      alert(deviceError.message);
      setLoading(false);
      return;
    }

    setName("");
    setClientNotes("");
    setAlias("");
    setMac("");
    setApp("");
    setStartDate("");
    setDuration("12");
    setDeviceNotes("");

    onCreated();

    alert("Cliente creado correctamente");
    setLoading(false);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card__header">
        <div>
          <p className="muted-text">Nuevo cliente</p>
          <h2>Agregar cliente y dispositivo</h2>
        </div>
      </div>

      <div className="card__body">
        <div className="form-grid">
          <div className="form-field">
            <label className="form-field__label">Nombre *</label>
            <input
              className="input"
              placeholder="Nombre del cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label">URL del servidor</label>
            <textarea
              className="textarea"
              placeholder="Pega aquí la URL del servidor..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-field__label">Alias dispositivo *</label>
            <input
              className="input"
              placeholder="Nombre del dispositivo"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label">MAC *</label>
            <input
              className="input"
              placeholder="Dirección MAC"
              value={mac}
              onChange={(e) => setMac(e.target.value)}
            />
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

          <div className="form-field">
            <label className="form-field__label">Inicio *</label>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
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
            <label className="form-field__label">Notas dispositivo</label>
            <textarea
              className="textarea"
              placeholder="Notas del dispositivo..."
              value={deviceNotes}
              onChange={(e) => setDeviceNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card__footer">
        <button type="submit" className="button button--primary button--lg" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cliente"}
        </button>
      </div>
    </form>
  );
}

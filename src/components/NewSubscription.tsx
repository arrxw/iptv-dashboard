import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

interface Props {
  onCreated: () => void;
}

export default function NewSubscription({ onCreated }: Props) {
  const [service, setService] = useState("");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [duration, setDuration] = useState("12");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!service || !accountName || !email || !password || !costPrice || !salePrice || !startDate) {
      alert("Completa todos los campos.");
      return;
    }

    setLoading(true);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Number(duration));

    const { error } = await supabase.from("subscriptions").insert({
      service_id: service,
      account_name: accountName,
      email,
      password,
      cost_price: Number(costPrice),
      sale_price: Number(salePrice),
      duration_months: Number(duration),
      start_date: startDate,
      end_date: endDate.toISOString().split("T")[0],
      notes,
      active: true,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onCreated();
  }

  async function loadServices() {
    const { data, error } = await supabase.from("services").select("*").order("name");
    if (error) {
      console.error(error);
      return;
    }
    setServices(data || []);
  }

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Servicio</label>
          <select className="select" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Seleccionar servicio</option>
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-field__label">Nombre de la cuenta</label>
          <input className="input" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Correo</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-field__label">Contraseña</label>
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Precio compra (€)</label>
          <input className="input" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-field__label">Precio venta (€)</label>
          <input className="input" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Duración</label>
          <select className="select" value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="1">1 mes</option>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="9">9 meses</option>
            <option value="12">12 meses</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-field__label">Fecha inicio</label>
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
      </div>

      <div className="form-field">
        <label className="form-field__label">Notas</label>
        <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button type="submit" className="button button--primary button--lg" disabled={loading}>
        {loading ? "Guardando..." : "Guardar suscripción"}
      </button>
    </form>
  );
}

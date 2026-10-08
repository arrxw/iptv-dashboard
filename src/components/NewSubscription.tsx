import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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

  async function loadServices() {
    const { data, error } = await supabase.from("services").select("*").order("name");
    if (error) {
      console.error(error);
      return;
    }
    setServices(data || []);
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!service || !accountName || !email || !password || !costPrice || !salePrice || !startDate) {
      alert("Completa todos los campos obligatorios.");
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

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Servicio de Streaming *</label>
          <select className="select" value={service} onChange={(e) => setService(e.target.value)} required>
            <option value="">Seleccionar plataforma</option>
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-field__label">Nombre / Perfil de Cuenta *</label>
          <input
            className="input"
            placeholder="Ej. Familia 4K, Perfil 1..."
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Correo de Acceso *</label>
          <input
            className="input"
            type="email"
            placeholder="cuenta@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="email"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-field__label">Contraseña *</label>
          <input
            className="input"
            type="text"
            placeholder="Clave de acceso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Precio de Compra (€) *</label>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            inputMode="decimal"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-field__label">Precio de Venta (€) *</label>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            inputMode="decimal"
            required
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-field__label">Duración *</label>
          <select className="select" value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="1">1 mes</option>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="9">9 meses</option>
            <option value="12">12 meses (1 año)</option>
          </select>
        </div>

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
      </div>

      <div className="form-field">
        <label className="form-field__label">Notas adicionales</label>
        <textarea
          className="textarea"
          placeholder="PIN de perfil, usuarios asignados, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <button
        type="submit"
        className="button button--primary button--lg"
        style={{ width: "100%", marginTop: "12px" }}
        disabled={loading}
      >
        <Save size={16} />
        <span>{loading ? "Registrando..." : "Guardar Suscripción"}</span>
      </button>
    </form>
  );
}

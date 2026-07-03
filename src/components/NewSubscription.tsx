import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

interface Props {
  onCreated: () => void;
}

export default function NewSubscription({
  onCreated,
}: Props) {
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

  const [services, setServices] = useState<
  { id: string; name: string }[]
>([]);

useEffect(() => {
  loadServices();
}, []);

async function handleSubmit(
  e: React.FormEvent
) {
  e.preventDefault();

  if (
    !service ||
    !accountName ||
    !email ||
    !password ||
    !costPrice ||
    !salePrice ||
    !startDate
  ) {
    alert("Completa todos los campos.");
    return;
  }

  setLoading(true);

  const endDate = new Date(startDate);
  endDate.setMonth(
    endDate.getMonth() + Number(duration)
  );

  const { error } = await supabase
    .from("subscriptions")
    .insert({
      service_id: service,
      account_name: accountName,
      email,
      password,
      cost_price: Number(costPrice),
      sale_price: Number(salePrice),
      duration_months: Number(duration),
      start_date: startDate,
      end_date: endDate
        .toISOString()
        .split("T")[0],
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
  const { data, error } =
    await supabase
      .from("services")
      .select("*")
      .order("name");

  if (error) {
    console.error(error);
    return;
  }

  setServices(data || []);
}

return (
  <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "15px" }}>
        <label>Servicio</label>

        <select
          value={service}
          onChange={(e) =>
            setService(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        >
          <option value="">
            Seleccionar servicio
          </option>
{services.map((item) => (
  <option
    key={item.id}
    value={item.id}
  >
    {item.name}
  </option>
))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Nombre de la cuenta</label>

        <input
          value={accountName}
          onChange={(e) =>
            setAccountName(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Correo</label>

        <input
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Contraseña</label>

        <input
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Precio compra (€)</label>

        <input
          type="number"
          value={costPrice}
          onChange={(e) =>
            setCostPrice(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Precio venta (€)</label>

        <input
          type="number"
          value={salePrice}
          onChange={(e) =>
            setSalePrice(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Duración</label>

        <select
          value={duration}
          onChange={(e) =>
            setDuration(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        >
          <option value="1">1 mes</option>
          <option value="3">3 meses</option>
          <option value="6">6 meses</option>
          <option value="9">9 meses</option>
          <option value="12">12 meses</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Fecha inicio</label>

        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Notas</label>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "10px",
          }}
        />
      </div>

<button
  type="submit"
  style={{
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#8b5cf6",
    color: "white",
    cursor: "pointer",
  }}
>
  {loading
    ? "Guardando..."
    : "Guardar suscripción"}
</button>
    </form>
  );
}
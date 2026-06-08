import { useState } from "react";
import { supabase } from "../services/supabase";

interface Props {
  onCreated: () => void;
}

export default function NewClient({
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] =
    useState("");
  const [clientNotes, setClientNotes] =
    useState("");

  const [alias, setAlias] = useState("");
  const [mac, setMac] = useState("");
  const [app, setApp] = useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [deviceNotes, setDeviceNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !name ||
      !alias ||
      !mac ||
      !startDate ||
      !endDate
    ) {
      alert(
        "Completa todos los campos obligatorios"
      );
      return;
    }

    setLoading(true);

    const {
      data: client,
      error: clientError,
    } = await supabase
      .from("clients")
      .insert({
        name,
        whatsapp,
        notes: clientNotes,
      })
      .select()
      .single();

    if (clientError) {
      alert(clientError.message);
      setLoading(false);
      return;
    }

    const { error: deviceError } =
      await supabase
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
      alert(deviceError.message);
      setLoading(false);
      return;
    }

    setName("");
    setWhatsapp("");
    setClientNotes("");

    setAlias("");
    setMac("");
    setApp("");

    setStartDate("");
    setEndDate("");

    setDeviceNotes("");

    onCreated();

    alert(
      "Cliente creado correctamente"
    );

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px",
      }}
    >
      <h2>Nuevo Cliente</h2>

      <input
        placeholder="Nombre *"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <br />
      <br />

      <input
        placeholder="WhatsApp"
        value={whatsapp}
        onChange={(e) =>
          setWhatsapp(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Notas cliente"
        value={clientNotes}
        onChange={(e) =>
          setClientNotes(e.target.value)
        }
      />

      <hr />

      <input
        placeholder="Alias dispositivo *"
        value={alias}
        onChange={(e) =>
          setAlias(e.target.value)
        }
      />

      <br />
      <br />

      <input
        placeholder="MAC *"
        value={mac}
        onChange={(e) =>
          setMac(e.target.value)
        }
      />

      <br />
      <br />

      <input
        placeholder="App IPTV"
        value={app}
        onChange={(e) =>
          setApp(e.target.value)
        }
      />

      <br />
      <br />

      <label>
        Inicio:
      </label>

      <input
        type="date"
        value={startDate}
        onChange={(e) =>
          setStartDate(e.target.value)
        }
      />

      <br />
      <br />

      <label>
        Fin:
      </label>

      <input
        type="date"
        value={endDate}
        onChange={(e) =>
          setEndDate(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Notas dispositivo"
        value={deviceNotes}
        onChange={(e) =>
          setDeviceNotes(e.target.value)
        }
      />

      <br />
      <br />

      <button type="submit">
        {loading
          ? "Guardando..."
          : "Guardar Cliente"}
      </button>
    </form>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { supabase } from "../services/supabase";

import type { Client } from "../types/client";
import type { Device } from "../types/device";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [, setClient] =
    useState<Client | null>(null);

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [
    showNewDevice,
    setShowNewDevice,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [alias, setAlias] =
    useState("");

  const [mac, setMac] =
    useState("");

  const [app, setApp] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [clientName, setClientName] =
  useState("");

  const [clientWhatsapp, setClientWhatsapp] =
  useState("");

  const [clientNotes, setClientNotes] =
  useState("");

  async function loadData() {
    if (!id) return;

    const {
      data: clientData,
      error: clientError,
    } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (clientError) {
      console.error(clientError);
      return;
    }

    const {
      data: devicesData,
      error: devicesError,
    } = await supabase
      .from("devices")
      .select("*")
      .eq("client_id", id)
      .order("created_at");

    if (devicesError) {
      console.error(devicesError);
      return;
    }

setClient(clientData);

setClientName(
  clientData.name || ""
);

setClientWhatsapp(
  clientData.whatsapp || ""
);

setClientNotes(
  clientData.notes || ""
);

setDevices(devicesData || []);
setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  function daysRemaining(
    endDate: string
  ) {
    const today =
      new Date().getTime();

    const end =
      new Date(endDate).getTime();

    const diff =
      end - today;

    return Math.ceil(
      diff /
        (1000 * 60 * 60 * 24)
    );
  }

  async function copyMac(
    mac: string
  ) {
    await navigator.clipboard.writeText(
      mac
    );

    alert("MAC copiada");
  }

  async function addDevice() {
    if (!id) return;

    if (
      !alias ||
      !mac ||
      !startDate ||
      !endDate
    ) {
      alert(
        "Completa los campos obligatorios"
      );
      return;
    }

    const { error } =
      await supabase
        .from("devices")
        .insert({
          client_id: id,
          alias,
          mac_address: mac,
          app_name: app,
          start_date: startDate,
          end_date: endDate,
          notes,
          active: true,
        });

    if (error) {
      alert(error.message);
      return;
    }

    setAlias("");
    setMac("");
    setApp("");
    setStartDate("");
    setEndDate("");
    setNotes("");

    await loadData();

    alert(
      "Dispositivo añadido"
    );
  }

  async function renewDevice(
    device: Device,
    months: number
  ) {
    const current =
      new Date(device.end_date);

    current.setMonth(
      current.getMonth() +
        months
    );

    const newDate =
      current
        .toISOString()
        .split("T")[0];

    const { error } =
      await supabase
        .from("devices")
        .update({
          end_date: newDate,
          active: true,
        })
        .eq("id", device.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  async function deleteDevice(
    deviceId: string
  ) {
    const confirmDelete =
      window.prompt(
        "Escribe ELIMINAR"
      );

    if (
      confirmDelete !==
      "ELIMINAR"
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("devices")
        .delete()
        .eq("id", deviceId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  async function saveClient() {
  if (!id) return;

  const { error } =
    await supabase
      .from("clients")
      .update({
        name: clientName,
        whatsapp:
          clientWhatsapp,
        notes: clientNotes,
      })
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadData();

  alert(
    "Cliente actualizado"
  );
}

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Cargando...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() =>
          navigate("/")
        }
      >
        ← Volver
      </button>

<h2>Datos cliente</h2>

<input
  value={clientName}
  onChange={(e) =>
    setClientName(
      e.target.value
    )
  }
  placeholder="Nombre"
/>

<br />
<br />

<input
  value={clientWhatsapp}
  onChange={(e) =>
    setClientWhatsapp(
      e.target.value
    )
  }
  placeholder="WhatsApp"
/>

<br />
<br />

<textarea
  value={clientNotes}
  onChange={(e) =>
    setClientNotes(
      e.target.value
    )
  }
  placeholder="Notas"
/>

<br />
<br />

<button
  onClick={saveClient}
>
  Guardar cliente
</button>

      <hr />

      <h2>
        Nuevo dispositivo
      </h2>

      <input
        placeholder="Alias"
        value={alias}
        onChange={(e) =>
          setAlias(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        placeholder="MAC"
        value={mac}
        onChange={(e) =>
          setMac(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        placeholder="App IPTV"
        value={app}
        onChange={(e) =>
          setApp(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="date"
        value={startDate}
        onChange={(e) =>
          setStartDate(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="date"
        value={endDate}
        onChange={(e) =>
          setEndDate(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Notas"
        value={notes}
        onChange={(e) =>
          setNotes(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <button
        onClick={addDevice}
      >
        + Añadir dispositivo
      </button>

      <hr />

      <h2>
        Dispositivos
      </h2>

      {devices.length === 0 ? (
        <p>
          No hay dispositivos
        </p>
      ) : (
        devices.map(
          (device) => (
            <div
              key={device.id}
              style={{
                background:
                  "white",
                padding:
                  "20px",
                borderRadius:
                  "12px",
                marginBottom:
                  "12px",
              }}
            >
<h3>
  {device.alias}
</h3>

<button
  onClick={async () => {
    const newAlias = prompt(
      "Alias",
      device.alias || ""
    );

    if (newAlias === null)
      return;

    const newMac = prompt(
      "MAC",
      device.mac_address
    );

    if (newMac === null)
      return;

    const newApp = prompt(
      "App IPTV",
      device.app_name || ""
    );

    if (newApp === null)
      return;

    const { error } =
      await supabase
        .from("devices")
        .update({
          alias: newAlias,
          mac_address: newMac,
          app_name: newApp,
        })
        .eq("id", device.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();

    alert(
      "Dispositivo actualizado"
    );
  }}
>
  ✏️ Editar
</button>

              <p>
                MAC:{" "}
                {
                  device.mac_address
                }
              </p>

              <button
                onClick={() =>
                  copyMac(
                    device.mac_address
                  )
                }
              >
                Copiar MAC
              </button>

              <p>
                App:{" "}
                {
                  device.app_name
                }
              </p>

              <p>
                Inicio:{" "}
                {
                  device.start_date
                }
              </p>

              <p>
                Fin:{" "}
                {
                  device.end_date
                }
              </p>

              <p>
                Días restantes:{" "}
                {daysRemaining(
                  device.end_date
                )}
              </p>

              <p>
                Estado:{" "}
                {device.active
                  ? "Activo"
                  : "Inactivo"}
              </p>

              <div
                style={{
                  display:
                    "flex",
                  gap: "8px",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  onClick={() =>
                    renewDevice(
                      device,
                      1
                    )
                  }
                >
                  +1 mes
                </button>

                <button
                  onClick={() =>
                    renewDevice(
                      device,
                      3
                    )
                  }
                >
                  +3 meses
                </button>

                <button
                  onClick={() =>
                    renewDevice(
                      device,
                      6
                    )
                  }
                >
                  +6 meses
                </button>

                <button
                  onClick={() =>
                    renewDevice(
                      device,
                      12
                    )
                  }
                >
                  +12 meses
                </button>

                <button
                  onClick={() =>
                    deleteDevice(
                      device.id
                    )
                  }
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";

import type { Client } from "../types/client";
import type { Device } from "../types/device";

export default function ClientDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [client, setClient] =
    useState<Client | null>(null);

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [loading, setLoading] =
    useState(true);

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

      <h1>
        {client?.name}
      </h1>

      {client?.whatsapp && (
        <p>
          WhatsApp:
          {" "}
          {client.whatsapp}
        </p>
      )}

      {client?.notes && (
        <p>
          {client.notes}
        </p>
      )}

      <hr />

      <h2>
        Dispositivos
      </h2>

      {devices.length === 0 ? (
        <p>
          No hay dispositivos
        </p>
      ) : (
        devices.map((device) => (
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

            <p>
              MAC:
              {" "}
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
              App:
              {" "}
              {
                device.app_name
              }
            </p>

            <p>
              Inicio:
              {" "}
              {
                device.start_date
              }
            </p>

            <p>
              Fin:
              {" "}
              {
                device.end_date
              }
            </p>

            <p>
              Días restantes:
              {" "}
              {daysRemaining(
                device.end_date
              )}
            </p>

            <p>
              Estado:
              {" "}
              {device.active
                ? "Activo"
                : "Inactivo"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
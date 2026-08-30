import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";
import NewClient from "./NewClient";
import { formatDate } from "../utils/dateUtils";
import PageHeader from "../components/PageHeader";
import PageShell from "../components/PageShell";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewClient, setShowNewClient] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  function getMinDaysRemaining(clientId: string): number {
    const clientDevices = devices.filter((d) => d.client_id === clientId);
    if (clientDevices.length === 0) return 999;
    return Math.min(...clientDevices.map((d) => daysRemaining(d.end_date)));
  }

  function daysRemaining(endDate: string): number {
    const today = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getAlertStatus(minDays: number): "normal" | "warning" | "danger" | "critical" {
    if (minDays < 7) return "critical";
    if (minDays < 15) return "danger";
    if (minDays < 30) return "warning";
    return "normal";
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function deleteClient(clientId: string, clientName: string) {
    setClientToDelete({ id: clientId, name: clientName });
  }

  async function confirmDeleteClient() {
    if (!clientToDelete) return;

    const { id: clientId } = clientToDelete;

    const { error: devicesError } = await supabase.from("devices").delete().eq("client_id", clientId);
    if (devicesError) {
      alert(devicesError.message);
      setClientToDelete(null);
      return;
    }

    const { error } = await supabase.from("clients").delete().eq("id", clientId);
    if (error) {
      alert(error.message);
      setClientToDelete(null);
      return;
    }

    setClientToDelete(null);
    await loadClients();
    alert("Cliente eliminado");
  }

  async function loadClients() {
    const { data, error } = await supabase.from("clients").select("*").order("name");
    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    const { data: devicesData, error: devicesError } = await supabase.from("devices").select("*");
    if (devicesError) {
      console.error(devicesError);
    }

    setDevices(devicesData || []);

    const clientsWithCount = await Promise.all(
      (data || []).map(async (client) => {
        const { count } = await supabase
          .from("devices")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("client_id", client.id);

        return {
          ...client,
          devicesCount: count || 0,
        };
      })
    );

    setClients(clientsWithCount);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingScreen message="Cargando clientes..." />;
  }

  const upcomingDevices = devices
    .filter((d) => daysRemaining(d.end_date) <= 30 && daysRemaining(d.end_date) > 0)
    .sort((a, b) => daysRemaining(a.end_date) - daysRemaining(b.end_date));

  const expiredDevices = devices.filter((device) => daysRemaining(device.end_date) <= 0);

  return (
    <PageShell>
      <div className="dashboard-page">
        <PageHeader
          title="IPTV Manager"
          subtitle="Visión completa de clientes, dispositivos y fechas de caducidad."
          variant="hero"
          actions={
            <div className="dashboard-header-actions">
              <button className="button button--secondary button--sm" onClick={() => navigate("/subscriptions")}>Suscripciones</button>
              <button className="button button--secondary button--sm" onClick={logout}>Cerrar sesión</button>
            </div>
          }
        />

        <section className="dashboard-toolbar">
          <div className="dashboard-search">
            <input
              className="input"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="dashboard-actions">
            <button
              className="button button--primary button--sm"
              onClick={() => setShowNewClient((value) => !value)}
            >
              {showNewClient ? "Ocultar formulario" : "+ Nuevo cliente"}
            </button>
            {upcomingDevices.length > 0 && (
              <button
                className="button button--warning button--sm"
                onClick={() => setShowUpcoming((value) => !value)}
              >
                ⚠️ {upcomingDevices.length} próximos
              </button>
            )}
            {expiredDevices.length > 0 && (
              <button
                className="button button--danger button--sm"
                onClick={() => setShowExpired((value) => !value)}
              >
                🚨 Caducados ({expiredDevices.length})
              </button>
            )}
            <button
              className="button button--secondary button--sm"
              onClick={() => navigate("/links")}
            >
              Enlaces
            </button>
          </div>
        </section>

        {showNewClient && <NewClient onCreated={loadClients} />}

        <ConfirmDialog
          isOpen={!!clientToDelete}
          title="⚠️ Eliminar cliente"
          message={"¿Estás seguro de que quieres eliminar este cliente?\n\nEsta acción eliminará el cliente y sus dispositivos asociados."}
          onConfirm={confirmDeleteClient}
          onCancel={() => setClientToDelete(null)}
          danger
          confirmLabel="Eliminar definitivamente"
          cancelLabel="Cancelar"
        />

        {showExpired && expiredDevices.length > 0 && (
          <div className="alert-panel alert-panel--critical">
            <strong>Caducados ({expiredDevices.length})</strong>
            <div className="alert-list">
              {expiredDevices.map((device) => {
                const client = clients.find((c) => c.id === device.client_id);
                const days = daysRemaining(device.end_date);
                return (
                  <button
                    key={device.id}
                    type="button"
                    className="alert-item"
                    onClick={() => navigate(`/client/${device.client_id}`)}
                  >
                    <div>
                      <p className="alert-item__title">{client?.name}</p>
                      <p className="alert-item__subtitle">{device.alias}</p>
                    </div>
                    <span className="badge badge--danger">
                      {days === 0 ? "CADUCA HOY" : `CADUCADA ${Math.abs(days)}d`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showUpcoming && (
          <div className="alert-panel alert-panel--warning">
            <strong>Próximos a caducar</strong>
            <div className="alert-list alert-list--stacked">
              {upcomingDevices.map((device) => {
                const client = clients.find((c) => c.id === device.client_id);
                const days = daysRemaining(device.end_date);
                const status = getAlertStatus(days);
                return (
                  <button
                    type="button"
                    key={device.id}
                    className={`alert-item alert-item--${status}`}
                    onClick={() => navigate(`/client/${device.client_id}`)}
                  >
                    <div>
                      <p className="alert-item__title">{client?.name}</p>
                      <p className="alert-item__subtitle">{device.alias}</p>
                      <p className="alert-item__date">{formatDate(device.end_date)}</p>
                    </div>
                    <span className="status-chip">
                      {days < 0
                        ? `CADUCADA ${Math.abs(days)}d`
                        : days === 0
                        ? "HOY"
                        : `${days}d`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="section-title">
          <h2>Clientes ({filteredClients.length})</h2>
        </div>

        {filteredClients.length === 0 ? (
          <div className="empty-state card">
            <p>{search ? "No se encontraron clientes." : "No hay clientes aún."}</p>
          </div>
        ) : (
          <div className="card-grid card-grid--columns-3">
            {filteredClients.map((client) => {
              const minDays = getMinDaysRemaining(client.id);
              const status = getAlertStatus(minDays);
              return (
                <button
                  key={client.id}
                  type="button"
                  className={`client-card client-card--${status} ${minDays <= 0 ? "client-card--expired" : ""}`}
                  onClick={() => navigate(`/client/${client.id}`)}
                >
                  <div className="client-card__header">
                    <div>
                      <h3>{client.name}</h3>
                      <p className="muted-text">
                        {client.whatsapp || "Sin WhatsApp"}
                      </p>
                    </div>
                    {minDays < 30 && (
                      <span className={`badge badge--${status === "critical" ? "danger" : status}`}>{minDays === 1 ? "Hoy" : `${minDays}d`}</span>
                    )}
                  </div>

                  <div className="client-card__content">
                    <div className="client-card__row">
                      <span className="card-pill">{client.devicesCount} dispositivo{client.devicesCount !== 1 ? "s" : ""}</span>
                    </div>
                    {minDays < 30 && (
                      <p className="client-card__status">
                        ⏰ Caduca en {minDays === 1 ? "1 día" : `${minDays} días`}
                      </p>
                    )}
                  </div>

                  <div className="client-card__footer">
                    <button
                      type="button"
                      className="button button--secondary button--sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteClient(client.id, client.name);
                      }}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}

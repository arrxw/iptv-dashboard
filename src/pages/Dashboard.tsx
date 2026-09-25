import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";
import NewClient from "./NewClient";
import { formatDate } from "../utils/dateUtils";
import PageHeader from "../components/PageHeader";
import PageShell from "../components/PageShell";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmDialog from "../components/ConfirmDialog";
import type { Client } from "../types/client";
import type { Device } from "../types/device";

export default function Dashboard() {
  const [clients, setClients] = useState<(Client & { devicesCount: number })[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appFilter, setAppFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expirationFrom, setExpirationFrom] = useState("");
  const [expirationTo, setExpirationTo] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
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
    const [year, month, day] = endDate.split("-").map(Number);
    const end = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
      (data || []).map(async (client: Client) => {
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

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const availableApps = [...new Set(
    devices.map((device) => device.app_name?.trim()).filter((app): app is string => Boolean(app))
  )].sort((a, b) => a.localeCompare(b, "es"));

  const filteredClients = clients
    .map((client) => {
      const clientDevices = devices.filter((device) => device.client_id === client.id);
      const matchingDevices = clientDevices.filter((device) => {
        if (appFilter && device.app_name !== appFilter) return false;
        if (expirationFrom && device.end_date < expirationFrom) return false;
        if (expirationTo && device.end_date > expirationTo) return false;

        const remaining = daysRemaining(device.end_date);
        if (statusFilter === "active" && (!device.active || remaining <= 0)) return false;
        if (statusFilter === "upcoming" && (remaining <= 0 || remaining > 30)) return false;
        if (statusFilter === "expired" && remaining > 0) return false;
        if (statusFilter === "inactive" && device.active) return false;

        return true;
      });

      const clientMatchesSearch =
        client.name.toLocaleLowerCase().includes(normalizedSearch) ||
        (client.notes || "").toLocaleLowerCase().includes(normalizedSearch) ||
        (client.whatsapp || "").toLocaleLowerCase().includes(normalizedSearch);
      const deviceMatchesSearch = matchingDevices.some((device) =>
        [device.alias, device.mac_address, device.app_name, device.notes]
          .some((value) => (value || "").toLocaleLowerCase().includes(normalizedSearch))
      );
      const hasDeviceFilters = Boolean(appFilter || statusFilter !== "all" || expirationFrom || expirationTo);
      const searchMatches = !normalizedSearch || clientMatchesSearch || deviceMatchesSearch;
      const deviceFiltersMatch = matchingDevices.length > 0 || (!hasDeviceFilters && clientDevices.length === 0);

      return { client, matchingDevices, searchMatches, deviceFiltersMatch };
    })
    .filter(({ searchMatches, deviceFiltersMatch }) => searchMatches && deviceFiltersMatch)
    .sort((a, b) => {
      if (sortOrder === "name-desc") return b.client.name.localeCompare(a.client.name, "es");
      if (sortOrder === "created-desc") {
        return new Date(b.client.created_at).getTime() - new Date(a.client.created_at).getTime();
      }
      if (sortOrder === "expiration-asc" || sortOrder === "expiration-desc") {
        const getNearestExpiration = (matchingDevices: typeof devices) =>
          matchingDevices.length
            ? Math.min(...matchingDevices.map((device) => daysRemaining(device.end_date)))
            : Number.POSITIVE_INFINITY;
        const expirationA = getNearestExpiration(a.matchingDevices);
        const expirationB = getNearestExpiration(b.matchingDevices);
        if (!Number.isFinite(expirationA) || !Number.isFinite(expirationB)) {
          if (expirationA === expirationB) return a.client.name.localeCompare(b.client.name, "es");
          return Number.isFinite(expirationA) ? -1 : 1;
        }
        const difference = expirationA - expirationB;
        return sortOrder === "expiration-asc" ? difference : -difference;
      }
      return a.client.name.localeCompare(b.client.name, "es");
    });

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const visibleClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);

  function resetPage<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setCurrentPage(1);
  }

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
          title="Gestor de clientes"
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
              placeholder="Buscar cliente, alias, MAC o aplicación..."
              value={search}
              onChange={(e) => resetPage(setSearch, e.target.value)}
              aria-label="Buscar clientes y dispositivos"
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

        <section className="dashboard-filters card" aria-label="Filtros de clientes">
          <div className="dashboard-filters__grid">
            <label className="form-field">
              <span className="form-field__label">Aplicación</span>
              <select className="select" value={appFilter} onChange={(event) => resetPage(setAppFilter, event.target.value)}>
                <option value="">Todas las aplicaciones</option>
                {availableApps.map((appName) => <option key={appName} value={appName}>{appName}</option>)}
              </select>
            </label>

            <label className="form-field">
              <span className="form-field__label">Estado</span>
              <select className="select" value={statusFilter} onChange={(event) => resetPage(setStatusFilter, event.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="upcoming">Por vencer (30 días)</option>
                <option value="expired">Caducados</option>
                <option value="inactive">Desactivados</option>
              </select>
            </label>

            <label className="form-field">
              <span className="form-field__label">Vence desde</span>
              <input className="input" type="date" value={expirationFrom} max={expirationTo || undefined} onChange={(event) => resetPage(setExpirationFrom, event.target.value)} />
            </label>

            <label className="form-field">
              <span className="form-field__label">Vence hasta</span>
              <input className="input" type="date" value={expirationTo} min={expirationFrom || undefined} onChange={(event) => resetPage(setExpirationTo, event.target.value)} />
            </label>

            <label className="form-field">
              <span className="form-field__label">Ordenar por</span>
              <select className="select" value={sortOrder} onChange={(event) => resetPage(setSortOrder, event.target.value)}>
                <option value="name-asc">Nombre (A–Z)</option>
                <option value="name-desc">Nombre (Z–A)</option>
                <option value="expiration-asc">Vencimiento más próximo</option>
                <option value="expiration-desc">Vencimiento más lejano</option>
                <option value="created-desc">Añadidos recientemente</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => {
              setAppFilter("");
              setStatusFilter("all");
              setExpirationFrom("");
              setExpirationTo("");
              setSortOrder("name-asc");
              setSearch("");
              setCurrentPage(1);
            }}
          >
            Limpiar filtros
          </button>
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
            <p>{clients.length === 0 ? "No hay clientes aún." : "No hay clientes que coincidan con la búsqueda y los filtros."}</p>
          </div>
        ) : (
          <div className="card-grid card-grid--columns-3">
            {visibleClients.map(({ client }) => {
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

        {filteredClients.length > 0 && (
          <nav className="dashboard-pagination" aria-label="Paginación de clientes">
            <span className="muted-text">
              Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredClients.length)} de {filteredClients.length}
            </span>
            <div className="dashboard-pagination__actions">
              <button
                type="button"
                className="button button--secondary button--sm"
                disabled={page <= 1}
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              >
                Anterior
              </button>
              <span className="dashboard-pagination__page">Página {page} de {totalPages}</span>
              <button
                type="button"
                className="button button--secondary button--sm"
                disabled={page >= totalPages}
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}
      </div>
    </PageShell>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  AlertTriangle,
  AlertOctagon,
  SlidersHorizontal,
  X,
  Phone,
  Trash2,
  Tv,
  ChevronRight,
  RotateCcw,
  LogOut,
  CreditCard,
  Link2,
} from "lucide-react";

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
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
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

  const activeFiltersCount =
    (appFilter ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (expirationFrom ? 1 : 0) +
    (expirationTo ? 1 : 0) +
    (sortOrder !== "name-asc" ? 1 : 0);

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
        {/* Mobile-First Header */}
        <PageHeader
          title="Gestor de clientes"
          subtitle="Visión completa de clientes, dispositivos y fechas de caducidad."
          variant="hero"
          actions={
            <div className="dashboard-header-actions">
              <button
                className="button button--secondary button--sm"
                onClick={() => navigate("/subscriptions")}
                title="Ir a Suscripciones"
              >
                <CreditCard size={15} />
                <span>Suscripciones</span>
              </button>
              <button
                className="button button--secondary button--sm"
                onClick={() => navigate("/links")}
                title="Ir a Enlaces"
              >
                <Link2 size={15} />
                <span>Enlaces</span>
              </button>
              <button
                className="button button--ghost button--sm"
                onClick={logout}
                title="Cerrar sesión"
              >
                <LogOut size={15} />
                <span>Salir</span>
              </button>
            </div>
          }
        />

        {/* Mobile Quick KPI Metric Bar */}
        <section className="mobile-stats-row" aria-label="Métricas rápidas">
          <div className="stat-card">
            <span className="stat-card__label">Clientes</span>
            <strong className="stat-card__val">{clients.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Dispositivos</span>
            <strong className="stat-card__val">{devices.length}</strong>
          </div>
          {upcomingDevices.length > 0 && (
            <button
              type="button"
              className={`stat-card stat-card--interactive ${showUpcoming ? "stat-card--active-warning" : ""}`}
              onClick={() => setShowUpcoming((v) => !v)}
            >
              <span className="stat-card__label">⚠️ Por vencer</span>
              <strong className="stat-card__val stat-card__val--warning">
                {upcomingDevices.length}
              </strong>
            </button>
          )}
          {expiredDevices.length > 0 && (
            <button
              type="button"
              className={`stat-card stat-card--interactive ${showExpired ? "stat-card--active-danger" : ""}`}
              onClick={() => setShowExpired((v) => !v)}
            >
              <span className="stat-card__label">🚨 Caducados</span>
              <strong className="stat-card__val stat-card__val--danger">
                {expiredDevices.length}
              </strong>
            </button>
          )}
        </section>

        {/* Mobile Sticky-friendly Search & Primary Action Row */}
        <section className="dashboard-toolbar">
          <div className="dashboard-search-wrap">
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input
                className="input input--has-icon"
                placeholder="Buscar cliente, alias, MAC..."
                value={search}
                onChange={(e) => resetPage(setSearch, e.target.value)}
                aria-label="Buscar clientes y dispositivos"
              />
              {search && (
                <button
                  type="button"
                  className="input-clear-btn"
                  onClick={() => resetPage(setSearch, "")}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-primary-controls">
            <button
              type="button"
              className="button button--primary button--lg dashboard-btn-main"
              onClick={() => setShowNewClient((value) => !value)}
            >
              <Plus size={18} />
              <span>{showNewClient ? "Cerrar formulario" : "Nuevo cliente"}</span>
            </button>

            <button
              type="button"
              className={`button button--secondary button--lg dashboard-btn-filter ${
                activeFiltersCount > 0 ? "button--filter-active" : ""
              }`}
              onClick={() => setShowFilterDrawer((v) => !v)}
              aria-label="Filtros y ordenación"
            >
              <SlidersHorizontal size={18} />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="filter-badge-counter">{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </section>

        {/* Responsive Filters Accordion / Tray */}
        {showFilterDrawer && (
          <section className="dashboard-filters card" aria-label="Filtros de clientes">
            <div className="dashboard-filters__header">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <strong style={{ fontSize: "14px" }}>Filtros avanzados</strong>
              </div>
              <button
                type="button"
                className="button button--ghost button--sm"
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
                <RotateCcw size={14} />
                <span>Restablecer</span>
              </button>
            </div>

            <div className="dashboard-filters__grid">
              <label className="form-field">
                <span className="form-field__label">Aplicación</span>
                <select
                  className="select"
                  value={appFilter}
                  onChange={(event) => resetPage(setAppFilter, event.target.value)}
                >
                  <option value="">Todas las aplicaciones</option>
                  {availableApps.map((appName) => (
                    <option key={appName} value={appName}>
                      {appName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span className="form-field__label">Estado del Dispositivo</span>
                <select
                  className="select"
                  value={statusFilter}
                  onChange={(event) => resetPage(setStatusFilter, event.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="upcoming">Por vencer (30 días)</option>
                  <option value="expired">Caducados</option>
                  <option value="inactive">Desactivados</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-field__label">Vence desde</span>
                <input
                  className="input"
                  type="date"
                  value={expirationFrom}
                  max={expirationTo || undefined}
                  onChange={(event) => resetPage(setExpirationFrom, event.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-field__label">Vence hasta</span>
                <input
                  className="input"
                  type="date"
                  value={expirationTo}
                  min={expirationFrom || undefined}
                  onChange={(event) => resetPage(setExpirationTo, event.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-field__label">Ordenar por</span>
                <select
                  className="select"
                  value={sortOrder}
                  onChange={(event) => resetPage(setSortOrder, event.target.value)}
                >
                  <option value="name-asc">Nombre (A–Z)</option>
                  <option value="name-desc">Nombre (Z–A)</option>
                  <option value="expiration-asc">Vencimiento más próximo</option>
                  <option value="expiration-desc">Vencimiento más lejano</option>
                  <option value="created-desc">Añadidos recientemente</option>
                </select>
              </label>
            </div>
          </section>
        )}

        {/* Formulario nuevo cliente inline/modal */}
        {showNewClient && (
          <div className="new-client-box">
            <NewClient
              onCreated={() => {
                setShowNewClient(false);
                loadClients();
              }}
            />
          </div>
        )}

        {/* Diálogo de confirmación para eliminar cliente */}
        <ConfirmDialog
          isOpen={!!clientToDelete}
          title="⚠️ Eliminar cliente"
          message={
            "¿Estás seguro de que quieres eliminar este cliente?\n\nEsta acción eliminará el cliente y sus dispositivos asociados."
          }
          onConfirm={confirmDeleteClient}
          onCancel={() => setClientToDelete(null)}
          danger
          confirmLabel="Eliminar definitivamente"
          cancelLabel="Cancelar"
        />

        {/* Panel de alertas para Caducados */}
        {showExpired && expiredDevices.length > 0 && (
          <div className="alert-panel alert-panel--critical">
            <div className="alert-panel__top">
              <div className="flex items-center gap-2">
                <AlertOctagon size={18} className="text-danger" />
                <strong>Dispositivos Caducados ({expiredDevices.length})</strong>
              </div>
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => setShowExpired(false)}
                aria-label="Ocultar caducados"
              >
                <X size={16} />
              </button>
            </div>
            <div className="alert-list">
              {expiredDevices.map((device) => {
                const client = clients.find((c) => c.id === device.client_id);
                const days = daysRemaining(device.end_date);
                return (
                  <button
                    key={device.id}
                    type="button"
                    className="alert-item alert-item--danger"
                    onClick={() => navigate(`/client/${device.client_id}`)}
                  >
                    <div className="alert-item__body">
                      <p className="alert-item__title">{client?.name || "Sin cliente"}</p>
                      <p className="alert-item__subtitle">
                        {device.alias} · {device.app_name || "App"}
                      </p>
                    </div>
                    <div className="alert-item__meta">
                      <span className="badge badge--danger">
                        {days === 0 ? "CADUCA HOY" : `CADUCADO HACE ${Math.abs(days)}d`}
                      </span>
                      <ChevronRight size={16} className="alert-item__arrow" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Panel de alertas para Próximos */}
        {showUpcoming && (
          <div className="alert-panel alert-panel--warning">
            <div className="alert-panel__top">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-warning" />
                <strong>Próximos a caducar en 30 días ({upcomingDevices.length})</strong>
              </div>
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => setShowUpcoming(false)}
                aria-label="Ocultar próximos"
              >
                <X size={16} />
              </button>
            </div>
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
                    <div className="alert-item__body">
                      <p className="alert-item__title">{client?.name || "Sin cliente"}</p>
                      <p className="alert-item__subtitle">
                        {device.alias} · {device.app_name || "App"}
                      </p>
                      <p className="alert-item__date">{formatDate(device.end_date)}</p>
                    </div>
                    <div className="alert-item__meta">
                      <span className="status-chip">
                        {days === 0 ? "CADUCA HOY" : `En ${days} días`}
                      </span>
                      <ChevronRight size={16} className="alert-item__arrow" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sección de Lista de Clientes */}
        <div className="section-title">
          <h2>Clientes ({filteredClients.length})</h2>
          {activeFiltersCount > 0 && (
            <span className="muted-text text-sm">Filtros aplicados</span>
          )}
        </div>

        {filteredClients.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state__icon">👥</div>
            <p className="empty-state__msg">
              {clients.length === 0
                ? "No hay clientes registrados todavía."
                : "No se encontraron clientes con los filtros seleccionados."}
            </p>
            {clients.length === 0 ? (
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={() => setShowNewClient(true)}
              >
                + Crear primer cliente
              </button>
            ) : (
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => {
                  setSearch("");
                  setAppFilter("");
                  setStatusFilter("all");
                  setExpirationFrom("");
                  setExpirationTo("");
                }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="card-grid card-grid--columns-3">
            {visibleClients.map(({ client }) => {
              const minDays = getMinDaysRemaining(client.id);
              const status = getAlertStatus(minDays);
              const hasWhatsapp = Boolean(client.whatsapp?.trim());

              return (
                <div
                  key={client.id}
                  className={`client-card client-card--${status} ${minDays <= 0 ? "client-card--expired" : ""}`}
                  onClick={() => navigate(`/client/${client.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/client/${client.id}`);
                  }}
                >
                  <div className="client-card__header">
                    <div className="client-card__name-block">
                      <h3 className="client-card__title">{client.name}</h3>
                      {client.notes && (
                        <p className="client-card__notes">{client.notes}</p>
                      )}
                    </div>
                    {minDays < 30 && (
                      <span
                        className={`badge ${
                          minDays <= 0
                            ? "badge--danger"
                            : status === "critical"
                            ? "badge--danger"
                            : "badge--warning"
                        }`}
                      >
                        {minDays <= 0
                          ? "CADUCADO"
                          : minDays === 1
                          ? "1 día"
                          : `${minDays}d`}
                      </span>
                    )}
                  </div>

                  <div className="client-card__content">
                    <div className="client-card__devices-indicator">
                      <Tv size={15} className="text-muted" />
                      <span>
                        {client.devicesCount} dispositivo{client.devicesCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {minDays < 30 && (
                      <p className="client-card__status">
                        ⏰ {minDays <= 0 ? "Suscripción vencida" : `Vence en ${minDays} días`}
                      </p>
                    )}
                  </div>

                  <div className="client-card__footer">
                    {hasWhatsapp && (
                      <a
                        href={`https://wa.me/${client.whatsapp?.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button--secondary button--sm client-card__wa-btn"
                        onClick={(e) => e.stopPropagation()}
                        title="Contactar por WhatsApp"
                      >
                        <Phone size={14} className="text-success" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      className="button button--ghost button--sm client-card__del-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteClient(client.id, client.name);
                      }}
                      title="Eliminar cliente"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación Mobile-First */}
        {filteredClients.length > pageSize && (
          <nav className="dashboard-pagination" aria-label="Paginación de clientes">
            <span className="dashboard-pagination__info muted-text">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredClients.length)} de {filteredClients.length}
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
              <span className="dashboard-pagination__page">
                {page} / {totalPages}
              </span>
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

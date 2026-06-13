import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import NewClient from "../components/NewClient";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";

interface ClientRow {
  id: string;
  name: string;
  whatsapp: string | null;
  notes: string | null;
  devicesCount: number;
}

// Utilidad para calcular días restantes en los dispositivos
async function fetchMinDaysRemaining(clientId: string): Promise<number | null> {
  const { data } = await supabase
    .from("devices")
    .select("end_date")
    .eq("client_id", clientId)
    .eq("active", true);

  if (!data || data.length === 0) return null;

  const today = Date.now();
  const min = Math.min(
    ...data.map((d) => Math.ceil((new Date(d.end_date).getTime() - today) / 86400000))
  );
  return min;
}

function StatusDot({ days }: { days: number | null }) {
  if (days === null) return <span className="badge badge-neutral">Sin dispositivos</span>;
  if (days < 0)  return <span className="badge badge-inactive">Expirado</span>;
  if (days <= 7) return <span className="badge badge-warning">Vence en {days}d</span>;
  return <span className="badge badge-active">{days}d restantes</span>;
}

export default function Dashboard() {
  const [clients, setClients] = useState<(ClientRow & { minDays: number | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const navigate = useNavigate();
  const { toasts, success, error: showError } = useToast();
  const { confirm, ConfirmModal } = useConfirm();

  async function logout() {
    await supabase.auth.signOut();
  }

  async function deleteClient(clientId: string, clientName: string) {
    const ok = await confirm({
      title: `Eliminar cliente`,
      description: `Esta acción eliminará a "${clientName}" y todos sus dispositivos. No se puede deshacer.`,
      requireTyping: clientName,
      confirmText: "Eliminar",
      danger: true,
    });

    if (!ok) return;

    const { error: devErr } = await supabase
      .from("devices").delete().eq("client_id", clientId);

    if (devErr) { showError(devErr.message); return; }

    const { error: cliErr } = await supabase
      .from("clients").delete().eq("id", clientId);

    if (cliErr) { showError(cliErr.message); return; }

    await loadClients();
    success(`Cliente "${clientName}" eliminado`);
  }

  async function loadClients() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("clients").select("*").order("name");

    if (err) { showError(err.message); setLoading(false); return; }

    const enriched = await Promise.all(
      (data || []).map(async (c) => {
        const { count } = await supabase
          .from("devices")
          .select("*", { count: "exact", head: true })
          .eq("client_id", c.id);

        const minDays = await fetchMinDaysRemaining(c.id);
        return { ...c, devicesCount: count || 0, minDays };
      })
    );

    setClients(enriched);
    setLoading(false);
  }

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.whatsapp || "").includes(search)
  );

  // Estadísticas rápidas
  const total   = clients.length;
  const expiring = clients.filter((c) => c.minDays !== null && c.minDays >= 0 && c.minDays <= 7).length;
  const expired  = clients.filter((c) => c.minDays !== null && c.minDays < 0).length;

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg-base)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Topbar */}
      <header style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.3rem" }}>📺</span>
          <h1 style={{ fontSize: "1rem", fontWeight: 600 }}>IPTV Dashboard</h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <main style={{ maxWidth: 1000, width: "100%", margin: "0 auto", padding: "24px 16px", flex: 1 }}>

        {/* Stats cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}>
          {[
            { label: "Total clientes", value: total, color: "var(--accent)" },
            { label: "Por vencer", value: expiring, color: "var(--warning)" },
            { label: "Expirados", value: expired, color: "var(--danger)" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar: búsqueda + nuevo cliente */}
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 12, top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}>
              🔍
            </span>
            <input
              placeholder="Buscar por nombre o WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
          <NewClient onCreated={loadClients} />
        </div>

        {/* Lista de clientes */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>👤</div>
            <p style={{ color: "var(--text-muted)" }}>
              {search ? "No hay resultados para esa búsqueda" : "Aún no tienes clientes. Crea el primero."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((client) => (
              <div
                key={client.id}
                className="card card-hover"
                onClick={() => navigate(`/client/${client.id}`)}
                style={{ padding: "16px 20px" }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}>
                  {/* Info principal */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: "1rem" }}>{client.name}</h2>
                      <StatusDot days={client.minDays} />
                    </div>
                    {client.whatsapp && (
                      <p style={{ fontSize: "0.85rem", marginTop: 4, color: "var(--text-muted)" }}>
                        📱 {client.whatsapp}
                      </p>
                    )}
                    {client.notes && (
                      <p style={{
                        fontSize: "0.8rem",
                        marginTop: 4,
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 400,
                      }}>
                        {client.notes}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                    <span style={{
                      display: "flex", alignItems: "center", gap: 5,
                      color: "var(--text-muted)", fontSize: "0.85rem",
                    }}>
                      📺 <strong style={{ color: "var(--text-primary)" }}>{client.devicesCount}</strong>
                    </span>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteClient(client.id, client.name)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {ConfirmModal}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

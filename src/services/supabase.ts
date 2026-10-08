import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
    typeof supabaseUrl === "string" &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.length > 10
);

// In-memory / localStorage fallback when Supabase credentials are not configured
const STORAGE_PREFIX = "iptv_mock_db_";

function getStoredTable<T>(tableName: string, defaultData: T[]): T[] {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + tableName);
    if (!raw) {
      window.localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return defaultData;
  }
}

function saveTable<T>(tableName: string, data: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

const INITIAL_APPS = [
  { id: "app-1", name: "Elk Player" },
  { id: "app-2", name: "Hot Player" },
  { id: "app-3", name: "Smarters" },
  { id: "app-4", name: "Ibo Player" },
  { id: "app-5", name: "MEGA" },
  { id: "app-6", name: "Otro (Formuler...)" },
];

const INITIAL_SERVICES = [
  { id: "srv-1", name: "Netflix Premium" },
  { id: "srv-2", name: "Spotify Duo" },
  { id: "srv-3", name: "Disney+ Anual" },
  { id: "srv-4", name: "HBO Max" },
  { id: "srv-5", name: "IPTV Servidor VIP" },
];

// Helper to format date offset from today (local date string YYYY-MM-DD)
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

const INITIAL_CLIENTS = [
  {
    id: "cli-1",
    name: "Alejandro Morales",
    whatsapp: "+34 612 345 678",
    notes: "Cliente VIP, suscripción anual Smart TV",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "cli-2",
    name: "Beatriz Navarro",
    whatsapp: "+34 623 456 789",
    notes: "Avisar por WhatsApp cuando falten 5 días",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "cli-3",
    name: "Carlos Santillán",
    whatsapp: "+34 634 567 890",
    notes: "Dos dispositivos: salón y dormitorio",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "cli-4",
    name: "Diana Vega",
    whatsapp: "+34 645 678 901",
    notes: "Pendiente renovar Hot Player",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "cli-5",
    name: "Enrique Lozano",
    whatsapp: "+34 656 789 012",
    notes: "Pago por Bizum puntual",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_DEVICES = [
  {
    id: "dev-1",
    client_id: "cli-1",
    alias: "Smart TV LG Salón",
    mac_address: "00:1A:79:4A:8B:12",
    app_name: "Elk Player",
    pin: "",
    start_date: getDateOffset(-180),
    end_date: getDateOffset(180),
    notes: "Calidad 4K sin buffer",
    active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "dev-2",
    client_id: "cli-2",
    alias: "Fire TV Stick",
    mac_address: "AA:BB:CC:11:22:33",
    app_name: "Ibo Player",
    pin: "8492",
    start_date: getDateOffset(-360),
    end_date: getDateOffset(5), // Upcoming soon!
    notes: "Revisar PIN si pide activación",
    active: true,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "dev-3",
    client_id: "cli-3",
    alias: "Mi Box Principal",
    mac_address: "12:34:56:78:9A:BC",
    app_name: "Hot Player",
    pin: "",
    start_date: getDateOffset(-90),
    end_date: getDateOffset(15), // Upcoming in 15 days
    notes: "Ubicado en el salón",
    active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "dev-4",
    client_id: "cli-3",
    alias: "Tablet Samsung Dormitorio",
    mac_address: "B0:BE:76:CD:EE:FF",
    app_name: "Smarters",
    pin: "",
    start_date: getDateOffset(-120),
    end_date: getDateOffset(90),
    notes: "Segundo dispositivo del cliente",
    active: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "dev-5",
    client_id: "cli-4",
    alias: "Chromecast con Google TV",
    mac_address: "44:55:66:77:88:99",
    app_name: "Hot Player",
    pin: "",
    start_date: getDateOffset(-365),
    end_date: getDateOffset(-2), // Expired!
    notes: "Caducó hace 2 días, avisado",
    active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "dev-6",
    client_id: "cli-5",
    alias: "Formuler Z11 Pro",
    mac_address: "E4:F0:42:33:44:55",
    app_name: "Otro (Formuler...)",
    pin: "",
    start_date: getDateOffset(-30),
    end_date: getDateOffset(335),
    notes: "Conexión por cable Ethernet",
    active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: "sub-1",
    service_id: "srv-1",
    account_name: "Familia 4K",
    email: "netflix.stream1@gmail.com",
    password: "SafePass2026!",
    cost_price: 12.5,
    sale_price: 19.99,
    duration_months: 12,
    start_date: getDateOffset(-90),
    end_date: getDateOffset(275),
    notes: "4 pantallas simultáneas activas",
    active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "sub-2",
    service_id: "srv-2",
    account_name: "Premium Duo",
    email: "spotify.duo@gmail.com",
    password: "MusicPass2026!",
    cost_price: 7.99,
    sale_price: 13.99,
    duration_months: 6,
    start_date: getDateOffset(-30),
    end_date: getDateOffset(150),
    notes: "Plan dúo compartido",
    active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "sub-3",
    service_id: "srv-3",
    account_name: "Disney Plus Anual",
    email: "disney.acc@gmail.com",
    password: "MagicPass2026!",
    cost_price: 6.5,
    sale_price: 11.99,
    duration_months: 12,
    start_date: getDateOffset(-60),
    end_date: getDateOffset(305),
    notes: "Perfil infantil y general",
    active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

const MOCK_USER = {
  id: "user-admin-1",
  email: "admin@iptv.com",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

const MOCK_SESSION = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  user: MOCK_USER,
};

type AuthListener = (event: string, session: typeof MOCK_SESSION | null) => void;
const authListeners: Set<AuthListener> = new Set();
let currentMockSession: typeof MOCK_SESSION | null = (() => {
  if (typeof window === "undefined") return MOCK_SESSION;
  const stored = window.localStorage.getItem(STORAGE_PREFIX + "session");
  if (stored === "logged_out") return null;
  return MOCK_SESSION;
})();

function createMockClient() {
  const getTableData = (table: string): any[] => {
    switch (table) {
      case "apps":
        return getStoredTable("apps", INITIAL_APPS);
      case "services":
        return getStoredTable("services", INITIAL_SERVICES);
      case "clients":
        return getStoredTable("clients", INITIAL_CLIENTS);
      case "devices":
        return getStoredTable("devices", INITIAL_DEVICES);
      case "subscriptions":
        return getStoredTable("subscriptions", INITIAL_SUBSCRIPTIONS);
      default:
        return getStoredTable(table, []);
    }
  };

  const setTableData = (table: string, data: any[]) => {
    saveTable(table, data);
  };

  return {
    auth: {
      async getSession() {
        return { data: { session: currentMockSession }, error: null };
      },
      onAuthStateChange(callback: AuthListener) {
        authListeners.add(callback);
        // Immediately fire with current session
        setTimeout(() => callback("SIGNED_IN", currentMockSession), 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
      async signInWithPassword({ email }: { email: string; password?: string }) {
        currentMockSession = {
          ...MOCK_SESSION,
          user: { ...MOCK_USER, email: email || "admin@iptv.com" },
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_PREFIX + "session", "logged_in");
        }
        authListeners.forEach((cb) => cb("SIGNED_IN", currentMockSession));
        return { data: { user: currentMockSession.user, session: currentMockSession }, error: null };
      },
      async signOut() {
        currentMockSession = null;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_PREFIX + "session", "logged_out");
        }
        authListeners.forEach((cb) => cb("SIGNED_OUT", null));
        return { error: null };
      },
    },
    from(tableName: string) {
      const filters: ((item: any) => boolean)[] = [];
      let sortFn: ((a: any, b: any) => number) | null = null;
      let countHead = false;
      let joinServices = false;

      const builder: any = {
        select(columns?: string, options?: { count?: string; head?: boolean }) {
          if (options?.head && options?.count) {
            countHead = true;
          }
          if (typeof columns === "string" && columns.includes("services")) {
            joinServices = true;
          }
          return builder;
        },
        eq(field: string, value: any) {
          filters.push((item: any) => item[field] === value);
          return builder;
        },
        order(field: string, { ascending = true }: { ascending?: boolean } = {}) {
          sortFn = (a: any, b: any) => {
            const valA = a[field] ?? "";
            const valB = b[field] ?? "";
            if (valA < valB) return ascending ? -1 : 1;
            if (valA > valB) return ascending ? 1 : -1;
            return 0;
          };
          return builder;
        },
        async single() {
          const table = getTableData(tableName);
          const items = table.filter((item: any) => filters.every((fn) => fn(item)));
          const item = items[0] || null;
          return { data: item, error: item ? null : { message: "Item not found" } };
        },
        async insert(payload: any) {
          const table = getTableData(tableName);
          const toInsert = Array.isArray(payload) ? payload : [payload];
          const newItems = toInsert.map((item) => ({
            ...item,
            id: item.id || `${tableName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            created_at: item.created_at || new Date().toISOString(),
          }));
          const updatedTable = [...table, ...newItems];
          setTableData(tableName, updatedTable);

          const result = Array.isArray(payload) ? newItems : newItems[0];
          return {
            data: result,
            error: null,
            select() {
              return {
                async single() {
                  return { data: result, error: null };
                },
              };
            },
          };
        },
        async update(patch: any) {
          const table = getTableData(tableName);
          let updatedItem: any = null;
          const updatedTable = table.map((item: any) => {
            if (filters.length === 0 || filters.every((fn) => fn(item))) {
              updatedItem = { ...item, ...patch };
              return updatedItem;
            }
            return item;
          });
          setTableData(tableName, updatedTable);
          return {
            data: updatedItem,
            error: null,
            select() {
              return {
                async single() {
                  return { data: updatedItem, error: null };
                },
              };
            },
          };
        },
        async delete() {
          const table = getTableData(tableName);
          const remaining = table.filter((item: any) => !filters.every((fn) => fn(item)));
          setTableData(tableName, remaining);
          return { error: null };
        },
        then(resolve: (val: any) => void, reject?: (err: any) => void) {
          try {
            const table = getTableData(tableName);
            let items = table.filter((item: any) => filters.every((fn) => fn(item)));
            if (sortFn) {
              items = [...items].sort(sortFn);
            }
            if (countHead) {
              resolve({ count: items.length, data: null, error: null });
              return;
            }
            if (joinServices && tableName === "subscriptions") {
              const services = getStoredTable("services", INITIAL_SERVICES);
              items = items.map((sub: any) => {
                const srv = services.find((s: any) => s.id === sub.service_id);
                return {
                  ...sub,
                  services: srv ? { name: srv.name } : null,
                };
              });
            }
            resolve({ data: items, error: null, count: items.length });
          } catch (e) {
            if (reject) reject(e);
            else resolve({ data: [], error: e });
          }
        },
      };

      return builder;
    },
  };
}

let clientInstance: any;

if (isConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn("[AI Studio] Failed to initialize Supabase client, falling back to local storage mock:", err);
    clientInstance = createMockClient();
  }
} else {
  clientInstance = createMockClient();
}

export const supabase = clientInstance;

export interface Device {
  id: string;

  client_id: string;

  alias: string | null;

  mac_address: string;

  app_name: string | null;

  start_date: string;

  end_date: string;

  active: boolean;

  notes: string | null;

  created_at: string;
}
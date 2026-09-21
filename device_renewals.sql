create table if not exists public.device_renewals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  months integer not null check (months > 0),
  cost_amount numeric(10, 2) not null check (cost_amount >= 0),
  sale_amount numeric(10, 2) not null check (sale_amount >= 0),
  profit_amount numeric(10, 2) not null,
  renewed_at timestamptz not null default now()
);

alter table public.device_renewals enable row level security;

create policy "Authenticated users can read device renewals"
  on public.device_renewals for select
  to authenticated
  using (true);

create policy "Authenticated users can create device renewals"
  on public.device_renewals for insert
  to authenticated
  with check (true);

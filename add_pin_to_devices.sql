-- Migration: add 'pin' column to devices table
-- Run this on your Supabase / Postgres database

ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS pin TEXT;

-- Optional: add an index if you will search by pin (not usually necessary)
-- CREATE INDEX IF NOT EXISTS idx_devices_pin ON public.devices(pin);

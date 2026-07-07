create table if not exists public.app_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- The Vercel API uses SUPABASE_SERVICE_ROLE_KEY server-side, so no public RLS
-- policy is required for the app_state table.

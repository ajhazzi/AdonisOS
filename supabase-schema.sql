create extension if not exists pgcrypto;

create table if not exists public.app_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.whoop_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  whoop_user_id text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  scopes text,
  connection_status text not null default 'connected',
  connected_at timestamptz,
  disconnected_at timestamptz,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whoop_oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  state_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.whoop_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  whoop_cycle_id text not null,
  start_time timestamptz,
  end_time timestamptz,
  timezone_offset text,
  strain numeric,
  kilojoules numeric,
  average_heart_rate numeric,
  max_heart_rate numeric,
  score_state text,
  raw_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, whoop_cycle_id)
);

create table if not exists public.whoop_recoveries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  whoop_cycle_id text not null,
  whoop_sleep_id text,
  recorded_at timestamptz,
  recovery_score numeric,
  resting_heart_rate numeric,
  hrv_rmssd numeric,
  spo2_percentage numeric,
  skin_temperature numeric,
  score_state text,
  raw_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, whoop_cycle_id)
);

create table if not exists public.whoop_sleeps (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  whoop_sleep_id text not null,
  start_time timestamptz,
  end_time timestamptz,
  nap boolean default false,
  score_state text,
  sleep_performance_percentage numeric,
  sleep_efficiency_percentage numeric,
  sleep_consistency_percentage numeric,
  sleep_need_ms numeric,
  total_in_bed_ms numeric,
  total_awake_ms numeric,
  total_sleep_ms numeric,
  light_sleep_ms numeric,
  slow_wave_sleep_ms numeric,
  rem_sleep_ms numeric,
  sleep_cycle_count numeric,
  disturbance_count numeric,
  raw_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, whoop_sleep_id)
);

create table if not exists public.whoop_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  whoop_workout_id text not null,
  start_time timestamptz,
  end_time timestamptz,
  timezone_offset text,
  sport_id numeric,
  sport_name text,
  strain numeric,
  average_heart_rate numeric,
  max_heart_rate numeric,
  kilojoules numeric,
  distance_meters numeric,
  altitude_gain_meters numeric,
  percent_recorded numeric,
  raw_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, whoop_workout_id)
);

create table if not exists public.whoop_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text,
  resource_id text,
  received_at timestamptz not null default now(),
  processing_status text,
  error_message text,
  raw_json jsonb not null
);

create table if not exists public.adonis_daily_readiness (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  date date not null,
  recovery_score numeric,
  sleep_performance_percentage numeric,
  sleep_duration_hours numeric,
  hrv_rmssd numeric,
  resting_heart_rate numeric,
  cycle_strain numeric,
  readiness_level text,
  recommended_action text,
  recommended_rir text,
  volume_multiplier numeric,
  finisher_enabled boolean,
  recommendation_reason text,
  rules_version text,
  source text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.adonis_whoop_workout_matches (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  adonis_workout_log_id text,
  whoop_workout_id text,
  match_confidence numeric,
  match_reason text,
  created_at timestamptz not null default now(),
  unique (user_id, adonis_workout_log_id, whoop_workout_id)
);

alter table public.app_state enable row level security;
alter table public.whoop_connections enable row level security;
alter table public.whoop_oauth_states enable row level security;
alter table public.whoop_cycles enable row level security;
alter table public.whoop_recoveries enable row level security;
alter table public.whoop_sleeps enable row level security;
alter table public.whoop_workouts enable row level security;
alter table public.whoop_webhook_events enable row level security;
alter table public.adonis_daily_readiness enable row level security;
alter table public.adonis_whoop_workout_matches enable row level security;

-- The Vercel API uses SUPABASE_SERVICE_ROLE_KEY server-side, so no public RLS
-- policy is required for these private app tables.

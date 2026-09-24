-- ============================================================
-- Aureus — Dashboard Snapshots (marketing hero card bridge)
-- Run this ONCE in the Supabase SQL Editor.
-- The Vite dashboard upserts a monthly summary snapshot;
-- the Next.js marketing site reads it (RLS-locked to owner).
-- ============================================================

create table if not exists public.dashboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period text not null,                 -- "2026-09"
  period_label text not null,           -- "September 2026"
  income numeric not null default 0,
  expense numeric not null default 0,
  budget_limit numeric not null default 0,
  budget_spent numeric not null default 0,
  net_worth numeric not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, period)
);

alter table public.dashboard_snapshots enable row level security;

-- Owner-only access (SELECT / INSERT / UPDATE) — no public access.
drop policy if exists "snapshots_select_own" on public.dashboard_snapshots;
create policy "snapshots_select_own"
  on public.dashboard_snapshots for select
  using (auth.uid() = user_id);

drop policy if exists "snapshots_insert_own" on public.dashboard_snapshots;
create policy "snapshots_insert_own"
  on public.dashboard_snapshots for insert
  with check (auth.uid() = user_id);

drop policy if exists "snapshots_update_own" on public.dashboard_snapshots;
create policy "snapshots_update_own"
  on public.dashboard_snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep reads fast on the common query (latest snapshot for a user).
create index if not exists dashboard_snapshots_user_updated_idx
  on public.dashboard_snapshots (user_id, updated_at desc);

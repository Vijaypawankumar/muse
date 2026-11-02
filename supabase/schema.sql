-- MUSE database schema.
-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  angle text,
  status text not null default 'seen'
    check (status in ('seen', 'saved', 'drafting', 'posted')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ideas_created_idx on public.ideas (created_at desc);

create table if not exists public.wins (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security is ON with no policies on purpose.
-- Only the server (using the service role key) can read or write these tables.
-- The browser never talks to Supabase directly.
alter table public.ideas enable row level security;
alter table public.wins enable row level security;

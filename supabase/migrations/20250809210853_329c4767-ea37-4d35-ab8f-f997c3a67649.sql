-- Create user_badges table for role/badge management
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  user_name text not null unique,
  verified boolean not null default false,
  staff boolean not null default false,
  bot boolean not null default false
);

-- Enable RLS and permissive policies similar to existing tables
alter table public.user_badges enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'user_badges'
  ) then
    create policy "Allow all operations on user_badges" on public.user_badges
    for all using (true) with check (true);
  end if;
end $$;
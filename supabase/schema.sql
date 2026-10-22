-- Axlori Resolve: authentication foundation schema.
-- Run in the Supabase SQL editor AFTER creating the project (one time).
-- This creates the public.profiles table, the signup trigger, and the Row
-- Level Security policies for the auth phase. Scope: profiles only. The
-- reports database is intentionally NOT part of this phase.

-- ---------------------------------------------------------------------------
-- 1. Table: public.profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'student'
    check (role in ('student', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. New-user trigger. Every signup gets a profile with the DEFAULT student
--    role. Role is hard-coded here; signup payloads can never select it.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users can read only their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Users may update only their own row.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No client inserts or deletes: rows are created by the trigger and removed
-- by cascade from auth.users.
drop policy if exists "profiles_no_insert" on public.profiles;
create policy "profiles_no_insert"
  on public.profiles for insert
  to authenticated
  with check (false);

drop policy if exists "profiles_no_delete" on public.profiles;
create policy "profiles_no_delete"
  on public.profiles for delete
  to authenticated
  using (false);

-- ---------------------------------------------------------------------------
-- 4. Column-level hardening: even with the update policy above, authenticated
--    clients may only change full_name. role, email, and id are not updatable,
--    so a user can never promote themselves through a profile update.
-- ---------------------------------------------------------------------------
revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Role elevation path (staff / admin):
--   Performed only through a trusted process, e.g. the Supabase dashboard SQL
--   editor or a server-side route using the SERVICE ROLE key:
--     update public.profiles set role = 'staff' where id = '<user-uuid>';
--   The service role key bypasses RLS and must stay server-side only.
-- ---------------------------------------------------------------------------

-- KRM Buddy database schema (Supabase / PostgreSQL)
-- Run the entire file in Supabase Dashboard > SQL Editor > New query.
create extension if not exists pgcrypto;

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 100),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text not null unique check (char_length(username) between 3 and 24),
  email text not null default '',
  matric_no text not null default '',
  faculty text not null default '',
  phone text not null default '',
  role text not null default 'member' check (role in ('admin','leader','member')),
  group_id uuid references public.groups(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 140),
  body text not null,
  audience text not null default 'all', -- 'all' or the target group UUID as text
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  topic text not null default '',
  url text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  session_date date not null,
  group_id uuid references public.groups(id) on delete set null,
  notes text not null default '',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.attendance(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('present','absent')),
  marked_at timestamptz not null default now(),
  unique(event_id, member_id)
);

create index if not exists profiles_group_id_idx on public.profiles(group_id);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists announcements_created_at_idx on public.announcements(created_at desc);
create index if not exists attendance_date_idx on public.attendance(session_date);
create index if not exists attendance_records_member_idx on public.attendance_records(member_id);

-- Helper functions run with a fixed search_path to avoid search-path attacks.
create or replace function public.current_role()
returns text language sql stable security definer set search_path = ''
as $$ select p.role from public.profiles p where p.id = (select auth.uid()) $$;

create or replace function public.current_group_id()
returns uuid language sql stable security definer set search_path = ''
as $$ select p.group_id from public.profiles p where p.id = (select auth.uid()) $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin') $$;

create or replace function public.is_group_manager(target_group uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select public.is_admin() or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'leader' and p.group_id = target_group) $$;

revoke all on function public.current_role() from public;
revoke all on function public.current_group_id() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_group_manager(uuid) from public;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_group_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_group_manager(uuid) to authenticated;

-- Profile is created after signup. Role/group/status always start with safe defaults.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  raw_username text;
begin
  raw_username := lower(coalesce(new.raw_user_meta_data ->> 'username', 'ahli_' || left(new.id::text, 8)));
  if char_length(raw_username) < 3 or char_length(raw_username) > 24 or raw_username !~ '^[a-zA-Z0-9_.-]+$' then
    raw_username := 'ahli_' || left(new.id::text, 8);
  end if;
  insert into public.profiles (id, full_name, username, email, matric_no, faculty, role, group_id, status)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Ahli KRM'),
    raw_username,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'matric_no', ''),
    coalesce(new.raw_user_meta_data ->> 'faculty', ''),
    'member', null, 'active'
  );
  return new;
exception when unique_violation then
  insert into public.profiles (id, full_name, username, email, matric_no, faculty, role, group_id, status)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Ahli KRM'), 'ahli_' || left(new.id::text, 8), coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'matric_no', ''), coalesce(new.raw_user_meta_data ->> 'faculty', ''), 'member', null, 'active');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Non-admins cannot self-promote or change their own group/status, even through direct API calls.
create or replace function public.protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) = old.id and not public.is_admin() then
    if new.role is distinct from old.role or new.group_id is distinct from old.group_id or new.status is distinct from old.status then
      raise exception 'Only an admin can change role, group assignment or account status.';
    end if;
  end if;
  if not public.is_admin() and (new.role = 'admin' or new.role = 'leader') then
    raise exception 'Only an admin can assign privileged roles.';
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_privileges_trigger on public.profiles;
create trigger protect_profile_privileges_trigger before update on public.profiles for each row execute procedure public.protect_profile_privileges();

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements for each row execute procedure public.set_updated_at();
drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at before update on public.materials for each row execute procedure public.set_updated_at();

alter table public.groups enable row level security;
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.materials enable row level security;
alter table public.attendance enable row level security;
alter table public.attendance_records enable row level security;

-- Profiles: own profile, admins all profiles, leaders only profiles assigned to their group.
drop policy if exists "profiles_read_scoped" on public.profiles;
create policy "profiles_read_scoped" on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin() or (public.current_role() = 'leader' and group_id = public.current_group_id()));
drop policy if exists "profiles_update_scoped" on public.profiles;
create policy "profiles_update_scoped" on public.profiles for update to authenticated
using (public.is_admin() or (public.current_role() = 'leader' and group_id = public.current_group_id()) or id = (select auth.uid()))
with check (public.is_admin() or (public.current_role() = 'leader' and group_id = public.current_group_id()) or id = (select auth.uid()));

-- Groups are visible to signed-in users; only admins can create/update/delete groups.
drop policy if exists "groups_read_authenticated" on public.groups;
create policy "groups_read_authenticated" on public.groups for select to authenticated using (true);
drop policy if exists "groups_admin_insert" on public.groups;
create policy "groups_admin_insert" on public.groups for insert to authenticated with check (public.is_admin());
drop policy if exists "groups_admin_update" on public.groups;
create policy "groups_admin_update" on public.groups for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "groups_admin_delete" on public.groups;
create policy "groups_admin_delete" on public.groups for delete to authenticated using (public.is_admin());

-- Announcements: everyone can read global announcements; only assigned group can read group-specific ones.
drop policy if exists "announcements_read_audience" on public.announcements;
create policy "announcements_read_audience" on public.announcements for select to authenticated
using (audience = 'all' or public.is_admin() or (public.current_role() = 'leader' and audience = public.current_group_id()::text) or audience = public.current_group_id()::text);
drop policy if exists "announcements_insert_admin_or_group_leader" on public.announcements;
create policy "announcements_insert_admin_or_group_leader" on public.announcements for insert to authenticated
with check (public.is_admin() or (public.current_role() = 'leader' and audience = public.current_group_id()::text));
drop policy if exists "announcements_update_admin_or_group_leader" on public.announcements;
create policy "announcements_update_admin_or_group_leader" on public.announcements for update to authenticated
using (public.is_admin() or (public.current_role() = 'leader' and audience = public.current_group_id()::text))
with check (public.is_admin() or (public.current_role() = 'leader' and audience = public.current_group_id()::text));
drop policy if exists "announcements_delete_admin_or_group_leader" on public.announcements;
create policy "announcements_delete_admin_or_group_leader" on public.announcements for delete to authenticated
using (public.is_admin() or (public.current_role() = 'leader' and audience = public.current_group_id()::text));

-- Materials are available to signed-in members; admin/leader can manage them.
drop policy if exists "materials_read_authenticated" on public.materials;
create policy "materials_read_authenticated" on public.materials for select to authenticated using (true);
drop policy if exists "materials_insert_managers" on public.materials;
create policy "materials_insert_managers" on public.materials for insert to authenticated with check (public.current_role() in ('admin','leader') and created_by = (select auth.uid()));
drop policy if exists "materials_update_managers" on public.materials;
create policy "materials_update_managers" on public.materials for update to authenticated using (public.current_role() in ('admin','leader')) with check (public.current_role() in ('admin','leader'));
drop policy if exists "materials_delete_managers" on public.materials;
create policy "materials_delete_managers" on public.materials for delete to authenticated using (public.current_role() in ('admin','leader'));

-- Sessions: admin manages all; group leaders manage their own group sessions. Members can read their group's or global sessions.
drop policy if exists "attendance_read_scoped" on public.attendance;
create policy "attendance_read_scoped" on public.attendance for select to authenticated
using (group_id is null or public.is_admin() or group_id = public.current_group_id());
drop policy if exists "attendance_insert_managers" on public.attendance;
create policy "attendance_insert_managers" on public.attendance for insert to authenticated
with check (public.is_admin() or (public.current_role() = 'leader' and group_id = public.current_group_id()));
drop policy if exists "attendance_update_managers" on public.attendance;
create policy "attendance_update_managers" on public.attendance for update to authenticated
using (public.is_admin() or (public.current_role() = 'leader' and group_id = public.current_group_id()))
with check (public.is_admin() or (public.current_role() = 'leader' and group_id = public.current_group_id()));
drop policy if exists "attendance_delete_managers" on public.attendance;
create policy "attendance_delete_managers" on public.attendance for delete to authenticated
using (public.is_admin() or (public.current_role() = 'leader' and group_id = public.current_group_id()));

-- A member can mark only their own attendance for a session they can see.
drop policy if exists "attendance_records_read_scoped" on public.attendance_records;
create policy "attendance_records_read_scoped" on public.attendance_records for select to authenticated
using (member_id = (select auth.uid()) or public.is_admin() or exists (select 1 from public.attendance a where a.id = event_id and a.group_id = public.current_group_id() and public.current_role() = 'leader'));
drop policy if exists "attendance_records_insert_self" on public.attendance_records;
create policy "attendance_records_insert_self" on public.attendance_records for insert to authenticated
with check (member_id = (select auth.uid()) and exists (select 1 from public.attendance a where a.id = event_id and (a.group_id is null or a.group_id = public.current_group_id())));
drop policy if exists "attendance_records_update_self_or_admin" on public.attendance_records;
create policy "attendance_records_update_self_or_admin" on public.attendance_records for update to authenticated
using (member_id = (select auth.uid()) or public.is_admin())
with check (member_id = (select auth.uid()) or public.is_admin());
drop policy if exists "attendance_records_delete_admin" on public.attendance_records;
create policy "attendance_records_delete_admin" on public.attendance_records for delete to authenticated using (public.is_admin());

-- Optional starter groups. Delete these rows if you prefer to add your own groups in the portal.
insert into public.groups (name, description) values
 ('Usrah Al-Falah', 'Kumpulan usrah KRM Buddy'),
 ('Usrah An-Nur', 'Kumpulan usrah KRM Buddy'),
 ('Usrah As-Salam', 'Kumpulan usrah KRM Buddy')
on conflict (name) do nothing;

-- Digital Detective World · Screen 01 Authentication Schema (Supabase PostgreSQL)
-- Enforces strict role separation, hashed student PINs, and verified parent-child links.

create extension if not exists pgcrypto;

-- 1. Teacher Profiles (linked to Supabase Auth users)
create table if not exists public.teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  username text unique,
  email text not null unique,
  display_name text not null,
  school_name text not null default 'SJKC Ming Tao',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Classes managed by teachers
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  class_code text not null unique,
  class_name text not null,
  teacher_id uuid not null references public.teacher_profiles(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Students (provisioned by authorised teachers; PINs stored ONLY as salted scrypt hashes)
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_code text not null,
  display_name text not null,
  pin_hash text not null,
  is_active boolean not null default true,
  avatar_config jsonb,
  xp integer not null default 0,
  stars integer not null default 0,
  badges jsonb not null default '[]'::jsonb,
  completed_missions jsonb not null default '[]'::jsonb,
  last_position text not null default 'avatar-setup',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, student_code)
);

-- 4. Parent Profiles (linked to Supabase Auth users)
create table if not exists public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. Verified Parent-Child Links (established only via authorised school-issued process)
create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parent_profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (parent_id, student_id)
);

-- Enable Row Level Security on all tables
alter table public.teacher_profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.parent_student_links enable row level security;

-- Deny direct anonymous reads of sensitive tables; server-side / Edge Function uses service_role
-- Teachers can view only their own profile and assigned classes/students
create policy "teachers_read_own_profile" on public.teacher_profiles
  for select using (auth.uid() = auth_user_id);

create policy "teachers_read_assigned_classes" on public.classes
  for select using (
    exists (
      select 1 from public.teacher_profiles tp
      where tp.id = classes.teacher_id and tp.auth_user_id = auth.uid()
    )
  );

create policy "teachers_manage_assigned_students" on public.students
  for all using (
    exists (
      select 1 from public.classes c
      join public.teacher_profiles tp on tp.id = c.teacher_id
      where c.id = students.class_id and tp.auth_user_id = auth.uid()
    )
  );

-- Parents can read only their own profile and verified linked children (read-only)
create policy "parents_read_own_profile" on public.parent_profiles
  for select using (auth.uid() = auth_user_id);

create policy "parents_read_own_links" on public.parent_student_links
  for select using (
    exists (
      select 1 from public.parent_profiles pp
      where pp.id = parent_student_links.parent_id and pp.auth_user_id = auth.uid()
    )
  );

create policy "parents_read_linked_students_only" on public.students
  for select using (
    exists (
      select 1 from public.parent_student_links psl
      join public.parent_profiles pp on pp.id = psl.parent_id
      where psl.student_id = students.id
        and psl.is_verified = true
        and pp.auth_user_id = auth.uid()
    )
  );

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'student' check (role in ('student', 'admin')),
  username text unique,
  first_name text,
  middle_name text,
  last_name text,
  student_id text unique,
  academic_year text,
  program text,
  department text,
  position text,
  interests text[] not null default '{}',
  technologies text[] not null default '{}',
  career_target text,
  profile_image_path text,
  academic_records jsonb not null default '{}'::jsonb,
  achievements text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  description text not null default '',
  entry_thresholds jsonb not null default '{}'::jsonb,
  junior_thresholds jsonb not null default '{}'::jsonb,
  senior_thresholds jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  default_weight numeric(5,4) not null default 0.10 check (default_weight >= 0 and default_weight <= 1),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.electives (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.specializations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  career_id uuid not null references public.careers(id) on delete cascade,
  required_skills text[] not null default '{}',
  recommended_electives text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (career_id, name)
);

create table if not exists public.elective_mappings (
  id uuid primary key default gen_random_uuid(),
  elective_id uuid not null references public.electives(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  boost_percentage numeric(5,2) not null check (boost_percentage >= 0 and boost_percentage <= 100),
  formula text not null default 'New score = current score + boost percentage',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (elective_id, skill_id)
);

create table if not exists public.student_skills (
  student_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  score numeric(5,2) not null default 0 check (score >= 0 and score <= 100),
  updated_at timestamptz not null default now(),
  primary key (student_id, skill_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  answer text not null,
  feedback text,
  score numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists public.resume_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  analysis jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.prevent_non_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role <> new.role and not public.is_admin() then
    raise exception 'Only an administrator can change a user role';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_non_admin_role_change on public.profiles;
create trigger prevent_non_admin_role_change
before update on public.profiles
for each row
execute function public.prevent_non_admin_role_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    role,
    username,
    first_name,
    middle_name,
    last_name,
    student_id,
    academic_year,
    program,
    interests,
    technologies
  )
  values (
    new.id,
    new.email,
    'student',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'middle_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'student_id',
    new.raw_user_meta_data ->> 'academic_year',
    new.raw_user_meta_data ->> 'program',
    coalesce(
      array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'interests')),
      '{}'
    ),
    coalesce(
      array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'technologies')),
      '{}'
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    first_name = excluded.first_name,
    middle_name = excluded.middle_name,
    last_name = excluded.last_name,
    student_id = excluded.student_id,
    academic_year = excluded.academic_year,
    program = excluded.program,
    interests = excluded.interests,
    technologies = excluded.technologies,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.careers enable row level security;
alter table public.skills enable row level security;
alter table public.electives enable row level security;
alter table public.specializations enable row level security;
alter table public.elective_mappings enable row level security;
alter table public.student_skills enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.resume_files enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and role = 'student');

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'student');

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'careers',
    'skills',
    'electives',
    'specializations',
    'elective_mappings'
  ]
  loop
    execute format(
      'drop policy if exists %I_public_read on public.%I',
      table_name,
      table_name
    );

    execute format(
      'create policy %I_public_read on public.%I for select to anon, authenticated using (true)',
      table_name,
      table_name
    );

    execute format(
      'drop policy if exists %I_admin_all on public.%I',
      table_name,
      table_name
    );

    execute format(
      'create policy %I_admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name,
      table_name
    );
  end loop;
end;
$$;

drop policy if exists student_skills_own on public.student_skills;
create policy student_skills_own
on public.student_skills
for all
to authenticated
using (student_id = auth.uid() or public.is_admin())
with check (student_id = auth.uid() or public.is_admin());

drop policy if exists notifications_own on public.notifications;
create policy notifications_own
on public.notifications
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read
on public.audit_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists audit_logs_admin_insert on public.audit_logs;
create policy audit_logs_admin_insert
on public.audit_logs
for insert
to authenticated
with check (public.is_admin());

drop policy if exists interview_sessions_own on public.interview_sessions;
create policy interview_sessions_own
on public.interview_sessions
for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists resume_files_own on public.resume_files;
create policy resume_files_own
on public.resume_files
for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

grant select on
  public.careers,
  public.skills,
  public.electives,
  public.specializations,
  public.elective_mappings
to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.student_skills,
  public.notifications
to authenticated;

grant select, insert, update, delete on
  public.careers,
  public.skills,
  public.electives,
  public.specializations,
  public.elective_mappings
to authenticated;

grant select, insert on public.audit_logs to authenticated;

grant select, insert, update, delete on
  public.interview_sessions,
  public.resume_files
to authenticated;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists resumes_owner_select on storage.objects;
create policy resumes_owner_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and (owner_id = (select auth.uid()::text) or public.is_admin())
);

drop policy if exists resumes_owner_insert on storage.objects;
create policy resumes_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (owner_id = (select auth.uid()::text) or public.is_admin())
);

drop policy if exists resumes_owner_delete on storage.objects;
create policy resumes_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (owner_id = (select auth.uid()::text) or public.is_admin())
);

insert into public.skills (name, category, default_weight)
values
  ('Programming', 'Technical Core', 0.40),
  ('Web Development', 'Technical Core', 0.30),
  ('Database Management', 'Data Systems', 0.20),
  ('Version Control', 'Collaboration', 0.05),
  ('Deployment', 'Infrastructure', 0.05)
on conflict (name) do nothing;

insert into public.careers (
  name,
  category,
  description,
  entry_thresholds,
  junior_thresholds,
  senior_thresholds
)
values
  (
    'Web Developer',
    'Software Development',
    'Designs and maintains web applications.',
    '{"Programming":80,"Web Development":75,"Database Management":70}',
    '{"Programming":85,"Web Development":85,"Database Management":75}',
    '{"Programming":90,"Web Development":90,"Database Management":85}'
  ),
  (
    'Data Analyst',
    'Data Systems',
    'Analyzes data to support business decisions.',
    '{"Database Management":75,"Programming":65}',
    '{"Database Management":80,"Programming":75}',
    '{"Database Management":90,"Programming":85}'
  ),
  (
    'Cloud Engineer',
    'Infrastructure',
    'Deploys and manages cloud infrastructure.',
    '{"Deployment":70,"Programming":65}',
    '{"Deployment":80,"Programming":75}',
    '{"Deployment":85,"Programming":85}'
  )
on conflict (name) do nothing;

insert into public.electives (name, description)
values
  ('Advanced Web Systems', 'Advanced frontend and backend web development.'),
  ('RESTful API Development', 'Design and consume secure REST APIs.'),
  ('DevOps Fundamentals', 'Version control, automation, and deployment practices.'),
  ('Cloud Deployment Basics', 'Foundations of deploying applications to cloud platforms.')
on conflict (name) do nothing;

insert into public.specializations (
  career_id,
  name,
  required_skills,
  recommended_electives
)
select
  c.id,
  'Frontend Developer',
  array['HTML/CSS', 'JavaScript', 'UI/UX Principles'],
  array['Advanced Web Systems', 'UI/UX Design Basics']
from public.careers c
where c.name = 'Web Developer'
  and not exists (
    select 1
    from public.specializations s
    where s.career_id = c.id
      and s.name = 'Frontend Developer'
  );

insert into public.specializations (
  career_id,
  name,
  required_skills,
  recommended_electives
)
select
  c.id,
  'Backend Developer',
  array['Node.js', 'REST API', 'Database Management'],
  array['RESTful API Development', 'Database Systems']
from public.careers c
where c.name = 'Web Developer'
  and not exists (
    select 1
    from public.specializations s
    where s.career_id = c.id
      and s.name = 'Backend Developer'
  );

insert into public.elective_mappings (
  elective_id,
  skill_id,
  boost_percentage,
  formula
)
select
  e.id,
  s.id,
  10,
  'New score = current score + 10 percentage points'
from public.electives e,
     public.skills s
where e.name = 'DevOps Fundamentals'
  and s.name = 'Deployment'
  and not exists (
    select 1
    from public.elective_mappings m
    where m.elective_id = e.id
      and m.skill_id = s.id
  );
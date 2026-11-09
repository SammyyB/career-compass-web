-- Career Compass: admin data quality and query indexes.
-- Run this migration in Supabase SQL Editor after 0001 and 0002.

create index if not exists profiles_role_created_at_idx
  on public.profiles (role, created_at desc);

create index if not exists profiles_student_id_lower_idx
  on public.profiles (lower(student_id));

create index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create index if not exists profiles_program_idx
  on public.profiles (program);

create index if not exists careers_name_idx
  on public.careers (name);

create index if not exists skills_name_idx
  on public.skills (name);

create index if not exists electives_name_idx
  on public.electives (name);

create index if not exists specializations_career_name_idx
  on public.specializations (career_id, name);

create index if not exists elective_mappings_elective_skill_idx
  on public.elective_mappings (elective_id, skill_id);

create index if not exists student_skills_student_skill_idx
  on public.student_skills (student_id, skill_id);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);
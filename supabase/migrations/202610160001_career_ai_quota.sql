-- Career Compass AI quotas.
-- Run after the existing Career Compass migrations.
-- The function is callable only by the Supabase service role.

create table if not exists public.career_ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  interview_requests integer not null default 0,
  resume_requests integer not null default 0,
  primary key (user_id, usage_date)
);

create table if not exists public.career_ai_project_usage_daily (
  usage_date date primary key,
  total_requests integer not null default 0
);

alter table public.career_ai_usage_daily enable row level security;
alter table public.career_ai_project_usage_daily enable row level security;

revoke all on public.career_ai_usage_daily from anon, authenticated;
revoke all on public.career_ai_project_usage_daily from anon, authenticated;

create or replace function public.consume_career_ai_quota(
  p_user_id uuid,
  p_kind text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_day date := (now() at time zone 'utc')::date;
  user_interview_count integer;
  user_resume_count integer;
  project_count integer;
begin
  if p_kind not in ('interview', 'resume') then
    raise exception 'Unsupported AI quota type';
  end if;

  insert into public.career_ai_usage_daily (user_id, usage_date)
  values (p_user_id, current_day)
  on conflict (user_id, usage_date) do nothing;

  insert into public.career_ai_project_usage_daily (usage_date)
  values (current_day)
  on conflict (usage_date) do nothing;

  select interview_requests, resume_requests
  into user_interview_count, user_resume_count
  from public.career_ai_usage_daily
  where user_id = p_user_id and usage_date = current_day
  for update;

  select total_requests
  into project_count
  from public.career_ai_project_usage_daily
  where usage_date = current_day
  for update;

  if project_count >= 300 then
    return false;
  end if;

  if p_kind = 'interview' and user_interview_count >= 30 then
    return false;
  end if;

  if p_kind = 'resume' and user_resume_count >= 3 then
    return false;
  end if;

  if p_kind = 'interview' then
    update public.career_ai_usage_daily
    set interview_requests = interview_requests + 1
    where user_id = p_user_id and usage_date = current_day;
  else
    update public.career_ai_usage_daily
    set resume_requests = resume_requests + 1
    where user_id = p_user_id and usage_date = current_day;
  end if;

  update public.career_ai_project_usage_daily
  set total_requests = total_requests + 1
  where usage_date = current_day;

  return true;
end;
$$;

revoke all on function public.consume_career_ai_quota(uuid, text)
from public, anon, authenticated;

grant execute on function public.consume_career_ai_quota(uuid, text)
to service_role;

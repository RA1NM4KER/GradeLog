create table if not exists public.course_templates (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  public_token text not null unique default gen_random_uuid()::text,
  content_hash text not null unique,
  title text not null,
  course_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_shared_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index if not exists course_templates_public_token_idx
  on public.course_templates (public_token);

create index if not exists course_templates_content_hash_idx
  on public.course_templates (content_hash);

alter table public.course_templates enable row level security;

revoke all on public.course_templates from anon, authenticated;

create or replace function public.share_course_template(
  template_payload jsonb,
  template_title text,
  template_hash text
)
returns table (
  public_token text,
  title text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  shared_row public.course_templates%rowtype;
begin
  if template_payload is null or template_hash is null or length(trim(template_hash)) = 0 then
    raise exception 'Template payload and hash are required.';
  end if;

  insert into public.course_templates (
    owner_user_id,
    content_hash,
    title,
    course_payload,
    updated_at,
    last_shared_at,
    is_active
  )
  values (
    auth.uid(),
    template_hash,
    coalesce(nullif(trim(template_title), ''), 'Course template'),
    template_payload,
    now(),
    now(),
    true
  )
  on conflict (content_hash) do update
    set title = excluded.title,
        course_payload = excluded.course_payload,
        updated_at = now(),
        last_shared_at = now(),
        is_active = true
  returning * into shared_row;

  return query
  select
    shared_row.public_token,
    shared_row.title,
    shared_row.created_at,
    shared_row.updated_at;
end;
$$;

create or replace function public.get_course_template_by_token(
  template_token text
)
returns table (
  public_token text,
  title text,
  course_payload jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    course_templates.public_token,
    course_templates.title,
    course_templates.course_payload,
    course_templates.created_at,
    course_templates.updated_at
  from public.course_templates
  where course_templates.public_token = template_token
    and course_templates.is_active = true
  limit 1;
$$;

grant execute on function public.share_course_template(jsonb, text, text) to anon, authenticated;
grant execute on function public.get_course_template_by_token(text) to anon, authenticated;

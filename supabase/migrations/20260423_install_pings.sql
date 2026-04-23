create table if not exists public.install_pings (
  install_id uuid primary key,
  platform text not null,
  first_seen_at timestamptz not null default now()
);

alter table public.install_pings enable row level security;

revoke all on public.install_pings from anon, authenticated;

create or replace function public.record_install_ping(
  p_install_id uuid,
  p_platform text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.install_pings (install_id, platform)
  values (p_install_id, p_platform)
  on conflict (install_id) do nothing;
end;
$$;

grant execute on function public.record_install_ping(uuid, text) to anon, authenticated;

create table if not exists public.producer_units (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  producer_id uuid not null references public.producers(id) on delete cascade,
  name text not null,
  description text null,
  location text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint producer_units_producer_id_name_key unique (producer_id, name)
);

create index if not exists producer_units_company_id_idx on public.producer_units(company_id);
create index if not exists producer_units_producer_id_idx on public.producer_units(producer_id);
create index if not exists producer_units_is_active_idx on public.producer_units(is_active);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    (select p.role::text from public.profiles p where p.id = auth.uid())
  );
$$;

create or replace function public.current_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'companyId', '')::uuid,
    nullif(auth.jwt() -> 'app_metadata' ->> 'company_id', '')::uuid,
    (select p.company_id from public.profiles p where p.id = auth.uid())
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists producer_units_set_updated_at on public.producer_units;
create trigger producer_units_set_updated_at
before update on public.producer_units
for each row
execute function public.set_updated_at();

insert into public.producer_units (company_id, producer_id, name, location, is_active)
select p.company_id, p.id, trim(p.property), trim(p.property), true
from public.producers p
where nullif(trim(p.property), '') is not null
on conflict (producer_id, name) do nothing;

alter table public.producer_units enable row level security;

drop policy if exists "producer_units_select" on public.producer_units;
drop policy if exists "producer_units_insert" on public.producer_units;
drop policy if exists "producer_units_update" on public.producer_units;
drop policy if exists "producer_units_delete" on public.producer_units;

create policy "producer_units_select"
on public.producer_units
for select
using (
  public.current_user_role() = 'maestro'
  or (
    public.current_user_role() in ('admin', 'collaborator')
    and company_id = public.current_user_company_id()
  )
  or (
    public.current_user_role() = 'producer'
    and producer_id = auth.uid()
  )
);

create policy "producer_units_insert"
on public.producer_units
for insert
with check (
  (
    public.current_user_role() = 'maestro'
    and exists (
      select 1
      from public.producers p
      where p.id = producer_id
        and p.company_id = company_id
    )
  )
  or (
    public.current_user_role() in ('admin', 'collaborator')
    and company_id = public.current_user_company_id()
    and exists (
      select 1
      from public.producers p
      where p.id = producer_id
        and p.company_id = company_id
    )
  )
  or (
    public.current_user_role() = 'producer'
    and producer_id = auth.uid()
    and company_id = public.current_user_company_id()
    and exists (
      select 1
      from public.producers p
      where p.id = auth.uid()
        and p.company_id = company_id
    )
  )
);

create policy "producer_units_update"
on public.producer_units
for update
using (
  public.current_user_role() = 'maestro'
  or (
    public.current_user_role() in ('admin', 'collaborator')
    and company_id = public.current_user_company_id()
  )
  or (
    public.current_user_role() = 'producer'
    and producer_id = auth.uid()
  )
)
with check (
  (
    public.current_user_role() = 'maestro'
    and exists (
      select 1
      from public.producers p
      where p.id = producer_id
        and p.company_id = company_id
    )
  )
  or (
    public.current_user_role() in ('admin', 'collaborator')
    and company_id = public.current_user_company_id()
    and exists (
      select 1
      from public.producers p
      where p.id = producer_id
        and p.company_id = company_id
    )
  )
  or (
    public.current_user_role() = 'producer'
    and producer_id = auth.uid()
    and company_id = public.current_user_company_id()
    and exists (
      select 1
      from public.producers p
      where p.id = auth.uid()
        and p.company_id = company_id
    )
  )
);

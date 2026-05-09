create or replace function public.producer_belongs_to_company(
  target_producer_id uuid,
  target_company_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.producers p
    where p.id = target_producer_id
      and p.company_id = target_company_id
  );
$$;

revoke all on function public.producer_belongs_to_company(uuid, uuid) from public;
grant execute on function public.producer_belongs_to_company(uuid, uuid) to authenticated;

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
    and public.producer_belongs_to_company(producer_id, company_id)
  )
  or (
    public.current_user_role() in ('admin', 'collaborator')
    and company_id = public.current_user_company_id()
    and public.producer_belongs_to_company(producer_id, company_id)
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
)
with check (
  (
    public.current_user_role() = 'maestro'
    and public.producer_belongs_to_company(producer_id, company_id)
  )
  or (
    public.current_user_role() in ('admin', 'collaborator')
    and company_id = public.current_user_company_id()
    and public.producer_belongs_to_company(producer_id, company_id)
  )
);

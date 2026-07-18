create schema if not exists private;

revoke all privileges on schema private from public;
revoke all privileges on schema private from anon;
revoke all privileges on schema private from authenticated;

create table private.local_model_governance_roles (
  role_id text primary key,
  role_revision integer not null,
  constraint local_model_governance_roles_role_id_not_empty check (char_length(role_id) > 0),
  constraint local_model_governance_roles_role_id_trimmed check (role_id = btrim(role_id)),
  constraint local_model_governance_roles_revision_positive check (role_revision > 0)
);

create table private.local_model_governance_permissions (
  permission_id text primary key,
  permission_revision integer not null,
  constraint local_model_governance_permissions_permission_id_not_empty check (char_length(permission_id) > 0),
  constraint local_model_governance_permissions_permission_id_trimmed check (permission_id = btrim(permission_id)),
  constraint local_model_governance_permissions_revision_positive check (permission_revision > 0)
);

create table private.local_model_governance_role_permissions (
  role_id text not null references private.local_model_governance_roles(role_id),
  permission_id text not null references private.local_model_governance_permissions(permission_id),
  mapping_revision integer not null,
  primary key (role_id, permission_id),
  constraint local_model_governance_role_permissions_revision_positive check (mapping_revision > 0)
);

create table private.local_model_governance_user_roles (
  user_id uuid not null references auth.users(id),
  role_id text not null references private.local_model_governance_roles(role_id),
  assignment_revision integer not null,
  primary key (user_id, role_id),
  constraint local_model_governance_user_roles_revision_positive check (assignment_revision > 0)
);

alter table private.local_model_governance_roles enable row level security;
alter table private.local_model_governance_roles force row level security;
alter table private.local_model_governance_permissions enable row level security;
alter table private.local_model_governance_permissions force row level security;
alter table private.local_model_governance_role_permissions enable row level security;
alter table private.local_model_governance_role_permissions force row level security;
alter table private.local_model_governance_user_roles enable row level security;
alter table private.local_model_governance_user_roles force row level security;

revoke all privileges on table
  private.local_model_governance_roles,
  private.local_model_governance_permissions,
  private.local_model_governance_role_permissions,
  private.local_model_governance_user_roles
from public;
revoke all privileges on table
  private.local_model_governance_roles,
  private.local_model_governance_permissions,
  private.local_model_governance_role_permissions,
  private.local_model_governance_user_roles
from anon;
revoke all privileges on table
  private.local_model_governance_roles,
  private.local_model_governance_permissions,
  private.local_model_governance_role_permissions,
  private.local_model_governance_user_roles
from authenticated;

insert into private.local_model_governance_roles (role_id, role_revision)
values ('model-governance-reviewer', 1);
insert into private.local_model_governance_permissions (permission_id, permission_revision)
values ('record-model-governance-decision', 1);
insert into private.local_model_governance_role_permissions (role_id, permission_id, mapping_revision)
values ('model-governance-reviewer', 'record-model-governance-decision', 1);

create or replace function private.has_local_model_governance_permission()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then false
    else exists (
      select 1
      from private.local_model_governance_user_roles as ur
      inner join private.local_model_governance_role_permissions as rp
        on rp.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.role_id = 'model-governance-reviewer'
        and rp.permission_id = 'record-model-governance-decision'
    )
  end;
$$;

revoke execute on function private.has_local_model_governance_permission() from public;
revoke execute on function private.has_local_model_governance_permission() from anon;
revoke execute on function private.has_local_model_governance_permission() from authenticated;
grant usage on schema private to authenticated;
grant execute on function private.has_local_model_governance_permission() to authenticated;

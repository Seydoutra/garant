-- GARANT V3. Additive initial schema; never run against an unrelated project.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table private.platform_admins (
 user_id uuid primary key references auth.users(id), created_at timestamptz not null default now()
);
create table private.application_sessions (
 session_id uuid primary key references auth.sessions(id), user_id uuid not null references auth.users(id),
 last_seen_at timestamptz not null default now(), ended_at timestamptz,
 created_at timestamptz not null default now()
);
create index application_sessions_user_idx on private.application_sessions(user_id);
alter table private.platform_admins enable row level security;
alter table private.application_sessions enable row level security;

create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 180),
 acronym text not null default '' check(length(acronym)<=30), category text not null check(category in ('public','private','association','other')),
 country text not null default 'GN' check(country ~ '^[A-Z]{2}$'), city text not null check(length(city) between 1 and 120),
 status text not null default 'active' check(status in ('active','suspended')), created_at timestamptz not null default now()
);
create table public.organization_units (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 name text not null, unique(organization_id,id), unique(organization_id,name)
);
create table public.user_profiles (
 user_id uuid primary key references auth.users(id), display_name text not null check(length(display_name) between 1 and 160)
);
create table public.roles (id text primary key);
create table public.permissions (id text primary key);
create table public.role_permissions (
 role_id text references public.roles(id), permission_id text references public.permissions(id), primary key(role_id,permission_id)
);
create index role_permissions_permission_idx on public.role_permissions(permission_id);
insert into public.roles values ('organization_admin'),('approver'),('issuer'),('reader');
insert into public.permissions values ('organization.manage'),('members.manage'),('types.manage'),('documents.read'),('documents.prepare'),('documents.approve'),('documents.issue'),('documents.revoke'),('audit.read');
insert into public.role_permissions select 'organization_admin',id from public.permissions;
insert into public.role_permissions values
 ('approver','documents.read'),('approver','documents.approve'),('issuer','documents.read'),('issuer','documents.prepare'),('issuer','documents.issue'),('reader','documents.read');
create table public.memberships (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 user_id uuid not null references auth.users(id), role_id text not null references public.roles(id),
 unit_id uuid, active boolean not null default true, created_at timestamptz not null default now(),
 foreign key(organization_id,unit_id) references public.organization_units(organization_id,id), unique(organization_id,user_id)
);
create index memberships_user_org_idx on public.memberships(user_id,organization_id) where active;
create index memberships_role_idx on public.memberships(role_id);
create index memberships_unit_idx on public.memberships(organization_id,unit_id);
create table public.document_types (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 code text not null check(code ~ '^[a-z][a-z0-9_-]{1,60}$'), name text not null check(length(name) between 2 and 180),
 unique(organization_id,id), unique(organization_id,code)
);
create table public.document_type_versions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, document_type_id uuid not null,
 version integer not null check(version>0), schema jsonb not null check(jsonb_typeof(schema)='object'),
 confidentiality text not null check(confidentiality in ('private','public_summary')),
 photo_required boolean not null default false, approval_required boolean not null default true,
 created_at timestamptz not null default now(), unique(organization_id,id), unique(document_type_id,version),
 foreign key(organization_id,document_type_id) references public.document_types(organization_id,id)
);
create index document_type_versions_org_type_idx on public.document_type_versions(organization_id,document_type_id);
create table public.user_delegations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), user_id uuid not null references auth.users(id),
 document_type_id uuid not null, valid_from timestamptz not null, valid_until timestamptz not null,
 can_issue boolean not null default false, can_approve boolean not null default false, check(valid_until>valid_from),
 foreign key(organization_id,document_type_id) references public.document_types(organization_id,id)
);
create index user_delegations_lookup_idx on public.user_delegations(user_id,organization_id,document_type_id,valid_until);
create index user_delegations_type_idx on public.user_delegations(organization_id,document_type_id);
create table public.documents (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 document_type_id uuid not null, reference text not null check(length(reference) between 1 and 160),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 unique(organization_id,id), unique(organization_id,reference),
 foreign key(organization_id,document_type_id) references public.document_types(organization_id,id)
);
create index documents_type_idx on public.documents(organization_id,document_type_id);
create index documents_creator_idx on public.documents(created_by);
create table public.document_versions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, document_id uuid not null,
 type_version_id uuid not null, version integer not null check(version>0), content jsonb not null check(jsonb_typeof(content)='object'),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 state text not null default 'draft' check(state in ('draft','approved','issued','revoked','replaced')),
 created_at timestamptz not null default now(), unique(organization_id,id), unique(document_id,version),
 foreign key(organization_id,document_id) references public.documents(organization_id,id),
 foreign key(organization_id,type_version_id) references public.document_type_versions(organization_id,id)
);
create index document_versions_org_document_idx on public.document_versions(organization_id,document_id);
create index document_versions_type_idx on public.document_versions(organization_id,type_version_id);
create table public.document_approvals (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, version_id uuid not null,
 approver_id uuid not null references auth.users(id), content_hash text not null, created_at timestamptz not null default now(),
 foreign key(organization_id,version_id) references public.document_versions(organization_id,id), unique(version_id,approver_id)
);
create index document_approvals_org_idx on public.document_approvals(organization_id,version_id);
create index document_approvals_approver_idx on public.document_approvals(approver_id);
create table public.document_attachments (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, version_id uuid not null,
 bucket_id text not null check(bucket_id in ('document-attachments','holder-photos')), object_path text not null,
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'), mime_type text not null, size_bytes bigint not null check(size_bytes between 1 and 10485760),
 foreign key(organization_id,version_id) references public.document_versions(organization_id,id), unique(bucket_id,object_path)
);
create index document_attachments_version_idx on public.document_attachments(organization_id,version_id);
create table public.issuance_requests (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, version_id uuid not null,
 idempotency_key uuid not null, state text not null check(state in ('pending','processing','failed','complete')),
 created_at timestamptz not null default now(), foreign key(organization_id,version_id) references public.document_versions(organization_id,id),
 unique(organization_id,idempotency_key), unique(version_id)
);
create index issuance_requests_version_idx on public.issuance_requests(organization_id,version_id);
create table public.issuer_keys (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 public_key_hex text not null check(public_key_hex ~ '^[a-f0-9]{64}$'), key_id text not null unique,
 valid_from timestamptz not null, valid_until timestamptz not null, check(valid_until>valid_from), unique(organization_id,id)
);
create index issuer_keys_org_idx on public.issuer_keys(organization_id);
create table public.document_seals (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, version_id uuid not null,
 issuer_key_id uuid not null, format text not null check(format='GRT1-V3'), payload text not null,
 foreign key(organization_id,version_id) references public.document_versions(organization_id,id),
 foreign key(organization_id,issuer_key_id) references public.issuer_keys(organization_id,id), unique(version_id)
);
create index document_seals_version_idx on public.document_seals(organization_id,version_id);
create index document_seals_key_idx on public.document_seals(organization_id,issuer_key_id);
create table public.document_signatures (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, version_id uuid not null,
 pdf_sha256 text not null check(pdf_sha256 ~ '^[a-f0-9]{64}$'), object_path text not null unique,
 profile text not null check(profile='PAdES-B-B'), independently_validated boolean not null check(independently_validated),
 validator_report_sha256 text not null check(validator_report_sha256 ~ '^[a-f0-9]{64}$'),
 foreign key(organization_id,version_id) references public.document_versions(organization_id,id), unique(version_id)
);
create index document_signatures_version_idx on public.document_signatures(organization_id,version_id);
create table public.document_status_events (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, version_id uuid not null,
 kind text not null check(kind in ('issued','revoked','replaced')), reason text not null check(length(reason) between 3 and 1000),
 actor_id uuid not null references auth.users(id), created_at timestamptz not null default now(),
 foreign key(organization_id,version_id) references public.document_versions(organization_id,id)
);
create index document_status_events_version_idx on public.document_status_events(organization_id,version_id,created_at);
create index document_status_events_actor_idx on public.document_status_events(actor_id);
create table public.audit_logs (
 id bigint generated always as identity primary key, organization_id uuid references public.organizations(id),
 actor_id uuid references auth.users(id), action text not null, resource_id uuid, created_at timestamptz not null default now()
);
create index audit_logs_org_time_idx on public.audit_logs(organization_id,created_at);
create index audit_logs_actor_idx on public.audit_logs(actor_id);

-- Only this private boundary reads authorization tables with owner privileges.
-- No editable user metadata, no organization role in JWT, no client-selected identity.
create function private.session_active() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists (
 select 1 from private.application_sessions s join auth.sessions a on a.id=s.session_id and a.user_id=s.user_id
 where s.user_id=auth.uid() and s.session_id=nullif(auth.jwt()->>'session_id','')::uuid
 and s.ended_at is null and s.last_seen_at>now()-interval '30 minutes')
$$;
create function private.mfa_recent() returns boolean language sql stable security invoker set search_path='' as $$
 select auth.jwt()->>'aal'='aal2' and exists (
 select 1 from jsonb_array_elements(coalesce(auth.jwt()->'amr','[]')) a
 where a->>'method'='totp' and (a->>'timestamp')::numeric between extract(epoch from now()-interval '5 minutes') and extract(epoch from now())+30)
$$;
create function private.is_platform_admin() returns boolean language sql stable security definer set search_path='' as $$
 select private.session_active() and exists(select 1 from private.platform_admins where user_id=auth.uid())
$$;
create function private.has_permission(org uuid, perm text) returns boolean language sql stable security definer set search_path='' as $$
 select private.session_active() and auth.jwt()->>'aal'='aal2' and exists(select 1 from public.organizations o where o.id=org and o.status='active') and (
 private.is_platform_admin() or exists(select 1 from public.memberships m join public.role_permissions p on p.role_id=m.role_id
 where m.user_id=auth.uid() and m.organization_id=org and m.active and p.permission_id=perm))
$$;
create function private.require_permission(org uuid, perm text) returns void language plpgsql security invoker set search_path='' as $$
 begin
 if not private.has_permission(org,perm) or not private.mfa_recent() then raise exception 'Accès refusé ou authentification TOTP récente requise' using errcode='42501'; end if;
 end $$;
create function public.touch_session() returns boolean language plpgsql security definer set search_path='' as $$
 declare sid uuid:=nullif(auth.jwt()->>'session_id','')::uuid; begin
 if auth.uid() is null or sid is null or not exists(select 1 from auth.sessions where id=sid and user_id=auth.uid()) then return false; end if;
 insert into private.application_sessions(session_id,user_id) values(sid,auth.uid()) on conflict do nothing;
 update private.application_sessions set last_seen_at=now() where session_id=sid and user_id=auth.uid() and ended_at is null and last_seen_at>now()-interval '30 minutes';
 return found;
 end $$;
create function public.end_session() returns void language sql security definer set search_path='' as $$
 update private.application_sessions set ended_at=now() where session_id=nullif(auth.jwt()->>'session_id','')::uuid and user_id=auth.uid()
$$;
create function private.audit(org uuid, act text, resource uuid) returns void language sql security invoker set search_path='' as $$
 insert into public.audit_logs(organization_id,actor_id,action,resource_id) values(org,auth.uid(),act,resource)
$$;

create function public.create_organization(p_name text,p_acronym text,p_category text,p_country text,p_city text) returns uuid language plpgsql security definer set search_path='' as $$
 declare oid uuid; begin
 if not private.is_platform_admin() or not private.mfa_recent() then raise exception 'Administrateur GARANT et TOTP récent requis' using errcode='42501'; end if;
 insert into public.organizations(name,acronym,category,country,city) values(p_name,p_acronym,p_category,p_country,p_city) returning id into oid;
 insert into public.memberships(organization_id,user_id,role_id) values(oid,auth.uid(),'organization_admin');
 perform private.audit(oid,'organization.created',oid); return oid;
 end $$;
create function public.grant_membership(p_org uuid,p_user uuid,p_role text,p_unit uuid default null) returns void language plpgsql security definer set search_path='' as $$
 begin perform private.require_permission(p_org,'members.manage');
 insert into public.memberships(organization_id,user_id,role_id,unit_id) values(p_org,p_user,p_role,p_unit)
 on conflict(organization_id,user_id) do update set role_id=excluded.role_id,unit_id=excluded.unit_id,active=true;
 perform private.audit(p_org,'membership.granted',p_user); end $$;
create function public.create_document_type(p_org uuid,p_code text,p_name text,p_schema jsonb,p_confidentiality text default 'private') returns uuid language plpgsql security definer set search_path='' as $$
 declare tid uuid; field record; begin perform private.require_permission(p_org,'types.manage');
 if jsonb_typeof(p_schema->'fields') is distinct from 'object' or (select count(*) from jsonb_each(p_schema->'fields')) not between 1 and 30 then raise exception 'Schéma invalide'; end if;
 for field in select * from jsonb_each(p_schema->'fields') loop
 if field.key !~ '^[a-z][a-zA-Z0-9_]{0,59}$' or field.value->>'type' is distinct from 'string' or jsonb_typeof(field.value->'required') is distinct from 'boolean' then raise exception 'Champ de schéma invalide'; end if;
 end loop;
 insert into public.document_types(organization_id,code,name) values(p_org,p_code,p_name) returning id into tid;
 insert into public.document_type_versions(organization_id,document_type_id,version,schema,confidentiality) values(p_org,tid,1,p_schema,p_confidentiality);
 perform private.audit(p_org,'document_type.created',tid); return tid; end $$;
create function private.validate_content(s jsonb,c jsonb) returns void language plpgsql security invoker set search_path='' as $$
 declare f record; begin
 if jsonb_typeof(c) is distinct from 'object' then raise exception 'Contenu objet requis'; end if;
 if exists(select 1 from jsonb_object_keys(c) k where not(s->'fields' ? k)) then raise exception 'Champ non autorisé'; end if;
 for f in select * from jsonb_each(s->'fields') loop
 if (coalesce((f.value->>'required')::boolean,false) and (not c ? f.key or length(trim(c->>f.key))=0)) or (c ? f.key and (jsonb_typeof(c->f.key)<>'string' or length(c->>f.key)>5000)) then raise exception 'Champ invalide : %', f.key; end if;
 end loop; end $$;
create function public.create_draft(p_org uuid,p_type_version uuid,p_reference text,p_content jsonb) returns uuid language plpgsql security definer set search_path='' as $$
 declare tv public.document_type_versions; did uuid; vid uuid; begin
 perform private.require_permission(p_org,'documents.prepare');
 select * into strict tv from public.document_type_versions where id=p_type_version and organization_id=p_org;
 perform private.validate_content(tv.schema,p_content);
 insert into public.documents(organization_id,document_type_id,reference,created_by) values(p_org,tv.document_type_id,p_reference,auth.uid()) returning id into did;
 insert into public.document_versions(organization_id,document_id,type_version_id,version,content,content_hash)
 values(p_org,did,p_type_version,1,p_content,encode(sha256(convert_to(p_content::text,'UTF8')),'hex')) returning id into vid;
 perform private.audit(p_org,'document.draft_created',vid); return vid; end $$;
create function public.revise_draft(p_org uuid,p_version uuid,p_content jsonb) returns uuid language plpgsql security definer set search_path='' as $$
 declare v public.document_versions; s jsonb; vid uuid; begin
 perform private.require_permission(p_org,'documents.prepare');
 select * into strict v from public.document_versions where id=p_version and organization_id=p_org for update;
 if v.state not in ('draft','approved') then raise exception 'Version finalisée immuable'; end if;
 -- A new version invalidates approvals of the old content without erasing history.
 if exists(select 1 from public.document_versions where document_id=v.document_id and version>v.version) then raise exception 'Version dépassée'; end if;
 select schema into strict s from public.document_type_versions where id=v.type_version_id;
 perform private.validate_content(s,p_content);
 insert into public.document_versions(organization_id,document_id,type_version_id,version,content,content_hash)
 values(p_org,v.document_id,v.type_version_id,v.version+1,p_content,encode(sha256(convert_to(p_content::text,'UTF8')),'hex')) returning id into vid;
 perform private.audit(p_org,'document.revised',vid); return vid; end $$;
create function public.approve_document(p_org uuid,p_version uuid,p_expected_hash text) returns void language plpgsql security definer set search_path='' as $$
 declare v public.document_versions; tid uuid; begin
 perform private.require_permission(p_org,'documents.approve');
 select * into strict v from public.document_versions where id=p_version and organization_id=p_org for update;
 if v.state<>'draft' or v.content_hash<>p_expected_hash or exists(select 1 from public.document_versions where document_id=v.document_id and version>v.version) then raise exception 'Version modifiée, dépassée ou non brouillon'; end if;
 select document_type_id into tid from public.documents where id=v.document_id;
 if not exists(select 1 from public.user_delegations where organization_id=p_org and user_id=auth.uid() and document_type_id=tid and can_approve and now() between valid_from and valid_until) then raise exception 'Délégation approbateur requise' using errcode='42501'; end if;
 if exists(select 1 from public.documents where id=v.document_id and created_by=auth.uid()) then raise exception 'Un approbateur distinct est requis' using errcode='42501'; end if;
 insert into public.document_approvals(organization_id,version_id,approver_id,content_hash) values(p_org,p_version,auth.uid(),v.content_hash);
 update public.document_versions set state='approved' where id=p_version;
 perform private.audit(p_org,'document.approved',p_version); end $$;
create function public.grant_delegation(p_org uuid,p_user uuid,p_type uuid,p_until timestamptz,p_approve boolean,p_issue boolean) returns uuid language plpgsql security definer set search_path='' as $$
 declare did uuid; begin perform private.require_permission(p_org,'members.manage');
 if not exists(select 1 from public.memberships where organization_id=p_org and user_id=p_user and active) then raise exception 'Membre actif requis'; end if;
 insert into public.user_delegations(organization_id,user_id,document_type_id,valid_from,valid_until,can_approve,can_issue)
 values(p_org,p_user,p_type,now(),p_until,p_approve,p_issue) returning id into did;
 perform private.audit(p_org,'delegation.granted',did); return did; end $$;

-- Fail closed: no client or browser may manufacture an issued document.
-- Issuance worker and independently validated PAdES provider are a later migration.
create function private.guard_version() returns trigger language plpgsql security invoker set search_path='' as $$
 begin
 if old.state in ('issued','revoked','replaced') then
 if new.content is distinct from old.content or new.content_hash<>old.content_hash or new.document_id<>old.document_id or new.organization_id<>old.organization_id or new.type_version_id<>old.type_version_id or new.version<>old.version then raise exception 'Version finalisée immuable'; end if;
 if old.state in ('revoked','replaced') and new.state<>old.state then raise exception 'Statut terminal'; end if;
 end if;
 if new.state='issued' and old.state<>'issued' then raise exception 'Pipeline de signature PAdES indépendant non activé'; end if;
 return new; end $$;
create trigger immutable_version before update on public.document_versions for each row execute function private.guard_version();
create function private.deny_mutation() returns trigger language plpgsql security invoker set search_path='' as $$
 begin raise exception 'Historique immuable'; end $$;
create trigger approval_immutable before update or delete on public.document_approvals for each row execute function private.deny_mutation();
create trigger audit_immutable before update or delete on public.audit_logs for each row execute function private.deny_mutation();
create trigger event_immutable before update or delete on public.document_status_events for each row execute function private.deny_mutation();
create trigger type_version_immutable before update or delete on public.document_type_versions for each row execute function private.deny_mutation();

-- No client writes to business tables. All writes go through narrow, authorized RPCs.
-- Unit scope: null membership unit grants organization-wide scope.
alter table public.documents add column unit_id uuid;
alter table public.documents add foreign key(organization_id,unit_id) references public.organization_units(organization_id,id);
create index documents_unit_idx on public.documents(organization_id,unit_id);
create function private.document_access(org uuid,doc uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.has_permission(org,'documents.read') and (private.is_platform_admin() or exists(
 select 1 from public.documents d join public.memberships m on m.organization_id=d.organization_id
 where d.id=doc and d.organization_id=org and m.user_id=auth.uid() and m.active and (m.unit_id is null or m.unit_id=d.unit_id)))
$$;
create function private.assign_document_unit() returns trigger language plpgsql security invoker set search_path='' as $$
 begin select unit_id into new.unit_id from public.memberships where organization_id=new.organization_id and user_id=new.created_by and active; return new; end $$;
create trigger assign_unit before insert on public.documents for each row execute function private.assign_document_unit();
-- Scope enforced in write RPCs too, not only SELECT policies.
create function private.guard_document_scope() returns trigger language plpgsql security invoker set search_path='' as $$
 begin
 if auth.uid() is not null and not private.document_access(new.organization_id,new.document_id) then raise exception 'Service non autorisé' using errcode='42501'; end if;
 return new; end $$;
create trigger version_unit_scope before insert or update on public.document_versions for each row execute function private.guard_document_scope();
-- Direct approval insert cannot target another service through the definer boundary.
create function private.guard_approval_scope() returns trigger language plpgsql security invoker set search_path='' as $$
 declare did uuid; begin
 select document_id into strict did from public.document_versions where id=new.version_id and organization_id=new.organization_id;
 if not private.document_access(new.organization_id,did) then raise exception 'Service non autorisé' using errcode='42501'; end if; return new; end $$;
create trigger approval_unit_scope before insert on public.document_approvals for each row execute function private.guard_approval_scope();
alter table public.organizations enable row level security;
revoke all on public.organizations from public,anon,authenticated;
grant select on public.organizations to authenticated;
create policy read_authorized on public.organizations for select to authenticated using (private.has_permission(id,'documents.read'));
alter table public.organization_units enable row level security;
revoke all on public.organization_units from public,anon,authenticated;
grant select on public.organization_units to authenticated;
create policy read_authorized on public.organization_units for select to authenticated using (private.has_permission(organization_id,'documents.read'));
alter table public.user_profiles enable row level security;
revoke all on public.user_profiles from public,anon,authenticated;
grant select on public.user_profiles to authenticated;
create policy read_authorized on public.user_profiles for select to authenticated using (user_id=(select auth.uid()) and (select private.session_active()));
alter table public.roles enable row level security;
revoke all on public.roles from public,anon,authenticated;
grant select on public.roles to authenticated;
create policy read_authorized on public.roles for select to authenticated using ((select private.session_active()));
alter table public.permissions enable row level security;
revoke all on public.permissions from public,anon,authenticated;
grant select on public.permissions to authenticated;
create policy read_authorized on public.permissions for select to authenticated using ((select private.session_active()));
alter table public.role_permissions enable row level security;
revoke all on public.role_permissions from public,anon,authenticated;
grant select on public.role_permissions to authenticated;
create policy read_authorized on public.role_permissions for select to authenticated using ((select private.session_active()));
alter table public.memberships enable row level security;
revoke all on public.memberships from public,anon,authenticated;
grant select on public.memberships to authenticated;
create policy read_authorized on public.memberships for select to authenticated using (private.has_permission(organization_id,'documents.read') and (user_id=(select auth.uid()) or private.has_permission(organization_id,'members.manage')));
alter table public.document_types enable row level security;
revoke all on public.document_types from public,anon,authenticated;
grant select on public.document_types to authenticated;
create policy read_authorized on public.document_types for select to authenticated using (private.has_permission(organization_id,'documents.read'));
alter table public.document_type_versions enable row level security;
revoke all on public.document_type_versions from public,anon,authenticated;
grant select on public.document_type_versions to authenticated;
create policy read_authorized on public.document_type_versions for select to authenticated using (private.has_permission(organization_id,'documents.read'));
alter table public.user_delegations enable row level security;
revoke all on public.user_delegations from public,anon,authenticated;
grant select on public.user_delegations to authenticated;
create policy read_authorized on public.user_delegations for select to authenticated using (private.has_permission(organization_id,'documents.read') and (user_id=(select auth.uid()) or private.has_permission(organization_id,'members.manage')));
alter table public.documents enable row level security;
revoke all on public.documents from public,anon,authenticated;
grant select on public.documents to authenticated;
create policy read_authorized on public.documents for select to authenticated using (private.document_access(organization_id,id));
alter table public.document_versions enable row level security;
revoke all on public.document_versions from public,anon,authenticated;
grant select on public.document_versions to authenticated;
create policy read_authorized on public.document_versions for select to authenticated using (private.document_access(organization_id,document_id));
alter table public.document_approvals enable row level security;
revoke all on public.document_approvals from public,anon,authenticated;
grant select on public.document_approvals to authenticated;
create policy read_authorized on public.document_approvals for select to authenticated using (exists(select 1 from public.document_versions v where v.id=document_approvals.version_id and v.organization_id=document_approvals.organization_id));
alter table public.document_attachments enable row level security;
revoke all on public.document_attachments from public,anon,authenticated;
grant select on public.document_attachments to authenticated;
create policy read_authorized on public.document_attachments for select to authenticated using (exists(select 1 from public.document_versions v where v.id=document_attachments.version_id and v.organization_id=document_attachments.organization_id));
alter table public.issuance_requests enable row level security;
revoke all on public.issuance_requests from public,anon,authenticated;
grant select on public.issuance_requests to authenticated;
create policy read_authorized on public.issuance_requests for select to authenticated using (exists(select 1 from public.document_versions v where v.id=issuance_requests.version_id and v.organization_id=issuance_requests.organization_id));
alter table public.issuer_keys enable row level security;
revoke all on public.issuer_keys from public,anon,authenticated;
grant select on public.issuer_keys to authenticated;
create policy read_authorized on public.issuer_keys for select to authenticated using (private.has_permission(organization_id,'documents.read'));
alter table public.document_seals enable row level security;
revoke all on public.document_seals from public,anon,authenticated;
grant select on public.document_seals to authenticated;
create policy read_authorized on public.document_seals for select to authenticated using (exists(select 1 from public.document_versions v where v.id=document_seals.version_id and v.organization_id=document_seals.organization_id));
alter table public.document_signatures enable row level security;
revoke all on public.document_signatures from public,anon,authenticated;
grant select on public.document_signatures to authenticated;
create policy read_authorized on public.document_signatures for select to authenticated using (exists(select 1 from public.document_versions v where v.id=document_signatures.version_id and v.organization_id=document_signatures.organization_id));
alter table public.document_status_events enable row level security;
revoke all on public.document_status_events from public,anon,authenticated;
grant select on public.document_status_events to authenticated;
create policy read_authorized on public.document_status_events for select to authenticated using (exists(select 1 from public.document_versions v where v.id=document_status_events.version_id and v.organization_id=document_status_events.organization_id));
alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from public,anon,authenticated;
grant select on public.audit_logs to authenticated;
create policy read_authorized on public.audit_logs for select to authenticated using (private.has_permission(organization_id,'audit.read'));

-- Function EXECUTE defaults must be closed, including future functions.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;


grant execute on function public.touch_session() to authenticated;
grant execute on function public.end_session() to authenticated;
grant execute on function public.create_organization(text,text,text,text,text) to authenticated;
grant execute on function public.grant_membership(uuid,uuid,text,uuid) to authenticated;
grant execute on function public.create_document_type(uuid,text,text,jsonb,text) to authenticated;
grant execute on function public.create_draft(uuid,uuid,text,jsonb) to authenticated;
grant execute on function public.revise_draft(uuid,uuid,jsonb) to authenticated;
grant execute on function public.approve_document(uuid,uuid,text) to authenticated;
grant execute on function public.grant_delegation(uuid,uuid,uuid,timestamptz,boolean,boolean) to authenticated;
grant execute on function private.session_active(),private.has_permission(uuid,text),private.document_access(uuid,uuid) to authenticated;
create function public.my_access() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('platformAdmin',private.is_platform_admin(),'recentMfa',private.mfa_recent(),'active',private.session_active())
$$;
revoke all on function public.my_access() from public,anon;
grant execute on function public.my_access() to authenticated;

revoke all on function private.session_active() from public,anon;
revoke all on function private.mfa_recent() from public,anon;
revoke all on function private.mfa_recent() from authenticated;
revoke all on function private.is_platform_admin() from public,anon;
revoke all on function private.is_platform_admin() from authenticated;
revoke all on function private.has_permission(uuid,text) from public,anon;
revoke all on function private.require_permission(uuid,text) from public,anon;
revoke all on function private.require_permission(uuid,text) from authenticated;
revoke all on function public.touch_session() from public,anon;
revoke all on function public.end_session() from public,anon;
revoke all on function private.audit(uuid,text,uuid) from public,anon;
revoke all on function private.audit(uuid,text,uuid) from authenticated;
revoke all on function public.create_organization(text,text,text,text,text) from public,anon;
revoke all on function public.grant_membership(uuid,uuid,text,uuid) from public,anon;
revoke all on function public.create_document_type(uuid,text,text,jsonb,text) from public,anon;
revoke all on function private.validate_content(jsonb,jsonb) from public,anon;
revoke all on function private.validate_content(jsonb,jsonb) from authenticated;
revoke all on function public.create_draft(uuid,uuid,text,jsonb) from public,anon;
revoke all on function public.revise_draft(uuid,uuid,jsonb) from public,anon;
revoke all on function public.approve_document(uuid,uuid,text) from public,anon;
revoke all on function public.grant_delegation(uuid,uuid,uuid,timestamptz,boolean,boolean) from public,anon;
revoke all on function private.guard_version() from public,anon;
revoke all on function private.guard_version() from authenticated;
revoke all on function private.deny_mutation() from public,anon;
revoke all on function private.deny_mutation() from authenticated;
revoke all on function private.document_access(uuid,uuid) from public,anon;
revoke all on function private.assign_document_unit() from public,anon;
revoke all on function private.assign_document_unit() from authenticated;
revoke all on function private.guard_document_scope() from public,anon;
revoke all on function private.guard_document_scope() from authenticated;
revoke all on function private.guard_approval_scope() from public,anon;
revoke all on function private.guard_approval_scope() from authenticated;
revoke all on function public.my_access() from public,anon;
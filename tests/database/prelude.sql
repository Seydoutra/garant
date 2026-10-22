-- Isolated PostgreSQL harness only; NOT a Supabase migration or an Auth simulation claim.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key,email_confirmed_at timestamptz);
create table auth.sessions(id uuid primary key,user_id uuid not null references auth.users(id));
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
create function auth.uid() returns uuid language sql stable as $$select nullif(auth.jwt()->>'sub','')::uuid$$;
grant usage on schema public,auth,storage to authenticated,anon;
grant execute on function auth.jwt(),auth.uid() to authenticated,anon;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
alter table storage.objects enable row level security;
grant select on storage.objects to authenticated,anon;

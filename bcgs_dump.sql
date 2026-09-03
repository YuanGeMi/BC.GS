--
-- PostgreSQL database dump
--

\restrict XFeDYFZHqGrjKs1lpsMM5hZQCqaEvGat3c5I3DsyqcXqLw2YHjiuALMokF7HlNU

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
        set search_path to ''
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_prefix_len INT;
    v_prefix_start INT;
    v_combined_levels INT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_prefix_len := length(coalesce(prefix, ''));
    v_prefix_start := coalesce(array_length(string_to_array(coalesce(prefix, ''), v_delimiter), 1), 1);
    v_combined_levels := coalesce(array_length(string_to_array(v_prefix, v_delimiter), 1), 1);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT array_to_string(path_tokens[$1:$2], '/') AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $3 || '%%'
                  AND bucket_id = $4
                  AND array_length(objects.path_tokens, 1) <> $2
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT array_to_string(path_tokens[$1:$2], '/') AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $3 || '%%'
               AND bucket_id = $4
               AND array_length(objects.path_tokens, 1) = $2
             ORDER BY %I %s)
            LIMIT $5 OFFSET $6
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING v_prefix_start, v_combined_levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := substring(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter) from v_prefix_len + 1);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := substring(v_current.name from v_prefix_len + 1);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
    v_sort_order text;
    v_sort_column text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    -- Defense-in-depth: this function is independently reachable and must
    -- not trust p_sort_order/p_sort_column to already be validated by a
    -- caller. Normalize to the same strict allow-list storage.search_v2
    -- uses before interpolating anything into dynamic SQL below.
    v_sort_order := lower(coalesce(p_sort_order, 'asc'));
    IF v_sort_order NOT IN ('asc', 'desc') THEN
        v_sort_order := 'asc';
    END IF;

    v_sort_column := lower(coalesce(p_sort_column, 'updated_at'));
    IF v_sort_column NOT IN ('updated_at', 'created_at') THEN
        v_sort_column := 'updated_at';
    END IF;

    IF v_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        v_sort_column,
        v_cursor_op,
        v_sort_column,
        v_sort_order,
        v_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: AffiliateClick; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AffiliateClick" (
    id text NOT NULL,
    "casinoId" text NOT NULL,
    "bonusId" text,
    locale text NOT NULL,
    referrer text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Bonus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Bonus" (
    id text NOT NULL,
    "casinoId" text NOT NULL,
    type text NOT NULL,
    amount text,
    "wageringRequirement" text,
    "minDeposit" double precision,
    code text,
    "expiryDate" timestamp(3) without time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BonusTranslation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BonusTranslation" (
    id text NOT NULL,
    "bonusId" text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    terms text NOT NULL
);


--
-- Name: Casino; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Casino" (
    id text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text,
    "establishedYear" integer,
    "minDeposit" double precision,
    "paymentMethods" text[],
    "gameProviders" text[],
    "overallRating" double precision,
    "ratingBonuses" double precision,
    "ratingGames" double precision,
    "ratingSupport" double precision,
    "ratingPayout" double precision,
    "ratingTrust" double precision,
    "affiliateLink" text,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "payoutSpeedId" text
);


--
-- Name: CasinoCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CasinoCategory" (
    "casinoId" text NOT NULL,
    "categoryId" text NOT NULL,
    rank integer
);


--
-- Name: CasinoCategoryNote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CasinoCategoryNote" (
    id text NOT NULL,
    "casinoId" text NOT NULL,
    "categoryId" text NOT NULL,
    locale text NOT NULL,
    "editorialNote" text NOT NULL
);


--
-- Name: CasinoLicense; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CasinoLicense" (
    "casinoId" text NOT NULL,
    "licenseId" text NOT NULL,
    "licenseNumber" text,
    verified boolean DEFAULT false NOT NULL,
    "verificationUrl" text
);


--
-- Name: CasinoMarket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CasinoMarket" (
    "casinoId" text NOT NULL,
    "marketId" text NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    "affiliateLink" text
);


--
-- Name: CasinoTranslation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CasinoTranslation" (
    id text NOT NULL,
    "casinoId" text NOT NULL,
    locale text NOT NULL,
    name text NOT NULL,
    "reviewBody" text NOT NULL,
    pros text[],
    cons text[],
    "seoTitle" text,
    "seoDescription" text
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    slug text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CategoryTranslation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CategoryTranslation" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    locale text NOT NULL,
    name text NOT NULL,
    description text,
    "seoTitle" text,
    "seoDescription" text,
    methodology text
);


--
-- Name: License; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."License" (
    id text NOT NULL,
    slug text NOT NULL
);


--
-- Name: LicenseTranslation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LicenseTranslation" (
    id text NOT NULL,
    "licenseId" text NOT NULL,
    locale text NOT NULL,
    name text NOT NULL
);


--
-- Name: Market; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Market" (
    id text NOT NULL,
    code text NOT NULL
);


--
-- Name: MarketTranslation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MarketTranslation" (
    id text NOT NULL,
    "marketId" text NOT NULL,
    locale text NOT NULL,
    name text NOT NULL
);


--
-- Name: PayoutSpeedOption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PayoutSpeedOption" (
    id text NOT NULL,
    slug text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: PayoutSpeedOptionTranslation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PayoutSpeedOptionTranslation" (
    id text NOT NULL,
    "optionId" text NOT NULL,
    locale text NOT NULL,
    label text NOT NULL
);


--
-- Name: StaticPage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StaticPage" (
    id text NOT NULL,
    slug text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StaticPageTranslation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StaticPageTranslation" (
    id text NOT NULL,
    "pageId" text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "seoTitle" text,
    "seoDescription" text
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserReview" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "casinoId" text NOT NULL,
    rating integer NOT NULL,
    body text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone DEFAULT now()
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
    versioning_status text DEFAULT 'DISABLED'::text NOT NULL,
    CONSTRAINT buckets_versioning_dark_check CHECK ((versioning_status = 'DISABLED'::text)),
    CONSTRAINT buckets_versioning_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR (versioning_status = 'DISABLED'::text))),
    CONSTRAINT buckets_versioning_status_check CHECK ((versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text])))
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    archived_at timestamp with time zone,
    is_delete_marker boolean DEFAULT false NOT NULL,
    is_versioned boolean DEFAULT false NOT NULL
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: AffiliateClick; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AffiliateClick" (id, "casinoId", "bonusId", locale, referrer, "createdAt") FROM stdin;
cmtibij4i0001kpe2xdhlvtq1	cmtfyaf6s0000qnf0dcgi17t4	\N	zh	https://www.bc.gs/zh/casinos/nova-prime	2026-09-01 07:00:29.393
\.


--
-- Data for Name: Bonus; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Bonus" (id, "casinoId", type, amount, "wageringRequirement", "minDeposit", code, "expiryDate", status, "createdAt", "updatedAt") FROM stdin;
cmtlkt6lr00h9xcc8iv6v09wk	cmtfyaf6s0000qnf0dcgi17t4	welcome	100% up to $500	30x bonus	\N	\N	2026-12-31 00:00:00	published	2026-09-03 13:44:01.456	2026-09-03 13:44:01.456
cmtlkt8qz00hcxcc8l5jjscu0	cmtfyagqe0003qnf0gjiv8ozq	reload	50% up to $250	35x bonus	\N	\N	2026-09-30 00:00:00	published	2026-09-03 13:44:04.235	2026-09-03 13:44:04.235
cmtlktaw700hfxcc8fe2p6i0i	cmtfyahnu0006qnf0qtfy33g7	cashback	10% up to $100	10x cashback	\N	\N	2026-10-15 00:00:00	published	2026-09-03 13:44:07.015	2026-09-03 13:44:07.015
cmtlktd1a00hixcc8792g8kqi	cmtfyail60009qnf0zsmm5aal	welcome	$400 match	35x bonus	\N	\N	2026-11-01 00:00:00	published	2026-09-03 13:44:09.79	2026-09-03 13:44:09.79
cmtlktfbz00hlxcc85ywzpctz	cmtfyajik000cqnf0it6i85hv	welcome	125% up to $350	30x bonus	\N	\N	2026-09-20 00:00:00	published	2026-09-03 13:44:12.767	2026-09-03 13:44:12.767
cmtlkthh400hoxcc82oej3ou5	cmtfyald9000iqnf04o12iu9d	welcome	50% up to $1,000	25x bonus	\N	\N	2027-01-15 00:00:00	published	2026-09-03 13:44:15.545	2026-09-03 13:44:15.545
cmtlktjma00hrxcc8uwlihtki	cmtfyamb6000lqnf02ztyllec	no-deposit	$20 no deposit	35x bonus	\N	\N	2026-09-10 00:00:00	published	2026-09-03 13:44:18.322	2026-09-03 13:44:18.322
cmtlktlrl00huxcc8bvcigymy	cmtfyakfx000fqnf05u7feip1	free-spins	80 free spins	40x winnings	\N	\N	2026-09-05 00:00:00	published	2026-09-03 13:44:21.105	2026-09-03 13:44:21.105
cmtlktnwl00hxxcc8c7xtbsl2	cmtfyao5v000rqnf04w2cemkd	no-deposit	$25 no deposit	40x bonus	\N	\N	2026-08-28 00:00:00	published	2026-09-03 13:44:23.878	2026-09-03 13:44:23.878
cmtlktq1t00i0xcc849r0dg0j	cmtfyaq0o000xqnf0sg4drjb5	free-spins	50 free spins	40x winnings	\N	\N	2026-09-12 00:00:00	published	2026-09-03 13:44:26.657	2026-09-03 13:44:26.657
cmtlktscj00i3xcc8pxkbv6hv	cmtfyan8k000oqnf0ev5bcsao	reload	40% up to $200	30x bonus	\N	\N	2026-10-01 00:00:00	published	2026-09-03 13:44:29.635	2026-09-03 13:44:29.635
cmtlktuhm00i6xcc8d7mcfffp	cmtfyap3d000uqnf0aexlr3do	free-spins	30 free spins	35x winnings	\N	\N	2026-12-01 00:00:00	published	2026-09-03 13:44:32.41	2026-09-03 13:44:32.41
cmtlktwn000i9xcc8z6v4kx33	cmtfyar4j0010qnf0wvhpo1rc	welcome	100% up to $750	30x bonus	\N	\N	2026-11-20 00:00:00	published	2026-09-03 13:44:35.196	2026-09-03 13:44:35.196
cmtlktys200icxcc8c5fshfvh	cmtfyas1u0013qnf01wyf6ws7	welcome	200% up to $100	40x bonus	\N	\N	2026-08-30 00:00:00	published	2026-09-03 13:44:37.97	2026-09-03 13:44:37.97
cmtlku0xi00ifxcc8tlrt5rq6	cmtfyajik000cqnf0it6i85hv	cashback	12% up to $150	8x cashback	\N	\N	2026-09-18 00:00:00	published	2026-09-03 13:44:40.758	2026-09-03 13:44:40.758
\.


--
-- Data for Name: BonusTranslation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BonusTranslation" (id, "bonusId", locale, title, terms) FROM stdin;
cmtlkt6lr00haxcc8dm250cy0	cmtlkt6lr00h9xcc8iv6v09wk	en	First deposit match	100% up to $500\n\n30x bonus
cmtlkt8qz00hdxcc8bdzlbj26	cmtlkt8qz00hcxcc8l5jjscu0	en	Weekly reload offer	50% up to $250\n\n35x bonus
cmtlktaw700hgxcc8dq3r4if2	cmtlktaw700hfxcc8fe2p6i0i	en	Weekend cashback	10% up to $100\n\n10x cashback
cmtlktd1a00hjxcc8zd7lkyta	cmtlktd1a00hixcc8792g8kqi	en	Live dealer welcome	$400 match\n\n35x bonus
cmtlktfbz00hmxcc8xzy1a22n	cmtlktfbz00hlxcc85ywzpctz	en	Sports + casino match	125% up to $350\n\n30x bonus
cmtlkthh400hpxcc8szb7314a	cmtlkthh400hoxcc82oej3ou5	en	High-roller package	50% up to $1,000\n\n25x bonus
cmtlktjma00hsxcc8htmd11gg	cmtlktjma00hrxcc8uwlihtki	en	Crypto no-deposit credit	$20 no deposit\n\n35x bonus
cmtlktlrl00hvxcc8l1nke6h7	cmtlktlrl00huxcc8bvcigymy	en	Mobile free spins	80 free spins\n\n40x winnings
cmtlktnwl00hyxcc8wduehcmb	cmtlktnwl00hxxcc8c7xtbsl2	en	No-deposit trial	$25 no deposit\n\n40x bonus
cmtlktq1t00i1xcc8vi17qc4n	cmtlktq1t00i0xcc849r0dg0j	en	Slots welcome spins	50 free spins\n\n40x winnings
cmtlktscj00i4xcc8vfm8wqxr	cmtlktscj00i3xcc8pxkbv6hv	en	Live table reload	40% up to $200\n\n30x bonus
cmtlktuhm00i7xcc81k89hluh	cmtlktuhm00i6xcc8d7mcfffp	en	UK free spins	30 free spins\n\n35x winnings
cmtlktwn000iaxcc8gxk265fr	cmtlktwn000i9xcc8z6v4kx33	en	Bank transfer welcome	100% up to $750\n\n30x bonus
cmtlktys200idxcc8bwsrgpus	cmtlktys200icxcc8c5fshfvh	en	Launch welcome	200% up to $100\n\n40x bonus
cmtlku0xi00igxcc89tdq0c3r	cmtlku0xi00ifxcc8tlrt5rq6	en	Midweek cashback	12% up to $150\n\n8x cashback
\.


--
-- Data for Name: Casino; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Casino" (id, slug, "logoUrl", "establishedYear", "minDeposit", "paymentMethods", "gameProviders", "overallRating", "ratingBonuses", "ratingGames", "ratingSupport", "ratingPayout", "ratingTrust", "affiliateLink", status, "createdAt", "updatedAt", "payoutSpeedId") FROM stdin;
cmtfyakfx000fqnf05u7feip1	arcadia-play	\N	2022	10	{crypto,visa}	{hacksaw,playngo}	4.3	4.1	4.2	4.3	4	4.1	https://example.com/visit/arcadia-play	published	2026-08-30 15:14:50.494	2026-09-03 13:42:43.865	payout_1_2_days
cmtfyar4j0010qnf0wvhpo1rc	atlas-table	\N	2013	30	{bank}	{netent}	3.6	4.3	3.7	4.2	3.4	4.4	https://example.com/visit/atlas-table	published	2026-08-30 15:14:58.957	2026-09-03 13:43:04.986	payout_1_2_days
cmtfyas1u0013qnf01wyf6ws7	ridge-play	\N	2026	10	{crypto,visa,paypal}	{hacksaw}	3.5	3.7	3.6	3.8	4.3	3.5	https://example.com/visit/ridge-play	published	2026-08-30 15:15:00.354	2026-09-03 13:43:07.97	payout_12_24_hours
cmtfyaf6s0000qnf0dcgi17t4	nova-prime	\N	2018	20	{crypto,visa,bank}	{evolution,pragmatic,netent}	4.8	4.6	4.8	4.7	4.9	4.8	https://example.com/visit/nova-prime	published	2026-08-30 15:14:43.684	2026-09-03 13:42:28.725	payout_under_2_hours
cmtfyagqe0003qnf0gjiv8ozq	aurelia-club	\N	2024	15	{visa,paypal}	{pragmatic,hacksaw}	4.7	4.5	4.6	4.4	4.8	4.3	https://example.com/visit/aurelia-club	published	2026-08-30 15:14:45.686	2026-09-03 13:42:31.725	payout_same_day
cmtfyahnu0006qnf0qtfy33g7	lumen-bet	\N	2016	10	{visa,bank}	{netent,playngo}	4.6	4.3	4.4	4.6	4.2	4.7	https://example.com/visit/lumen-bet	published	2026-08-30 15:14:46.89	2026-09-03 13:42:34.915	payout_24_48_hours
cmtfyail60009qnf0zsmm5aal	northline	\N	2014	20	{visa,paypal,bank}	{evolution,netent}	4.5	4.4	4.6	4.5	4.3	4.8	https://example.com/visit/northline	published	2026-08-30 15:14:48.09	2026-09-03 13:42:37.895	payout_12_24_hours
cmtfyajik000cqnf0it6i85hv	velvet-odds	\N	2019	15	{crypto,visa,paypal}	{pragmatic,evolution}	4.4	4.4	4.5	4.2	4.6	4.4	https://example.com/visit/velvet-odds	published	2026-08-30 15:14:49.292	2026-09-03 13:42:40.874	payout_under_6_hours
cmtfyald9000iqnf04o12iu9d	meridian-house	\N	2012	50	{visa,bank}	{evolution,netent,playngo}	4.2	4	4.5	4.4	4.6	4.6	https://example.com/visit/meridian-house	published	2026-08-30 15:14:51.694	2026-09-03 13:42:46.857	payout_same_day
cmtfyamb6000lqnf02ztyllec	opal-desk	\N	2021	10	{crypto}	{hacksaw,pragmatic}	4.1	3.9	4	4.1	4.9	4	https://example.com/visit/opal-desk	published	2026-08-30 15:14:52.914	2026-09-03 13:42:49.849	payout_under_1_hour
cmtfyan8k000oqnf0ev5bcsao	sable-room	\N	2017	25	{paypal,bank}	{evolution}	4	4.2	4.1	4.3	4.5	4	https://example.com/visit/sable-room	published	2026-08-30 15:14:54.116	2026-09-03 13:42:53.064	payout_same_day
cmtfyao5v000rqnf04w2cemkd	cinder-park	\N	2023	10	{visa,paypal}	{pragmatic,playngo}	3.9	4	3.8	3.9	3.6	3.7	https://example.com/visit/cinder-park	published	2026-08-30 15:14:55.315	2026-09-03 13:42:56.053	payout_1_2_days
cmtfyap3d000uqnf0aexlr3do	harbor-line	\N	2015	10	{visa,bank}	{netent,evolution}	3.8	4.1	4.2	4.3	4.2	4.5	https://example.com/visit/harbor-line	published	2026-08-30 15:14:56.522	2026-09-03 13:42:59.032	payout_12_24_hours
cmtfyaq0o000xqnf0sg4drjb5	quartz-bet	\N	2020	10	{crypto,paypal}	{hacksaw,pragmatic,playngo}	3.7	3.8	4.4	3.9	4	4.2	https://example.com/visit/quartz-bet	published	2026-08-30 15:14:57.72	2026-09-03 13:43:02.007	payout_1_2_days
\.


--
-- Data for Name: CasinoCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CasinoCategory" ("casinoId", "categoryId", rank) FROM stdin;
cmtfyaf6s0000qnf0dcgi17t4	cmtg1bx09002fsrbappc1lsrm	1
cmtfyajik000cqnf0it6i85hv	cmtg1bx09002fsrbappc1lsrm	2
cmtfyakfx000fqnf05u7feip1	cmtg1bx09002fsrbappc1lsrm	3
cmtfyamb6000lqnf02ztyllec	cmtg1bx09002fsrbappc1lsrm	4
cmtfyaq0o000xqnf0sg4drjb5	cmtg1bx09002fsrbappc1lsrm	5
cmtfyas1u0013qnf01wyf6ws7	cmtg1bx09002fsrbappc1lsrm	6
cmtfyaf6s0000qnf0dcgi17t4	cmtg1byjs002isrbagdz0c8r3	1
cmtfyagqe0003qnf0gjiv8ozq	cmtg1byjs002isrbagdz0c8r3	2
cmtfyajik000cqnf0it6i85hv	cmtg1byjs002isrbagdz0c8r3	3
cmtfyald9000iqnf04o12iu9d	cmtg1byjs002isrbagdz0c8r3	4
cmtfyamb6000lqnf02ztyllec	cmtg1byjs002isrbagdz0c8r3	5
cmtfyan8k000oqnf0ev5bcsao	cmtg1byjs002isrbagdz0c8r3	6
cmtfyas1u0013qnf01wyf6ws7	cmtg1byjs002isrbagdz0c8r3	7
cmtfyaf6s0000qnf0dcgi17t4	cmtg1bzmj002lsrbaepd99x3w	1
cmtfyail60009qnf0zsmm5aal	cmtg1bzmj002lsrbaepd99x3w	2
cmtfyajik000cqnf0it6i85hv	cmtg1bzmj002lsrbaepd99x3w	3
cmtfyald9000iqnf04o12iu9d	cmtg1bzmj002lsrbaepd99x3w	4
cmtfyan8k000oqnf0ev5bcsao	cmtg1bzmj002lsrbaepd99x3w	5
cmtfyap3d000uqnf0aexlr3do	cmtg1bzmj002lsrbaepd99x3w	6
cmtfyaf6s0000qnf0dcgi17t4	cmtg1c0jq002osrbaxzg4acdv	1
cmtfyagqe0003qnf0gjiv8ozq	cmtg1c0jq002osrbaxzg4acdv	2
cmtfyahnu0006qnf0qtfy33g7	cmtg1c0jq002osrbaxzg4acdv	3
cmtfyail60009qnf0zsmm5aal	cmtg1c0jq002osrbaxzg4acdv	4
cmtfyajik000cqnf0it6i85hv	cmtg1c0jq002osrbaxzg4acdv	5
cmtfyakfx000fqnf05u7feip1	cmtg1c0jq002osrbaxzg4acdv	6
cmtfyald9000iqnf04o12iu9d	cmtg1c0jq002osrbaxzg4acdv	7
cmtfyamb6000lqnf02ztyllec	cmtg1c0jq002osrbaxzg4acdv	8
\.


--
-- Data for Name: CasinoCategoryNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CasinoCategoryNote" (id, "casinoId", "categoryId", locale, "editorialNote") FROM stdin;
\.


--
-- Data for Name: CasinoLicense; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CasinoLicense" ("casinoId", "licenseId", "licenseNumber", verified, "verificationUrl") FROM stdin;
cmtfyaf6s0000qnf0dcgi17t4	license_mga	\N	f	\N
cmtfyaf6s0000qnf0dcgi17t4	license_gibraltar	\N	f	\N
cmtfyagqe0003qnf0gjiv8ozq	license_curacao	\N	f	\N
cmtfyahnu0006qnf0qtfy33g7	license_mga	\N	f	\N
cmtfyail60009qnf0zsmm5aal	license_ukgc	\N	f	\N
cmtfyail60009qnf0zsmm5aal	license_gibraltar	\N	f	\N
cmtfyajik000cqnf0it6i85hv	license_mga	\N	f	\N
cmtfyajik000cqnf0it6i85hv	license_curacao	\N	f	\N
cmtfyakfx000fqnf05u7feip1	license_curacao	\N	f	\N
cmtfyald9000iqnf04o12iu9d	license_gibraltar	\N	f	\N
cmtfyald9000iqnf04o12iu9d	license_ukgc	\N	f	\N
cmtfyamb6000lqnf02ztyllec	license_curacao	\N	f	\N
cmtfyan8k000oqnf0ev5bcsao	license_kahnawake	\N	f	\N
cmtfyao5v000rqnf04w2cemkd	license_curacao	\N	f	\N
cmtfyap3d000uqnf0aexlr3do	license_ukgc	\N	f	\N
cmtfyaq0o000xqnf0sg4drjb5	license_mga	\N	f	\N
cmtfyar4j0010qnf0wvhpo1rc	license_gibraltar	\N	f	\N
cmtfyas1u0013qnf01wyf6ws7	license_kahnawake	\N	f	\N
cmtfyas1u0013qnf01wyf6ws7	license_curacao	\N	f	\N
\.


--
-- Data for Name: CasinoMarket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CasinoMarket" ("casinoId", "marketId", status, "affiliateLink") FROM stdin;
\.


--
-- Data for Name: CasinoTranslation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CasinoTranslation" (id, "casinoId", locale, name, "reviewBody", pros, cons, "seoTitle", "seoDescription") FROM stdin;
cmtlkr71x00frxcc8obfkkjlu	cmtfyaf6s0000qnf0dcgi17t4	en	Nova Prime	Nova Prime is the operator we send people to first when they want a clean, grown-up product. The lobby is quiet, the cashier is obvious, and nothing on the homepage tries to shout you into a deposit.\n\nWhat held up under testing was the payout desk. Crypto and cards both cleared inside the window they advertise. Support answered with names and next steps, not canned paragraphs.\n\nThe welcome match is modest on purpose. Wagering sits at 30x and the game weighting is published in one place. That is rarer than it should be, and it is why the score on bonuses is high without being inflated.	{"Withdrawals typically clear in under two hours","Support replies like a desk, not a script","Bonus terms are readable and restrained"}	{"Table limits can feel tight at peak hours","Sportsbook is thinner than the casino side"}	\N	\N
cmtlkr9iu00fvxcc85d0haifu	cmtfyagqe0003qnf0gjiv8ozq	en	Aurelia Club	Aurelia Club is new, and it reads that way — in a good sense. The product is light, the cashier is fast, and the welcome offer is written in one screen instead of three footnotes.\n\nPayouts were the surprise. Same-day card withdrawals landed before evening. PayPal was slower by a few hours, still inside the advertised window.\n\nTrust is the open question. A single Curaçao license is not a red flag on its own, but it is why we keep the safety score a notch below the product score until the operator has a longer public record.	{"Same-day payouts on cards and PayPal","Fresh lobby with Hacksaw and Pragmatic in good shape","Welcome package is easy to understand"}	{"License is Curaçao only — thinner recourse if something goes wrong","Still adding live tables"}	\N	\N
cmtlkrbtw00fzxcc852f286ek	cmtfyahnu0006qnf0qtfy33g7	en	Lumen Bet	Lumen Bet does not try to look new. The lobby is older in places, but the operator behind it is settled — Malta licensed, consistent ownership, and a support team that does not vanish on weekends.\n\nPayouts are the trade-off. We saw 24–48 hours on bank and card, which matches their own copy. If speed is your first filter, look elsewhere. If you want fewer surprises, this is a safer desk.\n\nThe 200% match sounds loud until you notice the $200 cap. Fine for a first deposit; not a high-roller package.	{"Long track record and a Malta license","Support is calm and unusually patient","NetEnt and Play’n GO catalogues are well kept"}	{"Withdrawals take a full day or two","Welcome bonus is small if you deposit above $200"}	\N	\N
cmtlkre4o00g3xcc8o8114e81	cmtfyail60009qnf0zsmm5aal	en	Northline	Northline is built for players who want a regulated desk first and a pretty lobby second. UKGC plus Gibraltar is the kind of paperwork that actually matters when a withdrawal is delayed.\n\nThe live floor is the product. Evolution tables are well stacked, and we did not see the usual bait-and-switch of three empty studios behind a banner.\n\nExpect to verify before the first cash-out. That slowed us by a day. After that, 12–24 hour payouts were consistent.	{"UKGC and Gibraltar coverage","Strong live dealer floor","A genuine no-deposit offer for new accounts"}	{"Verification can take a full working day","The cashier feels dated on mobile"}	\N	\N
cmtlkrgfe00g7xcc8o8ye9hc7	cmtfyajik000cqnf0it6i85hv	en	Velvet Odds	Velvet Odds is one of the few dual products on this list that does not feel like a casino with a sports widget taped on. Bets and tables share a wallet, and the cashier treats both the same way.\n\nSpeed is a strength. Card and crypto withdrawals landed inside six hours. PayPal was close behind.\n\nWrite to support on a Saturday night in season and you will wait. That is the main reason the support score sits below the rest of the card.	{"Casino and sports in one account that actually works","Crypto and PayPal both available","Withdrawals under six hours in our tests"}	{"Support queues stretch on event nights","Two licenses, uneven complaint handling"}	\N	\N
cmtlkriqh00gbxcc8goftr1ac	cmtfyakfx000fqnf05u7feip1	en	Arcadia Play	Arcadia Play is built for a phone first. The lobby, the cashier, and live chat all sit in one thumb-reach column. On a laptop it feels thinner, which we take as an honest product choice rather than neglect.\n\nHacksaw and Play’n GO are the catalogue. If you want a deep live floor, this is not the desk. If you want slots that do not stutter on a commute, it is.\n\nPayouts were fine, not fast: one to two days. The free-spins welcome is the main offer, and wagering is on the stricter side.	{"Best mobile lobby on the list","Hacksaw titles load quickly on mid-range phones","Low minimum deposit"}	{"Payouts take a day or two","Desktop site is clearly second priority"}	\N	\N
cmtlkrl1m00gfxcc8j1pa9r1j	cmtfyald9000iqnf04o12iu9d	en	Meridian House	Meridian House is for people who already know what they want. Limits are high, the welcome match is not trying to look generous, and the cashier assumes you have done this before.\n\nOnce verified, same-day bank and card payouts held up. The first cash-out needed documents. After that, the desk was quiet and fast.\n\nThe 50% match up to $1,000 is the right shape for this audience. Wagering at 25x is among the cleaner terms on the list.	{"High limits that are actually honored","Same-day withdrawals after KYC","Gibraltar and UK coverage"}	{"Fifty-dollar minimum will put some players off","Welcome match is conservative"}	\N	\N
cmtlkrni700gjxcc8i0kiur26	cmtfyamb6000lqnf02ztyllec	en	Opal Desk	Opal Desk is a crypto cashier with a casino attached. If that is what you want, it is excellent. If you need a card, stop here.\n\nOur test withdrawal confirmed in 41 minutes. That is the product. Everything else — lobby, live chat, bonus — is built around keeping that rail clean.\n\nThe no-deposit and free-spin offers credited without a ticket. Expiry is short, so treat them as a trial, not a plan.	{"Crypto withdrawals in under an hour","No-deposit and free-spin offers that actually credit","Simple, uncluttered cashier"}	{"Crypto only — no cards or bank","Catalogue is still slim"}	\N	\N
cmtlkrpu100gnxcc8kxsvtwd3	cmtfyan8k000oqnf0ev5bcsao	en	Sable Room	Sable Room does not pretend to be a slots destination. You come for Evolution tables, stay if the cashier behaves, and leave the rest.\n\nIt did behave. PayPal and bank withdrawals both returned same day after an initial document check.\n\nThe 75% match is aimed at table players. Wagering is fair; contribution from live games is published and not buried.	{"Live tables are the whole point, and they are well run","PayPal and bank both available","Same-day payouts after the first review"}	{"Slots library is an afterthought","Kahnawake license is less familiar to some players"}	\N	\N
cmtlkrs5100grxcc8yigzgyaf	cmtfyao5v000rqnf04w2cemkd	en	Cinder Park	Cinder Park is on this list because the no-deposit credit actually arrived. That is a low bar, and most operators still fail it.\n\nDo not come for speed. Two to three days on payouts, and the catalogue is not deep enough to justify a long stay.\n\nTreat it as a trial desk. If the $25 clears and you like the tables, fine. It is not a first recommendation for a full bankroll.	{"A real no-deposit credit for new accounts","Low barrier to try the lobby","PayPal is available from day one"}	{"Withdrawals took two to three days","Game list is short and uneven"}	\N	\N
cmtlkrufs00gvxcc8t5or9ao5	cmtfyap3d000uqnf0aexlr3do	en	Harbor Line	Harbor Line is the UK-shaped operator on this desk: quieter bonuses, clearer tools, and a license that means something if you need to escalate.\n\nPayouts landed in a day after verification. The welcome match is small on purpose. That is the UK market, not a failure of the product.\n\nIf you want unrestricted catalogues and louder offers, look at the MGA or Curaçao names. If you want the paperwork, stay here.	{"UKGC licensed end to end","Clear safer-gambling tools","24-hour payouts once verified"}	{"Offer is modest compared with offshore desks","Some titles are geo-restricted"}	\N	\N
cmtlkrwqf00gzxcc86wvsuwoi	cmtfyaq0o000xqnf0sg4drjb5	en	Quartz Bet	Quartz Bet is a slots desk. Hacksaw, Pragmatic, and Play’n GO are stocked like a shop that knows its customers. Live tables exist; they are not the reason to open an account.\n\nThe welcome is fifty spins. Winnings sit behind 40x. Fine as a taste, poor as a bankroll plan.\n\nMalta licensing and a mixed cashier (crypto plus PayPal) keep the trust score above the support score. Chat was polite and slow.	{"Slots catalogue is deep and current","Malta license","Crypto and PayPal both work"}	{"The welcome is spins only — no cash match","Live chat is slower than the lobby suggests"}	\N	\N
cmtlkrz1700h3xcc8pxjt2hn0	cmtfyar4j0010qnf0wvhpo1rc	en	Atlas Table	Atlas Table is a bank-transfer operator in a card world. If that is your rail, the cashier is unusually careful with it. If you want instant, look at Opal or Nova.\n\nThe $750 match is the headline. Wagering is reasonable. The wait is the cost: three to five days on the way out in our tests.\n\nThe lobby is NetEnt and not much else. Come for the cashier, not the catalogue.	{"Bank transfer is first-class, not a leftover","Generous match if you can wait on payouts","Gibraltar licensed"}	{"Withdrawals took three to five days","NetEnt-heavy lobby, little else"}	\N	\N
cmtlks1hj00h7xcc8u4xkqm73	cmtfyas1u0013qnf01wyf6ws7	en	Ridge Play	Ridge Play launched this year. We listed it because the cashier already works — not because the catalogue is ready.\n\nA 200% match on a $100 cap is a marketing line. Wagering is 40x and the expiry is short. The no-deposit credit is the more honest way in.\n\nTrust stays conservative until there is a year of public payout history. Come back later if you want a finished product.	{"New, and payouts were already under twelve hours","Crypto, cards, and PayPal from launch","A no-deposit credit for testers"}	{"Too new for a full trust score","Hacksaw-only catalogue feels thin"}	\N	\N
cmtg6xa1c0001zrl5uykw654a	cmtfyaf6s0000qnf0dcgi17t4	zh	Nova Prime	Nova Prime 是我们会首先推荐给想要干净、成熟产品的人。大厅安静，收银台一目了然，首页也没有硬推你去存款。\n\n测试里站得住的是出款柜台。加密货币和银行卡都在他们宣传的时限内到账。客服报出名和下一步，而不是套话。\n\n迎新匹配刻意克制。流水是 30x，游戏权重集中在一处公布。这本该更常见，也是优惠分高却不虚高的原因。	{出款通常在两小时内到账,客服像柜台在答，不是念脚本,优惠条款好读、也克制}	{高峰时段桌限可能偏紧,体育比娱乐场一侧薄}	\N	\N
cmtg6xahz0003zrl5wn1inmnf	cmtfyaf6s0000qnf0dcgi17t4	th	Nova Prime	Nova Prime คือผู้ให้บริการที่เราแนะนำเป็นอันดับแรกเมื่ออยากได้ผลิตภัณฑ์ที่สะอาดและโตแล้ว ล็อบบี้เงียบ แคชเชียร์ชัดเจน และหน้าแรกไม่ได้ตะโกนให้ฝาก\n\nสิ่งที่ผ่านการทดสอบคือโต๊ะถอน คริปโตและบัตรเข้าบัญชีภายในเวลาที่โฆษณา ฝ่ายบริการตอบด้วยชื่อและขั้นตอนถัดไป ไม่ใช่ย่อหน้าสำเร็จรูป\n\nแมตช์ต้อนรับพอประมาณโดยตั้งใจ เทิร์นอยู่ที่ 30x และน้ำหนักเกมประกาศไว้ที่เดียว ซึ่งหายากกว่าที่ควร และเป็นเหตุผลที่คะแนนโบนัสสูงโดยไม่โป่ง	{การถอนโดยทั่วไปเข้าบัญชีภายในสองชั่วโมง,"ฝ่ายบริการตอบเหมือนโต๊ะจริง ไม่ใช่สคริปต์",เงื่อนไขโบนัสอ่านง่ายและพอประมาณ}	{วงเงินโต๊ะอาจแน่นในช่วงเวลาเร่ง,กีฬาบางกว่าฝั่งคาสิโน}	\N	\N
cmtg6xayo0005zrl5lpu2wnd1	cmtfyagqe0003qnf0gjiv8ozq	zh	Aurelia Club	Aurelia Club 很新，读起来也像新的 — 是好事。产品轻，收银台快，迎新优惠一屏写完，而不是三条脚注。\n\n出款是意外惊喜。银行卡当天出金傍晚前到账。PayPal 慢几个小时，仍在宣传时限内。\n\n信任仍是未决问题。单一 Curaçao 牌照本身不是红旗，但在运营商有更长公开记录之前，安全分会比产品分低一档。	{"银行卡和 PayPal 当天出款","大厅很新，Hacksaw 和 Pragmatic 状态不错",迎新套餐好懂}	{"只有 Curaçao 牌照 — 出事时申诉途径更薄",真人桌还在补}	\N	\N
cmtg6xb9u0007zrl5ftm2ojk4	cmtfyagqe0003qnf0gjiv8ozq	th	Aurelia Club	Aurelia Club ใหม่ และอ่านออกแบบนั้น — ในแง่ดี ผลิตภัณฑ์เบา แคชเชียร์เร็ว และข้อเสนอต้อนรับเขียนจบในหน้าเดียว ไม่ใช่สามเชิงอรรถ\n\nการถอนคือเรื่องเซอร์ไพรส์ ถอนบัตรวันเดียวกันเข้าบัญชีก่อนเย็น PayPal ช้ากว่าไม่กี่ชั่วโมง ยังอยู่ในกรอบที่โฆษณา\n\nความน่าเชื่อถือยังเป็นคำถามเปิด ใบอนุญาต Curaçao ใบเดียวไม่ใช่ธงแดงในตัว แต่เป็นเหตุผลที่เราให้คะแนนความปลอดภัยต่ำกว่าคะแนนผลิตภัณฑ์จนกว่าผู้ให้บริการจะมีประวัติสาธารณะยาวขึ้น	{"ถอนบัตรและ PayPal ภายในวันเดียวกัน","ล็อบบี้ใหม่ Hacksaw และ Pragmatic อยู่ในสภาพดี",แพ็กเกจต้อนรับเข้าใจง่าย}	{"ใบอนุญาตมีแค่ Curaçao — ช่องทางเยียวยาน้อยกว่าถ้ามีปัญหา",ยังเพิ่มโต๊ะสดอยู่}	\N	\N
cmtg6xbqj0009zrl5qsolwok7	cmtfyahnu0006qnf0qtfy33g7	zh	Lumen Bet	Lumen Bet 不装新。大厅有些地方显旧，但背后的运营商很稳 — 马耳他牌照、股权稳定，客服周末也不会消失。\n\n出款是取舍。银行和银行卡我们看到 24–48 小时，和他们自己写的一致。若速度是第一筛选，另找别处。若想少些意外，这是更稳的柜台。\n\n200% 匹配听起来很响，直到你看到 $200 上限。适合首次存款；不是高额玩家套餐。	{经营年限长，还有马耳他牌照,客服沉稳，耐心少见,"NetEnt 和 Play’n GO 目录维护得好"}	{出款要一整天到两天,"存款超过 $200 时，迎新优惠偏小"}	\N	\N
cmtg6xc1o000bzrl5kcw2e9qg	cmtfyahnu0006qnf0qtfy33g7	th	Lumen Bet	Lumen Bet ไม่พยายามดูใหม่ ล็อบบี้เก่าในบางจุด แต่ผู้ให้บริการด้านหลังมั่นคง — ใบอนุญาตมอลตา เจ้าของต่อเนื่อง และทีมบริการที่ไม่หายไปวันหยุด\n\nการถอนคือข้อแลก เราเห็น 24–48 ชั่วโมงบนธนาคารและบัตร ซึ่งตรงกับข้อความของพวกเขา ถ้าความเร็วคือตัวกรองแรก ให้มองที่อื่น ถ้าอยากเซอร์ไพรส์น้อย นี่คือโต๊ะที่ปลอดภัยกว่า\n\nแมตช์ 200% ฟังดังจนกว่าจะเห็นเพดาน $200 ดีสำหรับฝากครั้งแรก ไม่ใช่แพ็กเกจไฮโรลเลอร์	{ประวัติยาวนานและใบอนุญาตมอลตา,ฝ่ายบริการสงบและอดทนผิดปกติ,"แคตตาล็อก NetEnt และ Play’n GO ดูแลดี"}	{การถอนใช้เวลาหนึ่งถึงสองวันเต็ม,"โบนัสต้อนรับเล็กถ้าฝากเกิน $200"}	\N	\N
cmtg6xcig000dzrl5uqc4y588	cmtfyail60009qnf0zsmm5aal	zh	Northline	Northline 面向先要合规柜台、大厅漂亮其次的玩家。UKGC 加上 Gibraltar，是出款被拖时真正有用的那类文件。\n\n真人区才是产品。Evolution 桌排得满，我们没看到横幅后面只剩三间空棚那种诱饵。\n\n第一次出金前要做好核验准备。这让我们慢了一天。之后 12–24 小时出款很稳定。	{"有 UKGC 和 Gibraltar 覆盖",真人荷官区扎实,新账户有真正的免存款优惠}	{核验可能要一整工作日,移动端收银台显得过时}	\N	\N
cmtg6xctn000fzrl5m00h39e2	cmtfyail60009qnf0zsmm5aal	th	Northline	Northline สร้างมาสำหรับผู้เล่นที่อยากได้โต๊ะที่ถูกกำกับก่อน ล็อบบี้สวยทีหลัง UKGC บวก Gibraltar คือเอกสารที่ยังมีความหมายเมื่อการถอนล่าช้า\n\nชั้นสดคือผลิตภัณฑ์ โต๊ะ Evolution จัดเต็ม และเราไม่เห็นกลลวงแบบสามสตูดิโอว่างหลังแบนเนอร์\n\nคาดว่าต้องยืนยันตัวตนก่อนถอนครั้งแรก ทำให้เราช้าไปหนึ่งวัน หลังจากนั้นการถอน 12–24 ชั่วโมงสม่ำเสมอ	{"ครอบคลุม UKGC และ Gibraltar",ชั้นดีลเลอร์สดแข็งแรง,ข้อเสนอไม่ต้องฝากจริงสำหรับบัญชีใหม่}	{การยืนยันตัวตนอาจใช้เวลาหนึ่งวันทำการเต็ม,แคชเชียร์บนมือถือดูล้าสมัย}	\N	\N
cmtg6xdac000hzrl5pz2onvyd	cmtfyajik000cqnf0it6i85hv	zh	Velvet Odds	Velvet Odds 是这份名单里少数不像娱乐场贴了个体育插件的双产品。投注和桌子共用钱包，收银台两边一样对待。\n\n速度是强项。银行卡和加密货币出款六小时内到账。PayPal 紧随其后。\n\n赛季周六晚上写信给客服，你得等。这是客服分低于卡片其余部分的主要原因。	{娱乐场和体育共用一个真正能用的账户,"加密货币和 PayPal 都可用",我们测试中出款不到六小时}	{赛事夜客服排队会拉长,两张牌照，投诉处理不均}	\N	\N
cmtg6xdmg000jzrl5lbk3mhk3	cmtfyajik000cqnf0it6i85hv	th	Velvet Odds	Velvet Odds เป็นหนึ่งในไม่กี่ผลิตภัณฑ์คู่ในรายการนี้ที่ไม่รู้สึกเหมือนคาสิโนแปะวิดเจตกีฬา เดิมพันและโต๊ะใช้กระเป๋าเงินร่วม และแคชเชียร์ปฏิบัติทั้งสองแบบเดียวกัน\n\nความเร็วคือจุดแข็ง ถอนบัตรและคริปโตเข้าบัญชีภายในหกชั่วโมง PayPal ตามมาติดๆ\n\nเขียนถึงฝ่ายบริการคืนวันเสาร์ในฤดูกาลแล้วคุณจะรอ นั่นคือเหตุผลหลักที่คะแนนบริการอยู่ต่ำกว่าส่วนอื่นของการ์ด	{คาสิโนและกีฬาในบัญชีเดียวที่ใช้ได้จริง,"มีทั้งคริปโตและ PayPal",การถอนไม่ถึงหกชั่วโมงในการทดสอบของเรา}	{คิวบริการยืดในคืนที่มีอีเวนต์,"สองใบอนุญาต การจัดการร้องเรียนไม่สม่ำเสมอ"}	\N	\N
cmtg6xe35000lzrl5ngt75qch	cmtfyakfx000fqnf05u7feip1	zh	Arcadia Play	Arcadia Play 先为手机而建。大厅、收银台和在线客服都挤在一根拇指够得到的栏里。笔记本上会显得薄，我们当成诚实的产品选择，而不是疏忽。\n\n目录就是 Hacksaw 和 Play’n GO。若要深的真人区，这里不是那家柜台。若要通勤时老虎机不卡，这里就是。\n\n出款还行，不快：一两天。免费旋转迎新是主打，流水偏严。	{名单上最好的手机大厅,"Hacksaw 游戏在中端手机上加载快",最低存款低}	{出款要一两天,桌面站明显是次要的}	\N	\N
cmtg6xee9000nzrl53a62dimq	cmtfyakfx000fqnf05u7feip1	th	Arcadia Play	Arcadia Play สร้างเพื่อมือถือก่อน ล็อบบี้ แคชเชียร์ และแชทสดอยู่ในคอลัมน์ที่นิ้วโป้งเอื้อมถึง บนแล็ปท็อปบางลง ซึ่งเราถือเป็นการเลือกผลิตภัณฑ์ที่ซื่อสัตย์ ไม่ใช่การละเลย\n\nHacksaw และ Play’n GO คือแคตตาล็อก ถ้าอยากได้ชั้นสดลึก นี่ไม่ใช่โต๊ะนั้น ถ้าอยากได้สล็อตที่ไม่กระตุกตอนเดินทาง นี่คือ\n\nการถอนใช้ได้ ไม่เร็ว: หนึ่งถึงสองวัน ฟรีสปินต้อนรับคือข้อเสนอหลัก และเทิร์นค่อนข้างเข้ม	{ล็อบบี้มือถือที่ดีที่สุดในรายการ,"เกม Hacksaw โหลดเร็วบนมือถือระดับกลาง",ฝากขั้นต่ำต่ำ}	{การถอนใช้เวลาหนึ่งถึงสองวัน,เว็บเดสก์ท็อปชัดเจนว่าเป็นลำดับสอง}	\N	\N
cmtg6xeuw000pzrl5osi2sm2s	cmtfyald9000iqnf04o12iu9d	zh	Meridian House	Meridian House 给已经知道自己要什么的人。限额高，迎新匹配不装慷慨，收银台默认你做过这件事。\n\n核验后，银行和银行卡当天出款站得住。第一次出金要文件。之后柜台安静又快。\n\n50% 最高 $1,000 的匹配对这批玩家形状对。25x 流水是名单里更干净的条款之一。	{高限额是真给的,"KYC 后当天出款","有 Gibraltar 和英国覆盖"}	{五十美元最低存款会劝退一部分人,迎新匹配偏保守}	\N	\N
cmtg6xf60000rzrl5fwddsz84	cmtfyald9000iqnf04o12iu9d	th	Meridian House	Meridian House สำหรับคนที่รู้แล้วว่าต้องการอะไร วงเงินสูง แมตช์ต้อนรับไม่พยายามดูใจกว้าง และแคชเชียร์สมมติว่าคุณเคยทำมาก่อน\n\nเมื่อยืนยันแล้ว การถอนธนาคารและบัตรวันเดียวกันยืนได้ การถอนครั้งแรกต้องใช้เอกสาร หลังจากนั้นโต๊ะเงียบและเร็ว\n\nแมตช์ 50% สูงสุด $1,000 เป็นรูปทรงที่ถูกสำหรับกลุ่มนี้ เทิร์น 25x อยู่ในเงื่อนไขที่สะอาดกว่าในรายการ	{วงเงินสูงที่ให้จริง,"ถอนวันเดียวกันหลัง KYC","ครอบคลุม Gibraltar และสหราชอาณาจักร"}	{ขั้นต่ำห้าสิบดอลลาร์จะทำให้ผู้เล่นบางคนถอย,แมตช์ต้อนรับค่อนข้างระมัดระวัง}	\N	\N
cmtg6xfmo000tzrl5xfkhxuxf	cmtfyamb6000lqnf02ztyllec	zh	Opal Desk	Opal Desk 是挂了娱乐场的加密收银台。若这就是你要的，它很好。若需要银行卡，到此为止。\n\n我们的测试出款 41 分钟确认。这就是产品。其余 — 大厅、在线客服、优惠 — 都围着把这条通道保持干净。\n\n免存款和免费旋转优惠不用工单就到账。有效期短，当试用，不当计划。	{加密货币出款不到一小时,免存款和免费旋转优惠真会到账,收银台简单、不杂}	{"仅加密货币 — 没有卡或银行",目录仍然偏瘦}	\N	\N
cmtg6xipy0019zrl5c8ytlugb	cmtfyaq0o000xqnf0sg4drjb5	zh	Quartz Bet	Quartz Bet 是老虎机柜台。Hacksaw、Pragmatic 和 Play’n GO 备货像懂客人的店。真人桌有，但不是开户的理由。\n\n迎新是五十次旋转。奖金后面是 40x。当尝尝可以，当资金计划不行。\n\n马耳他牌照加上混合收银台（加密货币加 PayPal）让信任分高于客服分。聊天礼貌但慢。	{老虎机目录深且新,马耳他牌照,"加密货币和 PayPal 都能用"}	{"迎新只有旋转 — 没有现金匹配",在线客服比大厅看起来慢}	\N	\N
cmtg6xfxu000vzrl54xqab1hd	cmtfyamb6000lqnf02ztyllec	th	Opal Desk	Opal Desk คือแคชเชียร์คริปโตที่มีคาสิโนติดมา ถ้าอย่างนั้นคือสิ่งที่ต้องการ มันยอดเยี่ยม ถ้าต้องการบัตร หยุดตรงนี้\n\nการถอนทดสอบของเรายืนยันใน 41 นาที นั่นคือผลิตภัณฑ์ ส่วนอื่น — ล็อบบี้ แชทสด โบนัส — สร้างรอบการรักษารางนั้นให้สะอาด\n\nข้อเสนอไม่ต้องฝากและฟรีสปินเข้าเครดิตโดยไม่ต้องเปิดตั๋ว หมดอายุสั้น จึงถือเป็นทดลอง ไม่ใช่แผน	{ถอนคริปโตไม่ถึงหนึ่งชั่วโมง,ข้อเสนอไม่ต้องฝากและฟรีสปินที่เข้าเครดิตจริง,"แคชเชียร์เรียบ ไม่รก"}	{"คริปโตอย่างเดียว — ไม่มีบัตรหรือธนาคาร",แคตตาล็อกยังบาง}	\N	\N
cmtg6xgel000xzrl53np5vb9h	cmtfyan8k000oqnf0ev5bcsao	zh	Sable Room	Sable Room 不装成老虎机目的地。你为 Evolution 桌而来，收银台靠谱就留下，其余放下。\n\n它确实靠谱。PayPal 和银行出款在首次文件核验后都是当天到账。\n\n75% 匹配面向桌面玩家。流水公平；真人游戏贡献公开，没有埋。	{真人桌就是全部意义，而且运营得好,"PayPal 和银行都可用",首次审核后当天出款}	{老虎机库像事后补的,"Kahnawake 牌照对部分玩家较陌生"}	\N	\N
cmtg6xgpp000zzrl5m9k7s20h	cmtfyan8k000oqnf0ev5bcsao	th	Sable Room	Sable Room ไม่แสร้งเป็นจุดหมายสล็อต มาเพราะโต๊ะ Evolution อยู่ต่อถ้าแคชเชียร์ประพฤติตัว และปล่อยส่วนที่เหลือ\n\nมันประพฤติตัว PayPal และการถอนธนาคารกลับวันเดียวกันหลังตรวจเอกสารครั้งแรก\n\nแมตช์ 75% มุ่งผู้เล่นโต๊ะ เทิร์นยุติธรรม น้ำหนักจากเกมสดประกาศไว้ ไม่ถูกฝัง	{"โต๊ะสดคือจุดทั้งหมด และบริหารได้ดี","มีทั้ง PayPal และธนาคาร",ถอนวันเดียวกันหลังตรวจครั้งแรก}	{คลังสล็อตเป็นของแถมทีหลัง,"ใบอนุญาต Kahnawake ผู้เล่นบางคนคุ้นน้อยกว่า"}	\N	\N
cmtg6xh6c0011zrl5406woc47	cmtfyao5v000rqnf04w2cemkd	zh	Cinder Park	Cinder Park 在名单上，是因为免存款额度真到了。门槛很低，多数运营商仍过不了。\n\n别冲着速度来。出款两三天，目录也不够深，撑不起长住。\n\n当试用柜台。若 $25 能提出来、桌子也对口味，可以。它不是整笔资金的首选。	{新账户有真正的免存款额度,试大厅门槛低,"第一天就能用 PayPal"}	{出款要两三天,游戏列表短且不均}	\N	\N
cmtg6xhhg0013zrl5x4wdp5ci	cmtfyao5v000rqnf04w2cemkd	th	Cinder Park	Cinder Park อยู่ในรายการนี้เพราะเครดิตไม่ต้องฝากมาจริง นั่นคือมาตรฐานต่ำ และผู้ให้บริการส่วนใหญ่ยังพลาด\n\nอย่ามาเพราะความเร็ว ถอนสองถึงสามวัน และแคตตาล็อกไม่ลึกพอจะอยู่ยาว\n\nถือเป็นโต๊ะทดลอง ถ้า $25 เคลียร์แล้วชอบโต๊ะ ก็ได้ ไม่ใช่คำแนะนำแรกสำหรับเงินทุนเต็มก้อน	{เครดิตไม่ต้องฝากจริงสำหรับบัญชีใหม่,กำแพงต่ำในการลองล็อบบี้,"PayPal ใช้ได้ตั้งแต่วันแรก"}	{การถอนใช้เวลาสองถึงสามวัน,รายการเกมสั้นและไม่สม่ำเสมอ}	\N	\N
cmtg6xhy30015zrl58sv85raw	cmtfyap3d000uqnf0aexlr3do	zh	Harbor Line	Harbor Line 是这张桌上英国形状的运营商：优惠更安静，工具更清楚，需要升级时牌照有分量。\n\n核验后出款一天内到账。迎新匹配刻意偏小。这是英国市场，不是产品失败。\n\n若要不受限的目录和更响的优惠，看 MGA 或 Curaçao 那些名字。若要文件，留在这里。	{"全程 UKGC 牌照",负责任博彩工具清楚,"核验后 24 小时出款"}	{优惠比离岸柜台克制,部分游戏有地域限制}	\N	\N
cmtg6xi980017zrl5gc69s8c9	cmtfyap3d000uqnf0aexlr3do	th	Harbor Line	Harbor Line คือผู้ให้บริการรูปสหราชอาณาจักรบนโต๊ะนี้: โบนัสเงียบกว่า เครื่องมือชัดกว่า และใบอนุญาตที่มีความหมายถ้าต้องยกระดับเรื่อง\n\nการถอนเข้าบัญชีในหนึ่งวันหลังยืนยัน แมตช์ต้อนรับเล็กโดยตั้งใจ นั่นคือตลาดสหราชอาณาจักร ไม่ใช่ความล้มเหลวของผลิตภัณฑ์\n\nถ้าอยากได้แคตตาล็อกไม่จำกัดและข้อเสนอดังกว่า ให้ดูชื่อ MGA หรือ Curaçao ถ้าอยากได้เอกสาร อยู่ที่นี่	{"ใบอนุญาต UKGC ตลอดสาย",เครื่องมือเล่นพนันอย่างปลอดภัยชัดเจน,"ถอน 24 ชั่วโมงเมื่อยืนยันแล้ว"}	{ข้อเสนอพอประมาณเมื่อเทียบกับโต๊ะนอกชายฝั่ง,บางเกมจำกัดตามภูมิศาสตร์}	\N	\N
cmtg6xj12001bzrl577e5kxkm	cmtfyaq0o000xqnf0sg4drjb5	th	Quartz Bet	Quartz Bet คือโต๊ะสล็อต Hacksaw, Pragmatic และ Play’n GO สต็อกเหมือนร้านที่รู้จักลูกค้า โต๊ะสดมีอยู่ แต่ไม่ใช่เหตุผลเปิดบัญชี\n\nต้อนรับคือห้าสิบสปิน เงินรางวัลอยู่หลัง 40x ดีในฐานะชิม ไม่ดีในฐานะแผนเงินทุน\n\nใบอนุญาตมอลตาและแคชเชียร์ผสม (คริปโตบวก PayPal) ทำให้คะแนนความน่าเชื่อถือสูงกว่าคะแนนบริการ แชทสุภาพและช้า	{แคตตาล็อกสล็อตลึกและทันสมัย,ใบอนุญาตมอลตา,"คริปโตและ PayPal ใช้ได้ทั้งคู่"}	{"ต้อนรับมีแค่สปิน — ไม่มีแมตช์เงินสด",แชทสดช้ากว่าที่ล็อบบี้ออกจะบอก}	\N	\N
cmtg6xjhq001dzrl51nafbeby	cmtfyar4j0010qnf0wvhpo1rc	zh	Atlas Table	Atlas Table 是卡世界里的银行转账运营商。若那是你的通道，收银台对它格外仔细。若要即时，看 Opal 或 Nova。\n\n$750 匹配是头条。流水合理。等待是代价：我们测试里出去要三到五天。\n\n大厅是 NetEnt，其余不多。冲收银台来，别冲目录。	{银行转账是一等舱，不是边角料,若能等出款，匹配很慷慨,"Gibraltar 牌照"}	{出款要三到五天,"大厅偏 NetEnt，其余很少"}	\N	\N
cmtg6xjsx001fzrl5o6octx2h	cmtfyar4j0010qnf0wvhpo1rc	th	Atlas Table	Atlas Table คือผู้ให้บริการโอนธนาคารในโลกของบัตร ถ้านั่นคือรางของคุณ แคชเชียร์ระมัดระวังกับมันผิดปกติ ถ้าอยากได้ทันที ให้ดู Opal หรือ Nova\n\nแมตช์ $750 คือพาดหัว เทิร์นสมเหตุสมผล การรอคือต้นทุน: สามถึงห้าวันขาออกในการทดสอบของเรา\n\nล็อบบี้คือ NetEnt และไม่มากไปกว่านั้น มาเพราะแคชเชียร์ ไม่ใช่แคตตาล็อก	{"โอนธนาคารเป็นชั้นหนึ่ง ไม่ใช่ของเหลือ",แมตช์ใจกว้างถ้าคุณรอการถอนได้,"ใบอนุญาต Gibraltar"}	{การถอนใช้เวลาสามถึงห้าวัน,"ล็อบบี้เน้น NetEnt นอกนั้นน้อย"}	\N	\N
cmtg6xk9q001hzrl544jvn93l	cmtfyas1u0013qnf01wyf6ws7	zh	Ridge Play	Ridge Play 今年上线。我们列它是因为收银台已经能用 — 不是因为目录准备好了。\n\n$100 上限的 200% 匹配是营销话术。流水 40x，有效期短。免存款额度是更诚实的入口。\n\n在有一年公开出款记录之前，信任分保持保守。若要成品，稍后再来。	{新，出款已经不到十二小时,"上线就有加密货币、银行卡和 PayPal",给试用者的免存款额度}	{太新，给不满信任分,"只有 Hacksaw 的目录显得薄"}	\N	\N
cmtg6xkkw001jzrl5u4prk38y	cmtfyas1u0013qnf01wyf6ws7	th	Ridge Play	Ridge Play เปิดตัวปีนี้ เราใส่ไว้เพราะแคชเชียร์ใช้ได้แล้ว — ไม่ใช่เพราะแคตตาล็อกพร้อม\n\nแมตช์ 200% บนเพดาน $100 คือประโยคการตลาด เทิร์น 40x และหมดอายุสั้น เครดิตไม่ต้องฝากคือทางเข้าที่ซื่อกว่า\n\nความน่าเชื่อถือยังระมัดระวังจนกว่าจะมีประวัติถอนสาธารณะหนึ่งปี กลับมาทีหลังถ้าอยากได้ผลิตภัณฑ์ที่เสร็จแล้ว	{"ใหม่ และการถอนไม่ถึงสิบสองชั่วโมงแล้ว","คริปโต บัตร และ PayPal ตั้งแต่เปิดตัว",เครดิตไม่ต้องฝากสำหรับผู้ทดลอง}	{ใหม่เกินไปสำหรับคะแนนความน่าเชื่อถือเต็ม,"แคตตาล็อกมีแต่ Hacksaw รู้สึกบาง"}	\N	\N
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, slug, status, "createdAt", "updatedAt") FROM stdin;
cmtg1bx09002fsrbappc1lsrm	crypto-casinos	published	2026-08-30 16:39:52.281	2026-09-03 13:44:42.546
cmtg1byjs002isrbagdz0c8r3	fast-payouts	published	2026-08-30 16:39:54.281	2026-09-03 13:44:45.528
cmtg1bzmj002lsrbaepd99x3w	live-dealer	published	2026-08-30 16:39:55.477	2026-09-03 13:44:48.764
cmtg1c0jq002osrbaxzg4acdv	mobile-casinos	published	2026-08-30 16:39:56.87	2026-09-03 13:44:51.742
\.


--
-- Data for Name: CategoryTranslation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CategoryTranslation" (id, "categoryId", locale, name, description, "seoTitle", "seoDescription", methodology) FROM stdin;
cmtg6xxph0039zrl5tyza0qqu	cmtg1bx09002fsrbappc1lsrm	zh	最佳加密货币娱乐场	真正用数字资产结算的运营商 — 不是收银台贴个比特币图标。按存款是否干净到账、出款是否按时、客服是否把钱包请求当正经工单来排名。	2026 最佳加密货币娱乐场	独立的加密友好娱乐场排名。我们看结算速度、币种支持，以及出款会不会被绕圈子。	加密货币标签本身不是排名标准。上榜的都是我们用评测同一账户、至少用一种数字资产（通常是 BTC 或 USDT）完成过存款和出款的运营商。\n\n速度比币种数量更重要。两币种能在承诺时间内到账的，排在列出十几种网络却第一笔就卡住的前面。网络费和最低限额看收银台，不看博客。\n\n牌照仍然重要。加密货币不能替代出款被扣时的追索途径。马耳他和直布罗陀的手续，比库拉索印章配 Telegram 收银台更有分量。
cmtg6xy68003bzrl5ahb6yk8d	cmtg1bx09002fsrbappc1lsrm	th	คาสิโนคริปโตที่ดีที่สุด	ผู้ให้บริการที่เคลียร์ด้วยสินทรัพย์ดิจิทัลจริง — ไม่ใช่แค่โลโก้บิตคอยน์ที่หน้าแคชเชียร์ จัดอันดับจากความเรียบของการฝาก ความเร็วในการถอน และว่าฝ่ายบริการรับเรื่องวอลเล็ตเหมือนตั๋วจริงหรือไม่	คาสิโนคริปโตที่ดีที่สุด 2026	อันดับอิสระของคาสิโนที่รองรับคริปโต เราให้คะแนนความเร็วในการเคลียร์ การรองรับเหรียญ และการถอนที่ไม่ถูกปัดไปมา	ป้ายคริปโตไม่ใช่เกณฑ์จัดอันดับ เราลงเฉพาะรายที่เราฝากและถอนด้วยสินทรัพย์ดิจิทัลอย่างน้อยหนึ่งชนิด — มักเป็น BTC หรือ USDT — ในบัญชีเดียวกับที่ใช้เขียนรีวิว\n\nความเร็วสำคัญกว่าจำนวนเหรียญ รายที่เคลียร์สองเหรียญในเวลาที่โฆษณา จะอยู่เหนือรายที่โชว์สิบกว่าเครือข่ายแล้วยืดในคำขอแรก ค่าธรรมเนียมและขั้นต่ำอ่านที่แคชเชียร์ ไม่ใช่ในบล็อก\n\nใบอนุญาตยังสำคัญ คริปโตทดแทนช่องทางร้องเรียนเมื่อการถอนถูกพักไม่ได้ เอกสาร MGA และยิบรอลตาร์มีน้ำหนักมากกว่าตราคูราเซาคู่กับแคชเชียร์ในเทเลแกรม
cmtg6xymy003dzrl5c9el30ws	cmtg1byjs002isrbagdz0c8r3	zh	出款最快	说到就能出款的品牌。这份榜单看的是第一次核验之后收银台的表现 — 不是只适用于存款的首页“即时到账”。	2026 出款最快的娱乐场	按真实出款速度排名。当天到账的银行卡、两小时内的加密货币，以及点了出金后不会再发明一轮核验的收银台。	这里的每一家都给我们出过款。我们在完成 KYC 后，用游戏同一账户申请出款，记录的是从申请到资金到账的时间 — 不是进入“处理中”的时间。\n\n当天银行卡和两小时内加密货币排在最前。“24 小时”只要诚实就可以接受。只有按下出金按钮才出现的“审核中”，会直接拉低名次。\n\n迎新优惠再大也买不进这份榜。收银台慢，优惠就只是多几步的拖延。我们宁愿推荐当天下午就能到账、看起来不那么热闹的优惠。
cmtg6xyy4003fzrl5tb0crj9h	cmtg1byjs002isrbagdz0c8r3	th	ถอนเร็วที่สุด	แบรนด์ที่ถอนได้ตามที่บอก รายการนี้จัดจากพฤติกรรมแคชเชียร์หลังตรวจเอกสารครั้งแรก — ไม่ใช่คำว่า “ทันที” บนหน้าแรกที่ใช้ได้แค่ตอนฝาก	คาสิโนถอนเร็วที่สุด 2026	จัดอันดับตามความเร็วถอนจริง บัตรเข้าวันเดียวกัน คริปโตในสองชั่วโมง และแคชเชียร์ที่ไม่ invent การตรวจเพิ่มหลังคุณกดถอน	ทุกผู้ให้บริการที่นี่จ่ายเงินออกให้เราแล้ว เราขอถอนจากบัญชีเดียวกับที่ใช้เล่น หลัง KYC ครบ และจับเวลาจากคำขอถึงเงินเข้า — ไม่ใช่เวลาไปสถานะ “กำลังดำเนินการ”\n\nบัตรวันเดียวกันและคริปโตในสองชั่วโมงอยู่บนสุด “24 ชั่วโมง” รับได้ถ้าพูดตรง “รอตรวจสอบ” ที่โผล่หลังกดถอนเท่านั้น คือตัวทำลายอันดับ\n\nโบนัสต้อนรับก้อนใหญ่ซื้อที่บนรายการนี้ไม่ได้ ถ้าแคชเชียร์ช้า โบนัสก็เป็นแค่ความล่าช้าที่เพิ่มขั้นตอน เราอยากส่งคุณไปข้อเสนอที่เงียบกว่าแต่อยู่ในบัญชีบ่ายวันเดียวกัน
cmtg6xzes003hzrl5fl2despt	cmtg1bzmj002lsrbaepd99x3w	zh	最佳真人荷官	看起来有人值守、公平、运转正常的工作室和牌桌 — 有真实限红的 Evolution 场，不是三张空的二十一点桌加卡顿直播。按桌台深度、画面质量，以及高峰时段大厅是否还能玩来排名。	2026 最佳真人荷官娱乐场	按工作室质量、桌台深度，以及大厅忙碌时场地是否还能运转来排名 — 不是看列出了多少间空房间。	我们会坐下玩。直播稳定性、荷官节奏，以及晚餐高峰是否真有座位，比首页的厂商标志更重要。\n\nEvolution 是常见的场地，但不等于自动第一。只有三张二十一点桌的薄嵌入，排在大厅更完整、旁边 NetEnt 或 Pragmatic 也保养良好的后面。\n\n限红和核验也是产品的一部分。百家乐结束后出款扣三天的漂亮工作室，不该靠近真人荷官榜的顶端。
cmtg6xzpw003jzrl5o8bkru1m	cmtg1bzmj002lsrbaepd99x3w	th	ดีลเลอร์สดที่ดีที่สุด	สตูดิโอและโต๊ะที่มีคนดูแล ยุติธรรม และเดินเครื่องดี — พื้น Evolution ที่มีลิมิตจริง ไม่ใช่ที่นั่งแบล็คแจ็กว่างสามที่กับสตรีมกระตุก จัดจากความลึกของโต๊ะ คุณภาพสตรีม และว่าล็อบบี้ยังเล่นได้ในชั่วโมงเร่งหรือไม่	คาสิโนดีลเลอร์สดที่ดีที่สุด 2026	จัดอันดับคาสิโนดีลเลอร์สดจากคุณภาพสตูดิโอ ความลึกของโต๊ะ และว่าพื้นยังทำงานเมื่อล็อบบี้แน่น — ไม่ใช่จากจำนวนห้องว่างที่ลิสต์ไว้	เรานั่งโต๊ะจริง ความนิ่งของสตรีม จังหวะดีลเลอร์ และว่ามีที่นั่งจริงในชั่วโมงเย็น สำคัญกว่าโลโก้ผู้ให้บริการบนหน้าแรก\n\nEvolution เป็นพื้นปกติ แต่ไม่ได้ที่หนึ่งอัตโนมัติ — การฝัง Evolution บาง ๆ สามที่นั่งแบล็คแจ็ก อยู่ต่ำกว่าล็อบบี้ที่เต็มกว่าและยังดูแล NetEnt หรือ Pragmatic ข้าง ๆ ได้ดี\n\nลิมิตและการยืนยันตัวตนเป็นส่วนหนึ่งของผลิตภัณฑ์ สตูดิโอสวยที่พักการถอนสามวันหลังเซสชันบาคาร่า ไม่สมควรอยู่ใกล้ยอดรายการดีลเลอร์สด
cmtg6y06j003lzrl5q5ivwyp4	cmtg1c0jq002osrbaxzg4acdv	zh	最佳手机娱乐场	在手机上站得住的大厅，而不是被裁切的桌面版。按收银台是否清楚、真人桌是否好用，以及你能否存款、游戏、申请出款而不必捏着 1280 像素的布局来排名。	2026 最佳手机娱乐场	按真实手机使用来排名：收银台、真人桌，以及浏览器或 App 里能用的出款 — 不是缩小的桌面大厅。	我们先在手机上测。如果收银台、客服聊天或出款表单必须桌面宽度，无论桌面评分多高，都不会进这份榜。\n\n独立 App 只有在不藏更差条款或更弱收银台时才算加分。布局干净的浏览器，往往好过只为推送优惠而存在的商店应用。\n\n真人桌和加密收银台是手机上最常见的翻车点。两者都能单手用的运营商，排在出金一刻就垮掉的漂亮老虎机大厅前面。
cmtg6y0ho003nzrl5bsxwrm2i	cmtg1c0jq002osrbaxzg4acdv	th	คาสิโนมือถือที่ดีที่สุด	ล็อบบี้ที่อยู่ได้บนมือถือโดยไม่กลายเป็นเดสก์ท็อปที่ถูกครอป จัดจากความชัดของแคชเชียร์ การใช้โต๊ะสด และว่าคุณฝาก เล่น และขอถอนได้โดยไม่ต้องหยิกเลย์เอาต์ 1280 พิกเซล	คาสิโนมือถือที่ดีที่สุด 2026	จัดอันดับคาสิโนมือถือจากการใช้โทรศัพท์จริง: แคชเชียร์ โต๊ะสด และการถอนที่ใช้ได้ในเบราว์เซอร์หรือแอป — ไม่ใช่ล็อบบี้เดสก์ท็อปที่ย่อมา	เราทดสอบบนมือถือก่อน ถ้าแคชเชียร์ แชทฝ่ายบริการ หรือฟอร์มถอนต้องใช้ความกว้างเดสก์ท็อป ผู้ให้บริการจะไม่ขึ้นรายการนี้ — ไม่ว่าคะแนนเดสก์ท็อปจะเท่าไร\n\nแอปเฉพาะทางเป็นข้อได้เปรียบเฉพาะเมื่อไม่ซ่อนเงื่อนไขแย่กว่าหรือแคชเชียร์อ่อนกว่า การเล่นในเบราว์เซอร์ที่จัดเลย์เอาต์ดี มักชนะแอปในสโตร์ที่มีไว้ส่งข้อเสนอพุช\n\nโต๊ะสดและแคชเชียร์คริปโตคือจุดพังปกติบนมือถือ รายที่ทำให้ทั้งสองใช้มือเดียวได้ จะอยู่เหนือล็อบบี้สล็อตสวยที่พังทันทีเมื่อคุณพยายามถอน
cmtlku2b600ijxcc8gj3bupzd	cmtg1bx09002fsrbappc1lsrm	en	Best Crypto Casinos	Operators that actually settle in digital assets — not a Bitcoin logo parked on the cashier. Ranked by how cleanly deposits land, how quickly withdrawals clear, and whether support treats a wallet request like a real ticket.	Best Crypto Casinos 2026	Independent ranking of crypto-friendly casinos. We score settlement speed, coin support, and whether withdrawals clear without a runaround.	A crypto badge is not a ranking criterion. We only list operators we have funded and withdrawn from with at least one digital asset — usually BTC or USDT — under the same account we use for the written review.\n\nSpeed outweighs coin count. A desk that clears two coins inside the window it advertises ranks above one that lists a dozen networks and stalls on the first request. Network fees and minimums are read in the cashier, not the blog.\n\nLicensing still matters. Crypto does not replace recourse when a withdrawal is held. MGA and Gibraltar paperwork carries more weight than a Curaçao stamp paired with a Telegram cashier.
cmtlku4rk00imxcc8zzu9fnqf	cmtg1byjs002isrbagdz0c8r3	en	Fastest Payouts	Brands that clear withdrawals when they say they will. This list is ranked on cashier behaviour after the first document check — not on a homepage promise of “instant” that only applies to the deposit.	Fastest Casino Payouts 2026	Casinos ranked by real withdrawal speed. Same-day cards, sub-two-hour crypto, and desks that do not invent extra checks after you request a cash-out.	Every operator here has paid us out. We request a withdrawal on the same account used for gameplay, after KYC is complete, and we record the time from request to funds received — not the time to “processing.”\n\nSame-day cards and sub-two-hour crypto sit at the top. “24 hours” is acceptable when it is honest. “Pending review” that appears only after the cash-out button is pressed is a rank killer.\n\nA large welcome bonus does not buy a place on this list. If the cashier is slow, the bonus is a delay with extra steps. We would rather send you to a quieter offer that lands in the account the same afternoon.
cmtlku73w00ipxcc8o38qt52o	cmtg1bzmj002lsrbaepd99x3w	en	Best Live Dealer	Studios and tables that feel staffed, fair, and well-run — Evolution floors with real limits, not three empty blackjack seats and a laggy stream. Ranked on table depth, stream quality, and whether the lobby is still playable at peak hours.	Best Live Dealer Casinos 2026	Live dealer casinos ranked on studio quality, table depth, and whether the floor still works when the lobby is busy — not on how many empty rooms are listed.	We sit the tables. Stream stability, dealer pacing, and whether a seat is actually available at dinner-hour traffic count more than a provider logo on the homepage.\n\nEvolution is the usual floor. That is not automatic first place — a thin Evolution embed with three blackjack seats ranks below a fuller lobby that also keeps NetEnt or Pragmatic in good shape beside it.\n\nLimits and verification are part of the product. A beautiful studio that holds a withdrawal for three days after a baccarat session does not belong near the top of a live-dealer list.
cmtlku9em00isxcc8bglv29u5	cmtg1c0jq002osrbaxzg4acdv	en	Best Mobile Casinos	Lobbies that hold up on a phone without turning into a cropped desktop. Ranked on cashier clarity, live-table usability, and whether you can deposit, play, and request a withdrawal without pinching a 1280-pixel layout.	Best Mobile Casinos 2026	Mobile casinos ranked on real phone use: cashier, live tables, and withdrawals that work in a browser or app — not a shrunk desktop lobby.	We test on a phone first. If the cashier, support chat, or withdrawal form requires desktop width, the operator does not make this list — regardless of the desktop score.\n\nA dedicated app is a plus only when it does not hide worse terms or a weaker cashier. Browser play that is simply well laid out often beats a store listing that exists to send push offers.\n\nLive tables and crypto cashiers are the usual failure points on mobile. Operators that keep both usable one-handed sit above pretty slot lobbies that collapse the moment you try to cash out.
\.


--
-- Data for Name: License; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."License" (id, slug) FROM stdin;
license_mga	mga
license_curacao	curacao
license_gibraltar	gibraltar
license_ukgc	ukgc
license_kahnawake	kahnawake
\.


--
-- Data for Name: LicenseTranslation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LicenseTranslation" (id, "licenseId", locale, name) FROM stdin;
license_tr_mga_en	license_mga	en	Malta Gaming Authority
license_tr_curacao_en	license_curacao	en	Curaçao eGaming
license_tr_gibraltar_en	license_gibraltar	en	Gibraltar Gambling Commissioner
license_tr_ukgc_en	license_ukgc	en	UK Gambling Commission
license_tr_kahnawake_en	license_kahnawake	en	Kahnawake Gaming Commission
\.


--
-- Data for Name: Market; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Market" (id, code) FROM stdin;
cmtliokpq0000kt5kmtnlny2q	US
cmtliooet0007kt5kh90xrpcq	GB
cmtlios46000ekt5kxzklmswy	CA
cmtliovta000lkt5kpk6in1x4	AU
cmtlioznz000skt5k6xctkjo6	DE
cmtlip3cr000zkt5kaihy8wpo	TH
cmtlip71p0016kt5kk5vilqt2	CN
cmtlipawh001dkt5k2w5fhv76	PH
cmtlipelm001kkt5kzv5hss7p	MY
cmtlipiau001rkt5k9xp52m8r	SG
cmtlj2vhp000012ooh1b4yz5f	AW
cmtlj2xnd000312ooenn2lwor	AF
cmtlj2zso000612oomyxcd33z	AO
cmtlj31y0000912oocn2b57ql	AI
cmtlj343h000c12ooo41lig71	AX
cmtlj36eh000f12ooidvhsjxb	AL
cmtlj38ju000i12oojuy44krl	AD
cmtlj3ap9000l12ooqtlhq2ob	AE
cmtlj3cuo000o12oo1llrxbu0	AR
cmtlj3ezw000r12ooxzu7muou	AM
cmtlj3h5d000u12ooosudagio	AS
cmtlj3jgb000x12oo3q2ix5p2	AQ
cmtlj3llr001012ooxr1xuf4d	TF
cmtlj3nr5001312oo3qqq19z4	AG
cmtlj3vl9001d12oorem09o61	AT
cmtlj3xqh001g12ootwcqkv0b	AZ
cmtlj3zvu001j12oo2wiaplpq	BI
cmtlj421f001m12ooprctifbp	BE
cmtlj446r001p12oo3brs2b0b	BJ
cmtlj46c0001s12oojzjz1c4q	BF
cmtlj48mw001v12ooinrtpbtv	BD
cmtlj4as1001y12ooq4i68jp4	BG
cmtlj4cxi002112ooynn344lv	BH
cmtlj4f2v002412oonc48fou7	BS
cmtlj4h88002712ooqsnkrwhg	BA
cmtlj4jdq002a12oouj15pjwe	BL
cmtlj4loj002d12ootj1eviof	SH
cmtlj4ntt002g12oofoxnr3yv	BY
cmtlj4q0j002j12oogl2xloi2	BZ
cmtlj4s5s002m12oo8a5a1s5n	BM
cmtlj4ub2002p12ookp7mnk1x	BO
cmtlj4wh1002s12oo8atttk67	BQ
cmtlj4yrz002v12ooh0ht24ey	BR
cmtlj50x8002y12ooppyo6no4	BB
cmtlj532o003112oo6eonywck	BN
cmtlj557y003412oosozg8lmf	BT
cmtlj57de003712oow0ws56yl	BV
cmtlj59in003a12oo7l7ophas	BW
cmtlj5bte003d12oo6hjaaw2k	CF
cmtlj5jhy003n12ooxdwmvzgy	CC
cmtlj5ln5003q12ook6p7f52d	CH
cmtlj5nxw003t12oo69e712u4	CL
cmtlj5vni004312oo243ctwj5	CI
cmtlj5xss004612ooex452jau	CM
cmtlj603l004912oo3s9p2nbx	CD
cmtlj628r004c12oo7560jzfb	CG
cmtlj64e2004f12oo1nplc05n	CK
cmtlj66ja004i12oof1pd8fdg	CO
cmtlj68or004l12oo7vw2jwzo	KM
cmtlj6au3004o12ooi804qhsu	CV
cmtlj6d4x004r12ooa4c3k3td	CR
cmtlj6fac004u12oo8wu6qruh	CU
cmtlj6hg2004x12ooq0mwhbog	CW
cmtlj6jlc005012ooox7px0ds	CX
cmtlj6lqm005312oom1teziyw	KY
cmtlj6nvt005612oouuhq6n5j	CY
cmtlj6q6m005912ooxrct7wun	CZ
cmtlj6xuw005j12oo1mat88l2	DJ
cmtlj700a005m12ookls1wql8	DM
cmtlj72b4005p12ooyvs9xjq4	DK
cmtlj74gg005s12oodqbjjkuu	DO
cmtlj76lp005v12oo4ys7m6kj	DZ
cmtlj78r2005y12oocs522cvc	EC
cmtlj7awc006112oo5h26wi3o	EG
cmtlj7d3l006412oofj01xadu	ER
cmtlj7fej006712oocws97b7c	EH
cmtlj7hju006a12oo0445mboy	ES
cmtlj7jpe006d12ootp92skuk	EE
cmtlj7lum006g12ooi1uxpw43	ET
cmtlj7o00006j12ootjs7s7pv	FI
cmtlj7q54006m12oo4lb40t2e	FJ
cmtlj7sfv006p12oo4w5ippdb	FK
cmtlj7ulu006s12ooyqovpkkj	FR
cmtlj7wr3006v12oow48miclb	FO
cmtlj7ywc006y12ooccj6drbe	FM
cmtlj811l007112oonb3hdnz4	GA
cmtlj88v1007b12oo5hnh5eja	GE
cmtlj8b0b007e12oofms5op1r	GG
cmtlj8d5l007h12oofpb13s4u	GH
cmtlj8fat007k12ootw0nmnk8	GI
cmtlj8hlo007n12oo4xtrpsb1	GN
cmtlj8kua007q12ooaubf3br4	GP
cmtlj8mz8007t12oo2idu8um6	GM
cmtlj8p48007w12ookppx069y	GW
cmtlj8r98007z12oo76fy1zhb	GQ
cmtlj8tjj008212ooquq1ke5o	GR
cmtlj8vot008512oov4xbxn8c	GD
cmtlj8xtz008812oot9pnkzlq	GL
cmtlj8zz5008b12oopjeqofh1	GT
cmtlj924a008e12ooi10i9qdg	GF
cmtlj949m008h12oooqijos8v	GU
cmtlj96kd008k12oo65v4k39p	GY
cmtlj98pq008n12oox1fvd3tb	HK
cmtlj9bzw008q12oosjygdk2m	HM
cmtlj9e5l008t12ookfb2jx2p	HN
cmtlj9gbe008w12ook9rt86ze	HR
cmtlj9ihd008z12ooa27jyogg	HT
cmtlj9kn4009212oo9cmrvlzy	HU
cmtlj9msq009512oo56qpmvi7	ID
cmtlj9p3z009812oo66vekw4y	IM
cmtlj9r9z009b12ooj1tyhstj	IN
cmtlj9tfr009e12oorottm7vl	IO
cmtlj9vlg009h12oowzewibwe	IE
cmtlj9wf60030c262j1vj94u6	IR
cmtlj9wf60031c2624ug6fgbo	IQ
cmtlj9wf60032c262gb5r8emx	IS
cmtlj9wf60033c2621m31mnf0	IL
cmtlj9wf60034c262qfvr2wgp	IT
cmtlj9wf60035c262m5kqmvat	JM
cmtlj9wf60036c262z9ggzsen	JE
cmtlj9wf60037c262r61lyovb	JO
cmtlj9wf60038c262e5w6u5ew	JP
cmtlj9wf60039c262sslmspgb	KZ
cmtlj9wf6003ac262l6ls5eax	KE
cmtlj9wf6003bc262hqfa44ot	KG
cmtlj9wf6003cc262ap5oz8al	KH
cmtlj9wf6003dc262xrkq1m7s	KI
cmtlj9wf6003ec262tdh37dw9	KN
cmtlj9wf6003fc262sju4zy7q	KR
cmtlj9wf6003gc26262sw1orx	XK
cmtlj9wf6003hc262xbyrv4dd	KW
cmtlj9wf6003ic262mcumi69a	LA
cmtlj9wf6003jc262x3etwxnq	LB
cmtlj9wf6003kc262shgw4bpc	LR
cmtlj9wf6003lc262yvmved5f	LY
cmtlj9wf6003mc262djy1s1nj	LC
cmtlj9wf6003nc2623j6h68mq	LI
cmtlj9wf6003oc262ek7yox9d	LK
cmtlj9wf6003pc262kprgtbuk	LS
cmtlj9wf6003qc262ug3u6mrc	LT
cmtlj9wf6003rc262lrn2sm30	LU
cmtlj9wf6003sc2626b6xdkda	LV
cmtlj9wf6003tc262a1l4ni4t	MO
cmtlj9wf6003uc26223loqzkl	MF
cmtlj9wf6003vc262gl1k0j27	MA
cmtlj9wf6003wc262ugj8jl4t	MC
cmtlj9wf6003xc262ez4o1bez	MD
cmtlj9wf6003yc2625nj4eg7s	MG
cmtlj9wf6003zc262hljjbevj	MV
cmtlj9wf60040c262h03wpioz	MX
cmtlj9wf60041c2624m6sc8mn	MH
cmtlj9wf60042c262c24zujlo	MK
cmtlj9wf60043c262z7w1w3jv	ML
cmtlj9wf60044c262qqjx61cp	MT
cmtlj9wf60045c262eo6alm95	MM
cmtlj9wf60046c262yke6svc3	ME
cmtlj9wf60047c262su41evw0	MN
cmtlj9wf60048c262w1gumd0f	MP
cmtlj9wf60049c262254h23kx	MZ
cmtlj9wf6004ac262f3d023j8	MR
cmtlj9wf6004bc262ih95w6uy	MS
cmtlj9wf6004cc262mmdseymj	MQ
cmtlj9wf6004dc26204fechg9	MU
cmtlj9wf6004ec262zbf4g9he	MW
cmtlj9wf6004gc2625es5fxji	YT
cmtlj9wf6004hc262tuflvnc3	NA
cmtlj9wf6004ic262r7crg5pc	NC
cmtlj9wf6004jc262nofeonun	NE
cmtlj9wf6004kc262h3112pxf	NF
cmtlj9wf6004lc262ujw60nc8	NG
cmtlj9wf6004mc262x1avrvdg	NI
cmtlj9wf6004nc262g0121pvo	NU
cmtlj9wf6004oc262ey4f20z9	NL
cmtlj9wf6004pc262cq0bi4oq	NO
cmtlj9wf6004qc262czpyfrrn	NP
cmtlj9wf6004rc2622fbe49ba	NR
cmtlj9wf6004sc2624my8eewl	NZ
cmtlj9wf6004tc262ywgbp5uj	OM
cmtlj9wf6004uc262jh0d8yc7	PK
cmtlj9wf6004vc2626vdv4ofh	PA
cmtlj9wf6004wc262zjam1fts	PN
cmtlj9wf6004xc2626bigjiyy	PE
cmtlj9wf7004zc262b5og02ga	PW
cmtlj9wf70050c262ka20z1ys	PG
cmtlj9wf70051c262o4ogbw1o	PL
cmtlj9wf70052c262sazx0r16	PR
cmtlj9wf70053c262v9rtvv4y	KP
cmtlj9wf70054c26241738cr4	PT
cmtlj9wf70055c26242yiv3rq	PY
cmtlj9wf70056c26237fvpely	PS
cmtlj9wf70057c2624zph9xim	PF
cmtlj9wf70058c262me6shtrz	QA
cmtlj9wf70059c262fwstcpbf	RE
cmtlj9wf7005ac2622v3ix15y	RO
cmtlj9wf7005bc262dqptuxcx	RU
cmtlj9wf7005cc262r8z2z8ps	RW
cmtlj9wf7005dc2625j9ti0n7	SA
cmtlj9wf7005ec262sw17z1ld	SD
cmtlj9wf7005fc2629nfus0og	SN
cmtlj9wf7005hc2623hip5ksl	GS
cmtlj9wf7005ic262ogq0l03a	SJ
cmtlj9wf7005jc262e5pqpyj2	SB
cmtlj9wf7005kc262zdh9hykk	SL
cmtlj9wf7005lc262b050e1eo	SV
cmtlj9wf7005mc262o1d2ojyr	SM
cmtlj9wf7005nc262c979ez51	SO
cmtlj9wf7005oc26290dqhaa7	PM
cmtlj9wf7005pc262syzqhybb	RS
cmtlj9wf7005qc262l3ofoq0c	SS
cmtlj9wf7005rc262dk7cso4a	ST
cmtlj9wf7005sc262jv0w3bdh	SR
cmtlj9wf7005tc262ycfptdbk	SK
cmtlj9wf7005uc2624tkyo928	SI
cmtlj9wf7005vc262s0evp0lf	SE
cmtlj9wf7005wc2625olgckox	SZ
cmtlj9wf7005xc262i55ka874	SX
cmtlj9wf7005yc262qf9e2p8b	SC
cmtlj9wf7005zc262ekp0cxrx	SY
cmtlj9wf70060c262bz9sxn1y	TC
cmtlj9wf70061c262lo22un4b	TD
cmtlj9wf70062c262h7ppfc2d	TG
cmtlj9wf70064c262ly6j618z	TJ
cmtlj9wf70065c262ungivvp7	TK
cmtlj9wf70066c2628cq2lj4k	TM
cmtlj9wf70067c262831etgk7	TL
cmtlj9wf70068c262sv9uhboa	TO
cmtlj9wf70069c262tph35a67	TT
cmtlj9wf7006ac262wtiysa6f	TN
cmtlj9wf7006bc26260inwzb9	TR
cmtlj9wf7006cc262dziq67ct	TV
cmtlj9wf7006dc26244vx7y5j	TW
cmtlj9wf7006ec262q0r0s6fi	TZ
cmtlj9wf7006fc262oph7xjmk	UG
cmtlj9wf7006gc262t2h4u6uh	UA
cmtlj9wf7006hc262tqv2qyts	UM
cmtlj9wf7006ic262r2mvpic4	UY
cmtlj9wf7006kc262bcrhwl7o	UZ
cmtlj9wf7006lc2625usld5rk	VA
cmtlj9wf7006mc262o98xi6u3	VC
cmtlj9wf7006nc262ewuqimnj	VE
cmtlj9wf7006oc262j4kcqrh1	VG
cmtlj9wf7006pc26297sgu3t8	VI
cmtlj9wf7006qc262hruhd5lq	VN
cmtlj9wf7006rc2629nll47lf	VU
cmtlj9wf7006sc2620l4ybg4l	WF
cmtlj9wf7006tc2626puwnjhh	WS
cmtlj9wf7006uc262y7x33ovn	YE
cmtlj9wf7006vc262nz7g0ocx	ZA
cmtlj9wf7006wc262mzztic2l	ZM
cmtlj9wf7006xc262w1quty5k	ZW
\.


--
-- Data for Name: MarketTranslation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MarketTranslation" (id, "marketId", locale, name) FROM stdin;
cmtliom3o0002kt5kofwu3nan	cmtliokpq0000kt5kmtnlny2q	en	United States
cmtliopsw0009kt5kc0m8yeem	cmtliooet0007kt5kh90xrpcq	en	United Kingdom
cmtlioti1000gkt5kftleekt7	cmtlios46000ekt5kxzklmswy	en	Canada
cmtlioxcq000nkt5k5tnz5ehg	cmtliovta000lkt5kpk6in1x4	en	Australia
cmtlip11u000ukt5keg3sebvr	cmtlioznz000skt5k6xctkjo6	en	Germany
cmtlip4qj0011kt5kfn9g1sqa	cmtlip3cr000zkt5kaihy8wpo	en	Thailand
cmtlip8fm0018kt5k60f1hvee	cmtlip71p0016kt5kk5vilqt2	en	China
cmtlipcac001fkt5kp2nu2xgn	cmtlipawh001dkt5k2w5fhv76	en	Philippines
cmtlipfzg001mkt5k0ujeetag	cmtlipelm001kkt5kzv5hss7p	en	Malaysia
cmtlipjp6001tkt5klss61s2b	cmtlipiau001rkt5k9xp52m8r	en	Singapore
cmtlj2wvn000212oodgwk2dai	cmtlj2vhp000012ooh1b4yz5f	en	Aruba
cmtlj2z10000512oog8x0jhv7	cmtlj2xnd000312ooenn2lwor	en	Afghanistan
cmtlj316b000812oo8q1dt25v	cmtlj2zso000612oomyxcd33z	en	Angola
cmtlj33bt000b12oo27nugu1j	cmtlj31y0000912oocn2b57ql	en	Anguilla
cmtlj35h9000e12oo7dfynuoe	cmtlj343h000c12ooo41lig71	en	Åland Islands
cmtlj37s6000h12ooo8kiqbf1	cmtlj36eh000f12ooidvhsjxb	en	Albania
cmtlj39xh000k12oon17guxab	cmtlj38ju000i12oojuy44krl	en	Andorra
cmtlj3c34000n12oogwwdagpc	cmtlj3ap9000l12ooqtlhq2ob	en	United Arab Emirates
cmtlj3e8a000q12oolvqkb37v	cmtlj3cuo000o12oo1llrxbu0	en	Argentina
cmtlj3gds000t12ooc6qvhwo9	cmtlj3ezw000r12ooxzu7muou	en	Armenia
cmtlj3ion000w12oo5dn17mz3	cmtlj3h5d000u12ooosudagio	en	American Samoa
cmtlj3ku4000z12oo5fz1148f	cmtlj3jgb000x12oo3q2ix5p2	en	Antarctica
cmtlj3mzh001212oowk0w48ij	cmtlj3llr001012ooxr1xuf4d	en	French Southern and Antarctic Lands
cmtlj3p4x001512oounerml1n	cmtlj3nr5001312oo3qqq19z4	en	Antigua and Barbuda
cmtlj3wyy001f12oo5p7q9awq	cmtlj3vl9001d12oorem09o61	en	Austria
cmtlj3z47001i12oocilki5hb	cmtlj3xqh001g12ootwcqkv0b	en	Azerbaijan
cmtlj419w001l12ooqk4p7o1i	cmtlj3zvu001j12oo2wiaplpq	en	Burundi
cmtlj43f4001o12oorzx99slr	cmtlj421f001m12ooprctifbp	en	Belgium
cmtlj45kd001r12oo29q1kj9m	cmtlj446r001p12oo3brs2b0b	en	Benin
cmtlj47v8001u12ooxiyvpsk8	cmtlj46c0001s12oojzjz1c4q	en	Burkina Faso
cmtlj4a0i001x12ooxhjsfsw8	cmtlj48mw001v12ooinrtpbtv	en	Bangladesh
cmtlj4c5u002012oo1zihqqiq	cmtlj4as1001y12ooq4i68jp4	en	Bulgaria
cmtlj4eb7002312ooc6egw4ao	cmtlj4cxi002112ooynn344lv	en	Bahrain
cmtlj4ggk002612ooe0oit9ef	cmtlj4f2v002412oonc48fou7	en	Bahamas
cmtlj4im2002912oo1ee1cy2b	cmtlj4h88002712ooqsnkrwhg	en	Bosnia and Herzegovina
cmtlj4kww002c12ooelisef9n	cmtlj4jdq002a12oouj15pjwe	en	Saint Barthélemy
cmtlj4n27002f12oojuklyzkc	cmtlj4loj002d12ootj1eviof	en	Saint Helena, Ascension and Tristan da Cunha
cmtlj4p91002i12ooicmi94h5	cmtlj4ntt002g12oofoxnr3yv	en	Belarus
cmtlj4re4002l12oo1egynwke	cmtlj4q0j002j12oogl2xloi2	en	Belize
cmtlj4tjh002o12ooxfq6ka0q	cmtlj4s5s002m12oo8a5a1s5n	en	Bermuda
cmtlj4vpf002r12ooziuhmkp3	cmtlj4ub2002p12ookp7mnk1x	en	Bolivia
cmtlj4y0e002u12ooy02s3inx	cmtlj4wh1002s12oo8atttk67	en	Caribbean Netherlands
cmtlj505o002x12ooe15v78zb	cmtlj4yrz002v12ooh0ht24ey	en	Brazil
cmtlj52b0003012oot7spmu3a	cmtlj50x8002y12ooppyo6no4	en	Barbados
cmtlj54gd003312oo2niznr6h	cmtlj532o003112oo6eonywck	en	Brunei
cmtlj56ll003612ooln120b6h	cmtlj557y003412oosozg8lmf	en	Bhutan
cmtlj58r1003912oobsi2tpp6	cmtlj57de003712oow0ws56yl	en	Bouvet Island
cmtlj5b1s003c12oo4bzavl8r	cmtlj59in003a12oo7l7ophas	en	Botswana
cmtlj5d75003f12ooh3gk9seb	cmtlj5bte003d12oo6hjaaw2k	en	Central African Republic
cmtlj5kvk003p12ooy0s5ppdi	cmtlj5jhy003n12ooxdwmvzgy	en	Cocos (Keeling) Islands
cmtlj5n6c003s12oo4uijktt5	cmtlj5ln5003q12ook6p7f52d	en	Switzerland
cmtlj5pbj003v12oo3it8ke2m	cmtlj5nxw003t12oo69e712u4	en	Chile
cmtlj5x16004512oodb9uockh	cmtlj5vni004312oo243ctwj5	en	Ivory Coast
cmtlj5zbz004812ooewx96yen	cmtlj5xss004612ooex452jau	en	Cameroon
cmtlj61h6004b12oo94s0ewut	cmtlj603l004912oo3s9p2nbx	en	DR Congo
cmtlj63mg004e12oorctilyso	cmtlj628r004c12oo7560jzfb	en	Republic of the Congo
cmtlj65ro004h12oovmwsjdxb	cmtlj64e2004f12oo1nplc05n	en	Cook Islands
cmtlj67wx004k12oolcdxuxt1	cmtlj66ja004i12oof1pd8fdg	en	Colombia
cmtlj6a2g004n12ookf2p2dr0	cmtlj68or004l12oo7vw2jwzo	en	Comoros
cmtlj6cdb004q12oom3lctfn5	cmtlj6au3004o12ooi804qhsu	en	Cape Verde
cmtlj6ein004t12ooa95s02n7	cmtlj6d4x004r12ooa4c3k3td	en	Costa Rica
cmtlj6god004w12oo87vubqun	cmtlj6fac004u12oo8wu6qruh	en	Cuba
cmtlj6itp004z12oou6zrn6ts	cmtlj6hg2004x12ooq0mwhbog	en	Curaçao
cmtlj6kz1005212ooe5f5uf2k	cmtlj6jlc005012ooox7px0ds	en	Christmas Island
cmtlj6n4a005512oo2x8jgx6d	cmtlj6lqm005312oom1teziyw	en	Cayman Islands
cmtlj6pf0005812oolej20cvv	cmtlj6nvt005612oouuhq6n5j	en	Cyprus
cmtlj6rkc005b12oof6x7bzxn	cmtlj6q6m005912ooxrct7wun	en	Czechia
cmtlj6z8m005l12oobf9pgb41	cmtlj6xuw005j12oo1mat88l2	en	Djibouti
cmtlj71jh005o12ool1kpofzk	cmtlj700a005m12ookls1wql8	en	Dominica
cmtlj73ot005r12oo92eq6cs0	cmtlj72b4005p12ooyvs9xjq4	en	Denmark
cmtlj75u3005u12oo7zvo78v9	cmtlj74gg005s12oodqbjjkuu	en	Dominican Republic
cmtlj77zg005x12ooz6xsko1s	cmtlj76lp005v12oo4ys7m6kj	en	Algeria
cmtlj7a4r006012ooib8d6ply	cmtlj78r2005y12oocs522cvc	en	Ecuador
cmtlj7cac006312oomfsla43h	cmtlj7awc006112oo5h26wi3o	en	Egypt
cmtlj7emw006612oosqdyxm3n	cmtlj7d3l006412oofj01xadu	en	Eritrea
cmtlj7gs7006912oozarragjx	cmtlj7fej006712oocws97b7c	en	Western Sahara
cmtlj7ixj006c12oo4k5kwk5b	cmtlj7hju006a12oo0445mboy	en	Spain
cmtlj7l30006f12oo41bqexuz	cmtlj7jpe006d12ootp92skuk	en	Estonia
cmtlj7n8d006i12oo3i0y5new	cmtlj7lum006g12ooi1uxpw43	en	Ethiopia
cmtlj7pdl006l12oox3wgswty	cmtlj7o00006j12ootjs7s7pv	en	Finland
cmtlj7roa006o12ooq49xgvu3	cmtlj7q54006m12oo4lb40t2e	en	Fiji
cmtlj7tu3006r12oow86uyfyj	cmtlj7sfv006p12oo4w5ippdb	en	Falkland Islands
cmtlj7vzj006u12oo8u2dbq8e	cmtlj7ulu006s12ooyqovpkkj	en	France
cmtlj7y4t006x12oomuqqdza4	cmtlj7wr3006v12oow48miclb	en	Faroe Islands
cmtlj809z007012oowr9vpz7w	cmtlj7ywc006y12ooccj6drbe	en	Micronesia
cmtlj82f7007312oonlv0xqye	cmtlj811l007112oonb3hdnz4	en	Gabon
cmtlj8a8q007d12oo47y6hw5u	cmtlj88v1007b12oo5hnh5eja	en	Georgia
cmtlj8cdx007g12oojcoj8lub	cmtlj8b0b007e12oofms5op1r	en	Guernsey
cmtlj8eja007j12oold3g4gzx	cmtlj8d5l007h12oofpb13s4u	en	Ghana
cmtlj8gu1007m12ooa4mvex5u	cmtlj8fat007k12ootw0nmnk8	en	Gibraltar
cmtlj8k2r007p12oo7siaaugp	cmtlj8hlo007n12oo4xtrpsb1	en	Guinea
cmtlj8m7p007s12ooh0eaf7zb	cmtlj8kua007q12ooaubf3br4	en	Guadeloupe
cmtlj8ocp007v12ook2lgb115	cmtlj8mz8007t12oo2idu8um6	en	Gambia
cmtlj8qhq007y12ookp28xsvp	cmtlj8p48007w12ookppx069y	en	Guinea-Bissau
cmtlj8ss1008112oorsdwmnz0	cmtlj8r98007z12oo76fy1zhb	en	Equatorial Guinea
cmtlj8ux0008412ooe9o3r8gx	cmtlj8tjj008212ooquq1ke5o	en	Greece
cmtlj8x2d008712ootwi2e8uj	cmtlj8vot008512oov4xbxn8c	en	Grenada
cmtlj8z7l008a12ooono13uxu	cmtlj8xtz008812oot9pnkzlq	en	Greenland
cmtlj91cr008d12ooi2b6mka9	cmtlj8zz5008b12oopjeqofh1	en	Guatemala
cmtlj93i0008g12oov5arhwoq	cmtlj924a008e12ooi10i9qdg	en	French Guiana
cmtlj95sq008j12oofi0re6v3	cmtlj949m008h12oooqijos8v	en	Guam
cmtlj97y3008m12ooztl8pq82	cmtlj96kd008k12oo65v4k39p	en	Guyana
cmtlj9b84008p12oou0ua7grl	cmtlj98pq008n12oox1fvd3tb	en	Hong Kong
cmtlj9ddt008s12oo2ofqne04	cmtlj9bzw008q12oosjygdk2m	en	Heard Island and McDonald Islands
cmtlj9fjo008v12ooc4k40gh7	cmtlj9e5l008t12ookfb2jx2p	en	Honduras
cmtlj9hpk008y12oobh03vfll	cmtlj9gbe008w12ook9rt86ze	en	Croatia
cmtlj9jvc009112oowrsz3nth	cmtlj9ihd008z12ooa27jyogg	en	Haiti
cmtlj9m0y009412ootpo0xr3n	cmtlj9kn4009212oo9cmrvlzy	en	Hungary
cmtlj9oc7009712oo4ys1aslt	cmtlj9msq009512oo56qpmvi7	en	Indonesia
cmtlj9qi5009a12oo6btgh0j8	cmtlj9p3z009812oo66vekw4y	en	Isle of Man
cmtlj9snz009d12oocx82xhss	cmtlj9r9z009b12ooj1tyhstj	en	India
cmtlj9utq009g12oobajpai5w	cmtlj9tfr009e12oorottm7vl	en	British Indian Ocean Territory
cmtlj9wzg009j12oo52p8x9rc	cmtlj9vlg009h12oowzewibwe	en	Ireland
cmtlj9y2o00a9c262j955ft5v	cmtlj9wf60031c2624ug6fgbo	en	Iraq
cmtlj9y2p00aac262r4bwwy5b	cmtlj9wf60032c262gb5r8emx	en	Iceland
cmtlj9y2p00abc262nsw85x1a	cmtlj9wf60033c2621m31mnf0	en	Israel
cmtlj9y2p00acc262qsaek1vc	cmtlj9wf60034c262qfvr2wgp	en	Italy
cmtlj9y2p00adc2624p6yuf7p	cmtlj9wf60035c262m5kqmvat	en	Jamaica
cmtlj9y2p00aec262ori8033e	cmtlj9wf60036c262z9ggzsen	en	Jersey
cmtlj9y2p00afc26211wt5nq7	cmtlj9wf60037c262r61lyovb	en	Jordan
cmtlj9y2p00agc2625erjguc3	cmtlj9wf60038c262e5w6u5ew	en	Japan
cmtlj9y2p00ahc262bxh2egn3	cmtlj9wf60039c262sslmspgb	en	Kazakhstan
cmtlj9y2p00aic262rrx447f3	cmtlj9wf6003ac262l6ls5eax	en	Kenya
cmtlj9y2p00akc262nuns6mme	cmtlj9wf6003cc262ap5oz8al	en	Cambodia
cmtlj9y2p00alc262gw9fh35a	cmtlj9wf6003dc262xrkq1m7s	en	Kiribati
cmtlj9y2p00amc262vdmuckx4	cmtlj9wf6003ec262tdh37dw9	en	Saint Kitts and Nevis
cmtlj9y2p00anc2626urcytko	cmtlj9wf6003fc262sju4zy7q	en	South Korea
cmtlj9y2p00aoc262ginimpgl	cmtlj9wf6003gc26262sw1orx	en	Kosovo
cmtlj9y2p00apc262mtvbo2wr	cmtlj9wf6003hc262xbyrv4dd	en	Kuwait
cmtlj9y2p00aqc2624cilw0e8	cmtlj9wf6003ic262mcumi69a	en	Laos
cmtlj9y2p00arc262pcca2njw	cmtlj9wf6003jc262x3etwxnq	en	Lebanon
cmtlj9y2p00asc2624x75ykkh	cmtlj9wf6003kc262shgw4bpc	en	Liberia
cmtlj9y2p00atc262vv81q2rr	cmtlj9wf6003lc262yvmved5f	en	Libya
cmtlj9y2p00auc262payk2qvx	cmtlj9wf6003mc262djy1s1nj	en	Saint Lucia
cmtlj9y2p00avc262j1vo36sc	cmtlj9wf6003nc2623j6h68mq	en	Liechtenstein
cmtlj9y2p00awc262h9tkxjwy	cmtlj9wf6003oc262ek7yox9d	en	Sri Lanka
cmtlj9y2p00axc2627919b265	cmtlj9wf6003pc262kprgtbuk	en	Lesotho
cmtlj9y2p00ayc2624hk5lgep	cmtlj9wf6003qc262ug3u6mrc	en	Lithuania
cmtlj9y2p00azc262d7m2800v	cmtlj9wf6003rc262lrn2sm30	en	Luxembourg
cmtlj9y2p00b0c2623xrxeeed	cmtlj9wf6003sc2626b6xdkda	en	Latvia
cmtlj9y2p00b1c262hs2g0nwl	cmtlj9wf6003tc262a1l4ni4t	en	Macau
cmtlj9y2p00b2c262cvod3uzi	cmtlj9wf6003uc26223loqzkl	en	Saint Martin
cmtlj9y2p00b3c26257zwkpfa	cmtlj9wf6003vc262gl1k0j27	en	Morocco
cmtlj9y2p00b5c262yyw7jh57	cmtlj9wf6003xc262ez4o1bez	en	Moldova
cmtlj9y2p00b6c2625yk6niyk	cmtlj9wf6003yc2625nj4eg7s	en	Madagascar
cmtlj9y2p00b7c262gciyw921	cmtlj9wf6003zc262hljjbevj	en	Maldives
cmtlj9y2p00b8c2629f8afxe3	cmtlj9wf60040c262h03wpioz	en	Mexico
cmtlj9y2p00b9c262xpyrkufq	cmtlj9wf60041c2624m6sc8mn	en	Marshall Islands
cmtlj9y2p00bac262jogmoxbq	cmtlj9wf60042c262c24zujlo	en	North Macedonia
cmtlj9y2p00bbc262mijl2gd9	cmtlj9wf60043c262z7w1w3jv	en	Mali
cmtlj9y2p00bcc2624jbq84t9	cmtlj9wf60044c262qqjx61cp	en	Malta
cmtlj9y2p00bdc262iz4xd6aw	cmtlj9wf60045c262eo6alm95	en	Myanmar
cmtlj9y2p00bec262mpftzox5	cmtlj9wf60046c262yke6svc3	en	Montenegro
cmtlj9y2p00bfc262d69tsxxz	cmtlj9wf60047c262su41evw0	en	Mongolia
cmtlj9y2p00bgc262g76ze3vs	cmtlj9wf60048c262w1gumd0f	en	Northern Mariana Islands
cmtlj9y2p00bhc2624r9h01nv	cmtlj9wf60049c262254h23kx	en	Mozambique
cmtlj9y2p00bic2626rk7n5q5	cmtlj9wf6004ac262f3d023j8	en	Mauritania
cmtlj9y2p00bjc262r81m2inw	cmtlj9wf6004bc262ih95w6uy	en	Montserrat
cmtlj9y2p00bkc262u9wgjeze	cmtlj9wf6004cc262mmdseymj	en	Martinique
cmtlj9y2p00blc262h8ipsazk	cmtlj9wf6004dc26204fechg9	en	Mauritius
cmtlj9y2p00bmc26273alvx2m	cmtlj9wf6004ec262zbf4g9he	en	Malawi
cmtlj9y2p00bqc2625xileodv	cmtlj9wf6004gc2625es5fxji	en	Mayotte
cmtlj9y2p00brc2626b702olc	cmtlj9wf6004hc262tuflvnc3	en	Namibia
cmtlj9y2p00btc262yjfi4jjx	cmtlj9wf6004jc262nofeonun	en	Niger
cmtlj9y2p00buc262loltqo5m	cmtlj9wf6004kc262h3112pxf	en	Norfolk Island
cmtlj9y2p00bvc262ziibve0m	cmtlj9wf6004lc262ujw60nc8	en	Nigeria
cmtlj9y2p00bwc262w0suiyfp	cmtlj9wf6004mc262x1avrvdg	en	Nicaragua
cmtlj9y2p00bxc262437tlk32	cmtlj9wf6004nc262g0121pvo	en	Niue
cmtlj9y2p00byc26275qgg5kj	cmtlj9wf6004oc262ey4f20z9	en	Netherlands
cmtlj9y2p00bzc26244xqf079	cmtlj9wf6004pc262cq0bi4oq	en	Norway
cmtlj9y2p00c0c262h2oropt6	cmtlj9wf6004qc262czpyfrrn	en	Nepal
cmtlj9y2p00c1c262koj6iigl	cmtlj9wf6004rc2622fbe49ba	en	Nauru
cmtlj9y2p00c2c262lw2fb45g	cmtlj9wf6004sc2624my8eewl	en	New Zealand
cmtlj9y2p00c3c262uiw2vg28	cmtlj9wf6004tc262ywgbp5uj	en	Oman
cmtlj9y2p00c4c262d2sbsknt	cmtlj9wf6004uc262jh0d8yc7	en	Pakistan
cmtlj9y2p00c5c262o36gowfg	cmtlj9wf6004vc2626vdv4ofh	en	Panama
cmtlj9y2p00c6c262cv51gryg	cmtlj9wf6004wc262zjam1fts	en	Pitcairn Islands
cmtlj9y2p00c7c262tadedahq	cmtlj9wf6004xc2626bigjiyy	en	Peru
cmtlj9y2p00cbc262vtpf284t	cmtlj9wf7004zc262b5og02ga	en	Palau
cmtlj9y2p00ccc2625yfkpmg5	cmtlj9wf70050c262ka20z1ys	en	Papua New Guinea
cmtlj9y2p00cdc262wcnq6d0y	cmtlj9wf70051c262o4ogbw1o	en	Poland
cmtlj9y2p00cec262vjx7hv92	cmtlj9wf70052c262sazx0r16	en	Puerto Rico
cmtlj9y2p00cfc262mfa9hqnm	cmtlj9wf70053c262v9rtvv4y	en	North Korea
cmtlj9y2p00cgc2629fijhc32	cmtlj9wf70054c26241738cr4	en	Portugal
cmtlj9y2p00chc262e0e7r7mh	cmtlj9wf70055c26242yiv3rq	en	Paraguay
cmtlj9y2p00cjc262apcp5r98	cmtlj9wf70057c2624zph9xim	en	French Polynesia
cmtlj9y2p00ckc262a9t2g6g0	cmtlj9wf70058c262me6shtrz	en	Qatar
cmtlj9y2p00clc262wg89n09g	cmtlj9wf70059c262fwstcpbf	en	Réunion
cmtlj9y2p00cmc2621oe7d07d	cmtlj9wf7005ac2622v3ix15y	en	Romania
cmtlj9y2p00cnc2628a0mux6g	cmtlj9wf7005bc262dqptuxcx	en	Russia
cmtlj9y2p00coc262cfu5sly0	cmtlj9wf7005cc262r8z2z8ps	en	Rwanda
cmtlj9y2p00cpc262fg8085sm	cmtlj9wf7005dc2625j9ti0n7	en	Saudi Arabia
cmtlj9y2p00cqc26269wa9kbp	cmtlj9wf7005ec262sw17z1ld	en	Sudan
cmtlj9y2p00crc262zcz3adk9	cmtlj9wf7005fc2629nfus0og	en	Senegal
cmtlj9y2p00cvc262kqjdtkq0	cmtlj9wf7005hc2623hip5ksl	en	South Georgia
cmtlj9y2p00cwc262dnfost8c	cmtlj9wf7005ic262ogq0l03a	en	Svalbard and Jan Mayen
cmtlj9y2p00cxc262pit2razi	cmtlj9wf7005jc262e5pqpyj2	en	Solomon Islands
cmtlj9y2p00cyc2625dwq173y	cmtlj9wf7005kc262zdh9hykk	en	Sierra Leone
cmtlj9y2p00czc2624dpgcxrd	cmtlj9wf7005lc262b050e1eo	en	El Salvador
cmtlj9y2p00d0c262rjh09phh	cmtlj9wf7005mc262o1d2ojyr	en	San Marino
cmtlj9y2p00d1c262ydd308rx	cmtlj9wf7005nc262c979ez51	en	Somalia
cmtlj9y2p00d2c2629fbfuhhy	cmtlj9wf7005oc26290dqhaa7	en	Saint Pierre and Miquelon
cmtlj9y2p00d3c262tpicayfb	cmtlj9wf7005pc262syzqhybb	en	Serbia
cmtlj9y2p00d4c262oup30h6m	cmtlj9wf7005qc262l3ofoq0c	en	South Sudan
cmtlj9y2p00d5c2629zu5svo4	cmtlj9wf7005rc262dk7cso4a	en	São Tomé and Príncipe
cmtlj9y2p00d6c2626rwzg058	cmtlj9wf7005sc262jv0w3bdh	en	Suriname
cmtlj9y2p00d7c262h846nc4l	cmtlj9wf7005tc262ycfptdbk	en	Slovakia
cmtlj9y2p00d8c262a5viyala	cmtlj9wf7005uc2624tkyo928	en	Slovenia
cmtlj9y2p00d9c262nxg7utdi	cmtlj9wf7005vc262s0evp0lf	en	Sweden
cmtlj9y2p00dac262ruv811lc	cmtlj9wf7005wc2625olgckox	en	Eswatini
cmtlj9y2p00dcc262010sa9g9	cmtlj9wf7005yc262qf9e2p8b	en	Seychelles
cmtlj9y2p00ddc262nmn8wz0e	cmtlj9wf7005zc262ekp0cxrx	en	Syria
cmtlj9y2p00dec26239c9ccrc	cmtlj9wf70060c262bz9sxn1y	en	Turks and Caicos Islands
cmtlj9y2p00dfc262iej0s37v	cmtlj9wf70061c262lo22un4b	en	Chad
cmtlj9y2p00dgc2625q0sylim	cmtlj9wf70062c262h7ppfc2d	en	Togo
cmtlj9y2p00dkc262lt5o2v41	cmtlj9wf70064c262ly6j618z	en	Tajikistan
cmtlj9y2q00dlc262rqwyha1e	cmtlj9wf70065c262ungivvp7	en	Tokelau
cmtlj9y2q00dmc262475zqbbi	cmtlj9wf70066c2628cq2lj4k	en	Turkmenistan
cmtlj9y2q00dnc262druujue9	cmtlj9wf70067c262831etgk7	en	Timor-Leste
cmtlj9y2q00doc262k4qcnk52	cmtlj9wf70068c262sv9uhboa	en	Tonga
cmtlj9y2q00dpc262fsrcx4xg	cmtlj9wf70069c262tph35a67	en	Trinidad and Tobago
cmtlj9y2q00dqc262sklbcwti	cmtlj9wf7006ac262wtiysa6f	en	Tunisia
cmtlj9y2q00drc262z45qlfrd	cmtlj9wf7006bc26260inwzb9	en	Türkiye
cmtlj9y2q00dsc262zuk9ghkj	cmtlj9wf7006cc262dziq67ct	en	Tuvalu
cmtlj9y2q00dtc262d71uc5ja	cmtlj9wf7006dc26244vx7y5j	en	Taiwan
cmtlj9y2q00duc2627buppgvh	cmtlj9wf7006ec262q0r0s6fi	en	Tanzania
cmtlj9y2q00dvc262mja40ott	cmtlj9wf7006fc262oph7xjmk	en	Uganda
cmtlj9y2q00dwc262h4j42orb	cmtlj9wf7006gc262t2h4u6uh	en	Ukraine
cmtlj9y2q00dxc2624a2yfes0	cmtlj9wf7006hc262tqv2qyts	en	United States Minor Outlying Islands
cmtlj9y2q00dyc262no70gzxt	cmtlj9wf7006ic262r2mvpic4	en	Uruguay
cmtlj9y2q00e2c2625dfiy26o	cmtlj9wf7006kc262bcrhwl7o	en	Uzbekistan
cmtlj9y2q00e3c2625hy0b4j8	cmtlj9wf7006lc2625usld5rk	en	Vatican City
cmtlj9y2q00e4c2623h1q2sby	cmtlj9wf7006mc262o98xi6u3	en	Saint Vincent and the Grenadines
cmtlj9y2q00e5c262udof74tf	cmtlj9wf7006nc262ewuqimnj	en	Venezuela
cmtlj9y2q00e6c262clze7zei	cmtlj9wf7006oc262j4kcqrh1	en	British Virgin Islands
cmtlj9y2q00e7c262ro1b1qvm	cmtlj9wf7006pc26297sgu3t8	en	United States Virgin Islands
cmtlj9y2q00e8c262ytroat15	cmtlj9wf7006qc262hruhd5lq	en	Vietnam
cmtlj9y2q00e9c26261o4272y	cmtlj9wf7006rc2629nll47lf	en	Vanuatu
cmtlj9y2q00eac262l95n13ag	cmtlj9wf7006sc2620l4ybg4l	en	Wallis and Futuna
cmtlj9y2q00ebc262rua74b2x	cmtlj9wf7006tc2626puwnjhh	en	Samoa
cmtlj9y2q00ecc262gcpztt1n	cmtlj9wf7006uc262y7x33ovn	en	Yemen
cmtlj9y2q00edc2627j4jzawk	cmtlj9wf7006vc262nz7g0ocx	en	South Africa
cmtlj9y2q00eec2629v30payz	cmtlj9wf7006wc262mzztic2l	en	Zambia
cmtlj9y2q00efc2627n273453	cmtlj9wf7006xc262w1quty5k	en	Zimbabwe
cmtlj9y2o00a8c262bbto0j43	cmtlj9wf60030c262j1vj94u6	en	Iran
cmtlj9y2p00ajc2628m2u30yi	cmtlj9wf6003bc262hqfa44ot	en	Kyrgyzstan
cmtlj9y2p00b4c2626hey5ek0	cmtlj9wf6003wc262ugj8jl4t	en	Monaco
cmtlj9y2p00bsc262d1khfisq	cmtlj9wf6004ic262r7crg5pc	en	New Caledonia
cmtlj9y2p00cic262c059inf5	cmtlj9wf70056c26237fvpely	en	Palestine
cmtlj9y2p00dbc262l5k35rdc	cmtlj9wf7005xc262i55ka874	en	Sint Maarten
\.


--
-- Data for Name: PayoutSpeedOption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PayoutSpeedOption" (id, slug, "sortOrder") FROM stdin;
payout_under_1_hour	under-1-hour	10
payout_under_2_hours	under-2-hours	20
payout_same_day	same-day	30
payout_under_6_hours	under-6-hours	40
payout_12_24_hours	12-24-hours	50
payout_24_48_hours	24-48-hours	60
payout_1_2_days	1-2-days	70
\.


--
-- Data for Name: PayoutSpeedOptionTranslation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PayoutSpeedOptionTranslation" (id, "optionId", locale, label) FROM stdin;
cmtk4hhh3000rgc9nfm0iuz2b	payout_under_6_hours	th	น้อยกว่า 6 ชั่วโมง
cmtk4hjih000ugc9nhunj1iov	payout_12_24_hours	en	12–24 hours
cmtk4hka9000wgc9nf3b20tm1	payout_12_24_hours	zh	12–24小时
cmtk4hl1u000ygc9n0zl09sou	payout_12_24_hours	th	12–24 ชั่วโมง
cmtk4hmku0011gc9np5io0t0z	payout_24_48_hours	en	24–48 hours
cmtk4hnce0013gc9n8uufj1od	payout_24_48_hours	zh	24–48小时
cmtk4ho3u0015gc9n8e8n8f7u	payout_24_48_hours	th	24–48 ชั่วโมง
cmtk4hpqu0018gc9nbcj47ihs	payout_1_2_days	en	1–2 days
cmtk4hqii001agc9n5z96j67c	payout_1_2_days	zh	1–2天
cmtk4hr9z001cgc9nnyvxvw4z	payout_1_2_days	th	1–2 วัน
cmtk4h6rj0002gc9nzmrbdx73	payout_under_1_hour	en	Under 1 hour
cmtk4h7j70004gc9nnvto7laf	payout_under_1_hour	zh	低于1小时
cmtk4h8ap0006gc9neko6kjsi	payout_under_1_hour	th	น้อยกว่า 1 ชั่วโมง
cmtk4h9tr0009gc9nz04d17k1	payout_under_2_hours	en	Under 2 hours
cmtk4halc000bgc9naa65jm35	payout_under_2_hours	zh	低于2小时
cmtk4hbcu000dgc9n01n94gdb	payout_under_2_hours	th	น้อยกว่า 2 ชั่วโมง
cmtk4hcvv000ggc9nzj1oig3k	payout_same_day	en	Same day
cmtk4hdne000igc9nselopezn	payout_same_day	zh	当天
cmtk4heew000kgc9ns0l5oecx	payout_same_day	th	ภายในวันเดียวกัน
cmtk4hfy3000ngc9nu7ricd1s	payout_under_6_hours	en	Under 6 hours
cmtk4hgpk000pgc9n8f89nro0	payout_under_6_hours	zh	低于6小时
\.


--
-- Data for Name: StaticPage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StaticPage" (id, slug, status, "createdAt", "updatedAt") FROM stdin;
cmtgdmtwr002ra92rgq5u74f1	privacy	published	2026-08-30 22:24:16.875	2026-09-03 13:45:30.936
cmtgdmvlo002ya92rg2y6hc6u	terms	published	2026-08-30 22:24:19.068	2026-09-03 13:45:33.936
cmtgdmxfz0035a92r2yrp1n8x	responsible-gambling	published	2026-08-30 22:24:21.258	2026-09-03 13:45:37.122
\.


--
-- Data for Name: StaticPageTranslation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StaticPageTranslation" (id, "pageId", locale, title, content, "seoTitle", "seoDescription") FROM stdin;
cmtlkv3nb00ixxcc8mqcngwil	cmtgdmtwr002ra92rgq5u74f1	en	Privacy Policy	How BC.GS collects, uses, and shares information when you visit this independent review site.\n\n## Who we are\n\nBC.GS is an independent editorial website that publishes reviews, ratings, and comparisons of betting and casino operators. We are not a gambling operator, we do not take bets, and we do not hold player funds.\n\nThis policy explains what information we process when you browse the site, use comparison tools, or follow an outbound link. It is placeholder wording for product development and should be reviewed by counsel before production use.\n\n## Information we collect\n\nWe collect as little as we need to run the site and understand how it is used. Depending on how you arrive and what you do, that may include:\n\n- Technical data such as IP address, browser type, device, language, and referring URL.\n- Usage data such as pages viewed, links clicked, and time spent on a page.\n- Preference data stored in your browser, for example layout settings you choose on this site.\n- Information you send us if you email a privacy or editorial inquiry.\n\n## Cookies and analytics\n\nWe may use first-party cookies or similar storage to remember settings and keep the site working. We may also use analytics tools to see which reviews are read and where people drop off. Those tools can set their own cookies.\n\nYou can block or delete cookies in your browser. Some features, such as saved layout preferences, will then reset the next time you visit.\n\n## Affiliate links and third parties\n\nSome “Visit Casino” and similar buttons are affiliate links. If you click one, the operator or its tracking partner may receive a referral identifier so we can be paid a commission if you later open an account. That click may also be logged by the destination site under its own privacy policy.\n\nWe do not sell your name or email to operators. We also do not control what an operator collects after you leave BC.GS. Read their policy before you register or deposit.\n\n## How long we keep data\n\nServer logs and analytics records are kept only as long as needed for security, debugging, and aggregated reporting — typically no longer than 24 months, unless a longer period is required to investigate abuse.\n\nEmails you send us are kept for as long as needed to answer the request and keep a reasonable business record.\n\n## Your rights\n\nDepending on where you live, you may have the right to ask what personal data we hold, to correct it, to delete it, to restrict or object to certain processing, or to receive a copy in a portable format. You may also have the right to lodge a complaint with a data protection authority.\n\nLayout preferences stored only in your browser can be cleared by you at any time. For anything we hold on our side, use the contact below.\n\n## Privacy contact\n\nFor privacy questions, write to privacy@bc.gs and include the email address or details that help us find your request. We will respond as soon as we reasonably can.\n\n[Email privacy@bc.gs](mailto:privacy@bc.gs)	Privacy Policy	Privacy policy for BC.GS — what we collect, how cookies and affiliate links work, and how to contact us about your data.
cmtlkv3nb00iyxcc8zc9ko50j	cmtgdmtwr002ra92rgq5u74f1	zh	隐私政策	当你访问这家独立评测网站时，BC.GS 如何收集、使用和分享信息。\n\n## 我们是谁\n\nBC.GS 是一家独立编辑网站，发布博彩与娱乐场运营商的评测、评分和对比。我们不是博彩运营商，不接受投注，也不保管玩家资金。\n\n本政策说明你浏览网站、使用对比工具或点击外链时，我们会处理哪些信息。当前为产品开发阶段的占位文案，正式上线前应由律师审阅。\n\n## 我们收集的信息\n\n我们只收集维持网站运转、了解使用情况所需的最少信息。取决于你如何到来、做了什么，可能包括：\n\n- 技术数据，例如 IP 地址、浏览器类型、设备、语言和来源网址。\n- 使用数据，例如浏览过的页面、点击的链接，以及在某页停留的时间。\n- 存在浏览器里的偏好数据，例如你在本站选择的版式设置。\n- 你通过邮件发送的隐私或编辑问询内容。\n\n## Cookie 与分析\n\n我们可能使用第一方 Cookie 或类似存储来记住设置、保证网站正常运行。也可能使用分析工具，了解哪些评测被阅读、读者在何处离开。这些工具可能自行设置 Cookie。\n\n你可以在浏览器中屏蔽或删除 Cookie。之后，已保存的版式偏好等功能会在下次访问时重置。\n\n## 联盟链接与第三方\n\n部分「前往娱乐场」及类似按钮是联盟链接。你点击后，运营商或其追踪合作方可收到推荐标识，以便你之后开户时我们能获得佣金。目标网站也可能按自己的隐私政策记录这次点击。\n\n我们不会把你的姓名或邮箱卖给运营商。你离开 BC.GS 之后运营商收集什么，我们也无法控制。注册或存款前，请先阅读对方的政策。\n\n## 我们保留数据多久\n\n服务器日志和分析记录只保留到安全、排错和汇总报告所需的时长 — 通常不超过 24 个月，除非调查滥用行为需要更长时间。\n\n你发来的邮件会保留到足以回复请求、并留下合理业务记录为止。\n\n## 你的权利\n\n视你所在地而定，你可能有权查询我们持有的个人数据、更正、删除、限制或反对某些处理，或以可携格式获取副本。你也可能有权向数据保护机构投诉。\n\n仅存在浏览器里的版式偏好，你可以随时自行清除。我们这边保存的内容，请用下方联系方式。\n\n## 隐私联系方式\n\n隐私相关问题请写信至 privacy@bc.gs，并附上能帮我们定位请求的邮箱或其他细节。我们会尽快回复。\n\n[发送邮件至 privacy@bc.gs](mailto:privacy@bc.gs)	隐私政策	BC.GS 隐私政策 — 我们收集什么、Cookie 与联盟链接如何运作，以及如何就你的数据联系我们。
cmtlkv3nb00izxcc8hrp7ngzx	cmtgdmtwr002ra92rgq5u74f1	th	นโยบายความเป็นส่วนตัว	BC.GS เก็บ ใช้ และแบ่งปันข้อมูลอย่างไรเมื่อคุณเข้าชมเว็บไซต์รีวิวอิสระแห่งนี้\n\n## เราคือใคร\n\nBC.GS เป็นเว็บไซต์บรรณาธิการอิสระที่เผยแพร่รีวิว คะแนน และการเปรียบเทียบผู้ให้บริการเดิมพันและคาสิโน เราไม่ใช่ผู้ให้บริการพนัน ไม่รับเดิมพัน และไม่ถือเงินของผู้เล่น\n\nนโยบายนี้อธิบายว่าเราประมวลผลข้อมูลอะไรเมื่อคุณท่องเว็บ ใช้เครื่องมือเปรียบเทียบ หรือคลิกลิงก์ออกไป ข้อความนี้เป็นฉบับชั่วคราวสำหรับช่วงพัฒนาผลิตภัณฑ์ และควรให้ทนายความตรวจก่อนใช้งานจริง\n\n## ข้อมูลที่เราเก็บ\n\nเราเก็บให้น้อยที่สุดเท่าที่จำเป็นเพื่อให้เว็บไซต์ทำงาน และเพื่อเข้าใจการใช้งาน ขึ้นกับว่าคุณเข้ามาอย่างไรและทำอะไร อาจรวมถึง:\n\n- ข้อมูลเทคนิค เช่น ที่อยู่ IP ประเภทเบราว์เซอร์ อุปกรณ์ ภาษา และ URL ที่อ้างอิงมา\n- ข้อมูลการใช้งาน เช่น หน้าที่ดู ลิงก์ที่คลิก และเวลาที่ใช้ในแต่ละหน้า\n- ข้อมูลการตั้งค่าที่เก็บในเบราว์เซอร์ เช่น รูปแบบเลย์เอาต์ที่คุณเลือกบนเว็บนี้\n- ข้อมูลที่คุณส่งมาหากอีเมลสอบถามเรื่องความเป็นส่วนตัวหรือบรรณาธิการ\n\n## Cookie และการวิเคราะห์\n\nเราอาจใช้คุกกี้ฝั่งเราเองหรือที่เก็บข้อมูลคล้ายกัน เพื่อจำการตั้งค่าและให้เว็บทำงานได้ อาจใช้เครื่องมือวิเคราะห์เพื่อดูว่ารีวิวใดถูกอ่าน และคนออกตรงไหน เครื่องมือเหล่านั้นสามารถตั้งคุกกี้ของตนเองได้\n\nคุณสามารถบล็อกหรือลบคุกกี้ในเบราว์เซอร์ได้ ฟีเจอร์บางอย่าง เช่น การตั้งค่าเลย์เอาต์ที่บันทึกไว้ จะถูกรีเซ็ตเมื่อคุณเข้ามาครั้งถัดไป\n\n## ลิงก์พันธมิตรและบุคคลที่สาม\n\nปุ่มอย่าง “ไปที่คาสิโน” บางอันเป็นลิงก์พันธมิตร หากคุณคลิก ผู้ให้บริการหรือพาร์ตเนอร์ติดตามอาจได้รับรหัสแนะนำ เพื่อให้เราได้รับค่าคอมมิชชันหากคุณเปิดบัญชีในภายหลัง เว็บปลายทางอาจบันทึกการคลิกนั้นตามนโยบายความเป็นส่วนตัวของตนเองด้วย\n\nเราไม่ขายชื่อหรืออีเมลของคุณให้ผู้ให้บริการ และไม่ควบคุมว่าผู้ให้บริการจะเก็บอะไรหลังจากคุณออกจาก BC.GS โปรดอ่านนโยบายของพวกเขาก่อนสมัครหรือฝากเงิน\n\n## เราเก็บข้อมูลนานแค่ไหน\n\nบันทึกเซิร์ฟเวอร์และข้อมูลวิเคราะห์เก็บเท่าที่จำเป็นเพื่อความปลอดภัย การแก้ปัญหา และรายงานภาพรวม — โดยทั่วไปไม่เกิน 24 เดือน เว้นแต่ต้องเก็บนานกว่านั้นเพื่อสอบสวนการใช้งานที่ผิดปกติ\n\nอีเมลที่คุณส่งมาจะเก็บเท่าที่จำเป็นเพื่อตอบคำขอ และเก็บหลักฐานทางธุรกิจตามสมควร\n\n## สิทธิ์ของคุณ\n\nขึ้นกับว่าคุณอยู่ที่ไหน คุณอาจมีสิทธิ์ถามว่าเรามีข้อมูลส่วนบุคคลอะไร แก้ไข ลบ จำกัดหรือคัดค้านการประมวลผลบางอย่าง หรือขอสำเนาในรูปแบบที่นำไปใช้ต่อได้ และอาจมีสิทธิ์ร้องเรียนต่อหน่วยงานคุ้มครองข้อมูล\n\nการตั้งค่าเลย์เอาต์ที่เก็บในเบราว์เซอร์เท่านั้น คุณล้างได้เองทุกเมื่อ ส่วนที่เราเก็บไว้ฝั่งเรา ใช้ช่องทางติดต่อด้านล่าง\n\n## ช่องทางติดต่อเรื่องความเป็นส่วนตัว\n\nหากมีคำถามเรื่องความเป็นส่วนตัว ส่งมาที่ privacy@bc.gs พร้อมอีเมลหรือรายละเอียดที่ช่วยให้เราหาคำขอของคุณได้ เราจะตอบโดยเร็วตามสมควร\n\n[อีเมล privacy@bc.gs](mailto:privacy@bc.gs)	นโยบายความเป็นส่วนตัว	นโยบายความเป็นส่วนตัวของ BC.GS — เราเก็บอะไร Cookie และลิงก์พันธมิตรทำงานอย่างไร และจะติดต่อเรื่องข้อมูลของคุณได้อย่างไร
cmtlkv64500j4xcc884yizgv5	cmtgdmvlo002ya92rg2y6hc6u	en	Terms & Conditions	The rules for using BC.GS — an editorial review site, not a gambling operator.\n\n## Acceptance of these terms\n\nBy accessing BC.GS you agree to these terms. If you do not agree, do not use the site. We may update this page from time to time; the “last updated” date at the top is the version that applies.\n\nThis is placeholder wording for product development and is not a substitute for legal advice.\n\n## What this site is\n\nBC.GS publishes independent editorial reviews, ratings, and comparisons of betting and casino brands. We are a media site. We are not a casino, sportsbook, payment processor, or gambling licensee. You cannot open an account, place a bet, or withdraw funds on BC.GS.\n\nOutbound “Visit Casino” links take you to a third-party operator. Any account you open there is between you and that operator.\n\n## Affiliate disclosure\n\nWe may earn a commission if you click an affiliate link and later register or deposit with an operator. That does not change our scoring method. Ratings are editorial judgments based on research and hands-on testing, not on who pays the highest commission.\n\n## Accuracy of information\n\nOffers, payout times, licenses, and bonus terms change. We try to keep reviews current, but we do not warrant that every figure on the site is complete, current, or error-free. Always read the operator’s own terms before you deposit.\n\nNothing on BC.GS is financial, legal, or gambling advice. Rankings are opinions, not guarantees of future performance.\n\n## Age restriction\n\nYou must be of legal gambling age in your jurisdiction to follow outbound links to gambling operators — 18 or older in many places, 21 or older in others. If you are under that age, do not use those links.\n\nIt is your responsibility to know whether online gambling is legal where you live. We do not target jurisdictions where this content is not permitted.\n\n## Acceptable use\n\nDo not scrape the site in a way that harms availability, attempt to break security, or present our reviews as your own. You may link to our pages. You may not copy reviews wholesale without permission.\n\n## Limitation of liability\n\nTo the fullest extent allowed by law, BC.GS and its contributors are not liable for losses that arise from using the site or from relying on a review — including lost deposits, bonus disputes, or account closures at a third-party operator.\n\nThe site is provided “as is.” We do not promise uninterrupted access or that every outbound link will remain live.\n\n## Governing law\n\nThese terms are governed by the laws of [jurisdiction to be confirmed], without regard to conflict-of-law rules. Courts in that jurisdiction shall have exclusive venue, except where consumer-protection law requires otherwise.\n\n## Contact\n\nQuestions about these terms can be sent to legal@bc.gs. For safer-gambling help, use the resources on our Responsible Gambling page — we are not a counselling service.\n\n[Email legal@bc.gs](mailto:legal@bc.gs)\n[Responsible Gambling](/responsible-gambling)	Terms & Conditions	Terms of use for BC.GS, including site purpose, affiliate disclosure, accuracy disclaimer, age limits, and liability limits.
cmtlkv64500j5xcc8cbtgmzgk	cmtgdmvlo002ya92rg2y6hc6u	zh	服务条款	使用 BC.GS 的规则 — 这是编辑评测站，不是博彩运营商。\n\n## 接受本条款\n\n访问 BC.GS 即表示你同意本条款。若不同意，请勿使用本站。我们可能不时更新本页；顶部的「最后更新」日期即为适用版本。\n\n此为产品开发阶段的占位文案，不能替代法律意见。\n\n## 本站是什么\n\nBC.GS 发布博彩与娱乐场品牌的独立编辑评测、评分和对比。我们是媒体站点，不是娱乐场、体育博彩、支付处理商或博彩持牌方。你无法在 BC.GS 开户、下注或提现。\n\n外链「前往娱乐场」会带你到第三方运营商。你在那里开的账户，只存在于你与该运营商之间。\n\n## 联盟披露\n\n如果你点击联盟链接，随后在运营商处注册或存款，我们可能获得佣金。这不会改变我们的评分方法。评分是基于调研和实际测试的编辑判断，不是看谁给的佣金最高。\n\n## 信息准确性\n\n优惠、出款时间、牌照和奖金条款都会变。我们尽量保持评测更新，但不保证站上每个数字都完整、最新或无误。存款前务必阅读运营商自己的条款。\n\nBC.GS 上的内容不是财务、法律或博彩建议。排名是观点，不保证未来表现。\n\n## 年龄限制\n\n只有达到你所在地法定博彩年龄，才能点击通往博彩运营商的外链 — 许多地方是 18 岁及以上，有些地方是 21 岁及以上。未达该年龄请勿使用这些链接。\n\n你有责任了解所在地在线博彩是否合法。我们不面向禁止此类内容的司法辖区。\n\n## 可接受的使用\n\n请勿以损害可用性的方式抓取本站、尝试破坏安全，或把我们的评测当作自己的作品。你可以链接到我们的页面。未经许可，不得整篇复制评测。\n\n## 责任限制\n\n在法律允许的最大范围内，BC.GS 及其撰稿人对因使用本站或依赖评测而产生的损失不承担责任 — 包括在第三方运营商处的存款损失、优惠争议或账户关闭。\n\n本站按「现状」提供。我们不承诺不间断访问，也不保证每条外链始终有效。\n\n## 适用法律\n\n本条款受【待确认司法辖区】法律管辖，不考虑法律冲突规则。除消费者保护法另有要求外，该辖区法院拥有专属管辖权。\n\n## 联系我们\n\n关于本条款的问题可发送至 legal@bc.gs。需要更安全博彩方面的帮助，请使用「负责任博彩」页上的资源 — 我们不是咨询服务机构。\n\n[发送邮件至 legal@bc.gs](mailto:legal@bc.gs)\n[负责任博彩](/responsible-gambling)	服务条款	BC.GS 使用条款，涵盖网站定位、联盟披露、准确性免责、年龄限制与责任上限。
cmtlkv64500j6xcc806m781ef	cmtgdmvlo002ya92rg2y6hc6u	th	ข้อกำหนดและเงื่อนไข	กติกาการใช้ BC.GS — เว็บไซต์รีวิวบรรณาธิการ ไม่ใช่ผู้ให้บริการพนัน\n\n## การยอมรับข้อกำหนดเหล่านี้\n\nการเข้าใช้ BC.GS ถือว่าคุณยอมรับข้อกำหนดเหล่านี้ หากไม่ยอมรับ โปรดอย่าใช้เว็บ เราอาจอัปเดตหน้านี้เป็นครั้งคราว วันที่ “อัปเดตล่าสุด” ด้านบนคือฉบับที่ใช้บังคับ\n\nข้อความนี้เป็นฉบับชั่วคราวสำหรับช่วงพัฒนาผลิตภัณฑ์ ไม่ใช่คำแนะนำทางกฎหมาย\n\n## เว็บนี้คืออะไร\n\nBC.GS เผยแพร่รีวิวบรรณาธิการอิสระ คะแนน และการเปรียบเทียบแบรนด์เดิมพันและคาสิโน เราเป็นสื่อ ไม่ใช่คาสิโน บุ๊คเมกเกอร์ ผู้ประมวลผลการชำระเงิน หรือผู้ถือใบอนุญาตพนัน คุณเปิดบัญชี วางเดิมพัน หรือถอนเงินบน BC.GS ไม่ได้\n\nลิงก์ออกไปอย่าง “ไปที่คาสิโน” พาคุณไปยังผู้ให้บริการภายนอก บัญชีที่คุณเปิดที่นั่นเป็นเรื่องระหว่างคุณกับผู้ให้บริการนั้น\n\n## การเปิดเผยลิงก์พันธมิตร\n\nเราอาจได้รับค่าคอมมิชชันหากคุณคลิกลิงก์พันธมิตร แล้วสมัครหรือฝากเงินกับผู้ให้บริการในภายหลัง สิ่งนี้ไม่เปลี่ยนวิธีให้คะแนนของเรา คะแนนคือดุลยพินิจบรรณาธิการจากงานวิจัยและการทดสอบจริง ไม่ใช่จากใครจ่ายคอมมิชชันสูงสุด\n\n## ความถูกต้องของข้อมูล\n\nข้อเสนอ เวลาถอน ใบอนุญาต และเงื่อนไขโบนัสเปลี่ยนแปลงได้ เราพยายามให้รีวิวทันสมัย แต่ไม่รับประกันว่าตัวเลขทุกตัวบนเว็บครบ ปัจจุบัน หรือไม่มีข้อผิดพลาด โปรดอ่านข้อกำหนดของผู้ให้บริการเองก่อนฝากเงิน\n\nเนื้อหาบน BC.GS ไม่ใช่คำแนะนำทางการเงิน กฎหมาย หรือการพนัน อันดับคือความเห็น ไม่ใช่การรับประกันผลในอนาคต\n\n## ข้อจำกัดด้านอายุ\n\nคุณต้องมีอายุถึงเกณฑ์การพนันที่ถูกต้องตามกฎหมายในเขตของคุณ จึงจะคลิกลิงก์ออกไปยังผู้ให้บริการพนันได้ — หลายแห่งคือ 18 ปีขึ้นไป บางแห่งคือ 21 ปีขึ้นไป หากยังไม่ถึงอายุนั้น อย่าใช้ลิงก์เหล่านั้น\n\nเป็นหน้าที่ของคุณที่จะรู้ว่าการพนันออนไลน์ถูกกฎหมายในที่ที่คุณอยู่หรือไม่ เราไม่ได้มุ่งเป้าเขตที่เนื้อหานี้ไม่อนุญาต\n\n## การใช้งานที่ยอมรับได้\n\nอย่าดึงข้อมูลเว็บในทางที่กระทบการให้บริการ พยายามเจาะระบบความปลอดภัย หรือนำรีวิวของเราไปเป็นของตนเอง คุณลิงก์มายังหน้าของเราได้ แต่ห้ามคัดลอกรีวิวทั้งก้อนโดยไม่ได้รับอนุญาต\n\n## ข้อจำกัดความรับผิด\n\nในขอบเขตสูงสุดที่กฎหมายอนุญาต BC.GS และผู้ร่วมเขียนไม่รับผิดต่อความเสียหายที่เกิดจากการใช้เว็บหรือการพึ่งพารีวิว — รวมถึงเงินฝากที่สูญ โบนัสที่โต้แย้ง หรือบัญชีที่ถูกปิดที่ผู้ให้บริการภายนอก\n\nเว็บให้บริการแบบ “ตามสภาพ” เราไม่สัญญาว่าจะเข้าถึงได้ตลอดเวลา หรือว่าทุกลิงก์ออกไปจะยังใช้งานได้\n\n## กฎหมายที่ใช้บังคับ\n\nข้อกำหนดเหล่านี้อยู่ภายใต้กฎหมายของ [เขตอำนาจที่จะยืนยันในภายหลัง] โดยไม่คำนึงถึงหลักกฎหมายขัดกัน ศาลในเขตนั้นมีอำนาจพิจารณาแต่เพียงผู้เดียว เว้นแต่กฎหมายคุ้มครองผู้บริโภคกำหนดเป็นอย่างอื่น\n\n## ติดต่อเรา\n\nคำถามเกี่ยวกับข้อกำหนดเหล่านี้ส่งได้ที่ legal@bc.gs หากต้องการความช่วยเหลือเรื่องการพนันอย่างปลอดภัย ใช้แหล่งข้อมูลในหน้าการพนันอย่างรับผิดชอบ — เราไม่ใช่บริการให้คำปรึกษา\n\n[อีเมล legal@bc.gs](mailto:legal@bc.gs)\n[การพนันอย่างรับผิดชอบ](/responsible-gambling)	ข้อกำหนดและเงื่อนไข	ข้อกำหนดการใช้งาน BC.GS รวมถึงวัตถุประสงค์ของเว็บ การเปิดเผยลิงก์พันธมิตร ข้อสงวนเรื่องความถูกต้อง ข้อจำกัดอายุ และขอบเขตความรับผิด
cmtlkv8f600jbxcc85gbix8gm	cmtgdmxfz0035a92r2yrp1n8x	en	Responsible Gambling	BC.GS reviews gambling operators. We do not take bets. If gambling is causing harm, stop and get help.\n\n## We are not a gambling operator\n\nBC.GS is an independent review publication. We do not offer games, take wagers, or hold player balances. If you choose to visit an operator we write about, you leave this site and use their product under their rules.\n\nThis page is general information, not personal advice. Placeholder wording here should be checked by counsel before launch.\n\n## Age and legality\n\nGambling is for adults only. You must meet the minimum legal age where you live — often 18, and 21 in some jurisdictions — and gambling must be lawful in that place. If you are underage, do not follow links to operators.\n\n## Signs that gambling may be a problem\n\nSeek help if any of the following feel familiar. They are common warning signs, not a diagnosis:\n\n- Betting more money or more often than you planned.\n- Chasing losses or borrowing money to gamble.\n- Hiding play from family or work.\n- Feeling restless or irritable when you try to stop.\n- Gambling to escape stress, debt, or low mood.\n- Neglecting work, study, or relationships because of gambling.\n\n## Where to get help\n\nThese organisations offer confidential information and support. They are independent of BC.GS. Use the service that matches your country when you can.\n\n[BeGambleAware](https://www.begambleaware.org/)\n[GamCare](https://www.gamcare.org.uk/)\n[National Council on Problem Gambling](https://www.ncpgambling.org/)\n[Gamblers Anonymous](https://www.gamblersanonymous.org/)\n\n## Limits and self-exclusion\n\nReputable operators provide deposit limits, session reminders, time-outs, and self-exclusion. Use those tools on the operator’s site if you want to restrict play. National self-exclusion schemes (for example GAMSTOP in the UK) may also be available where you live.\n\nBC.GS cannot exclude you from third-party casinos. If you need a site-wide block, contact the operator and any national scheme directly.\n\n## How we treat this on BC.GS\n\nWe do not present gambling as a way to make money. Reviews talk about product quality, fairness, and payouts — not “winning systems.” If an operator’s safer-gambling tools are weak, that can affect our Trust & Safety score.	Responsible Gambling	Responsible gambling information from BC.GS, including age limits, warning signs, and links to independent support organisations.
cmtlkv8f600jcxcc835rpor4f	cmtgdmxfz0035a92r2yrp1n8x	zh	负责任博彩	BC.GS 评测博彩运营商，我们不接受投注。如果博彩正在造成伤害，请停下来寻求帮助。\n\n## 我们不是博彩运营商\n\nBC.GS 是独立评测媒体。我们不提供游戏、不接受投注、不保管玩家余额。如果你选择访问我们写过的运营商，即离开本站，并按对方规则使用其产品。\n\n本页是一般信息，不是针对个人的建议。此处占位文案应在上线前由律师核对。\n\n## 年龄与合法性\n\n博彩仅限成年人。你必须达到所在地最低法定年龄 — 通常是 18 岁，部分辖区是 21 岁 — 且当地博彩必须合法。未成年人请勿点击通往运营商的链接。\n\n## 博彩可能出问题的信号\n\n如果以下情况听起来眼熟，请寻求帮助。这些是常见警示信号，不是诊断：\n\n- 下注金额或频率超过原计划。\n- 追损，或借钱去赌。\n- 对家人或职场隐瞒自己的博彩。\n- 试图停下来时感到烦躁或易怒。\n- 用博彩逃避压力、债务或低落情绪。\n- 因博彩而忽视工作、学业或人际关系。\n\n## 去哪里求助\n\n这些组织提供保密信息与支持，独立于 BC.GS。尽可能选择与你所在国家对应的服务。\n\n[BeGambleAware](https://www.begambleaware.org/)\n[GamCare](https://www.gamcare.org.uk/)\n[National Council on Problem Gambling（美国问题博彩全国委员会）](https://www.ncpgambling.org/)\n[Gamblers Anonymous（匿名赌徒互助会）](https://www.gamblersanonymous.org/)\n\n## 限额与自我排除\n\n可靠运营商会提供存款限额、会话提醒、冷静期和自我排除。若要限制自己的游戏，请在运营商网站使用这些工具。你所在地也可能有国家级自我排除计划（例如英国的 GAMSTOP）。\n\nBC.GS 无法把你排除在第三方娱乐场之外。若需要全站屏蔽，请直接联系运营商及任何国家级计划。\n\n## 我们在 BC.GS 上如何对待此事\n\n我们不会把博彩包装成赚钱途径。评测谈的是产品品质、公平性和出款 — 不是「稳赢系统」。如果运营商的更安全博彩工具薄弱，可能影响我们的「信任与安全」评分。	负责任博彩	来自 BC.GS 的负责任博彩信息，包括年龄限制、警示信号，以及独立援助组织的链接。
cmtlkv8f600jdxcc8mfv5vzi0	cmtgdmxfz0035a92r2yrp1n8x	th	การพนันอย่างรับผิดชอบ	BC.GS รีวิวผู้ให้บริการพนัน เราไม่รับเดิมพัน หากการพนันกำลังก่ออันตราย หยุดแล้วขอความช่วยเหลือ\n\n## เราไม่ใช่ผู้ให้บริการพนัน\n\nBC.GS เป็นสื่อรีวิวอิสระ เราไม่ให้บริการเกม ไม่รับเดิมพัน และไม่ถือยอดเงินของผู้เล่น หากคุณเลือกไปที่ผู้ให้บริการที่เราเขียนถึง คุณออกจากเว็บนี้แล้วใช้ผลิตภัณฑ์ของพวกเขาภายใต้กติกาของพวกเขา\n\nหน้านี้เป็นข้อมูลทั่วไป ไม่ใช่คำแนะนำส่วนบุคคล ข้อความชั่วคราวที่นี่ควรให้ทนายความตรวจก่อนเปิดใช้\n\n## อายุและความถูกกฎหมาย\n\nการพนันสำหรับผู้ใหญ่เท่านั้น คุณต้องมีอายุถึงเกณฑ์ขั้นต่ำตามกฎหมายในที่ที่คุณอยู่ — มักเป็น 18 ปี และ 21 ปีในบางเขต — และการพนันต้องถูกกฎหมายในที่นั้น หากยังไม่บรรลุนิติภาวะ อย่าคลิกลิงก์ไปยังผู้ให้บริการ\n\n## สัญญาณว่าการพนันอาจเป็นปัญหา\n\nขอความช่วยเหลือหากข้อใดต่อไปนี้รู้สึกคุ้นเคย นี่คือสัญญาณเตือนที่พบบ่อย ไม่ใช่การวินิจฉัย:\n\n- เดิมพันเงินมากกว่า หรือบ่อยกว่าที่ตั้งใจไว้\n- ไล่ตามเงินที่เสีย หรือยืมเงินมาเล่นพนัน\n- ปิดบังการเล่นจากครอบครัวหรือที่ทำงาน\n- รู้สึกกระวนกระวายหรือหงุดหงิดเมื่อพยายามหยุด\n- เล่นพนันเพื่อหนีความเครียด หนี้สิน หรืออารมณ์ตก\n- ละเลยงาน การเรียน หรือความสัมพันธ์เพราะการพนัน\n\n## จะขอความช่วยเหลือได้ที่ไหน\n\nองค์กรเหล่านี้ให้ข้อมูลและการสนับสนุนแบบลับ พวกเขาเป็นอิสระจาก BC.GS ใช้บริการที่ตรงกับประเทศของคุณเมื่อทำได้\n\n[BeGambleAware](https://www.begambleaware.org/)\n[GamCare](https://www.gamcare.org.uk/)\n[National Council on Problem Gambling (สภาแห่งชาติว่าด้วยปัญหาการพนัน)](https://www.ncpgambling.org/)\n[Gamblers Anonymous (กลุ่มไม่เปิดเผยชื่อสำหรับผู้มีปัญหาการพนัน)](https://www.gamblersanonymous.org/)\n\n## วงเงินและการตัดตนเอง\n\nผู้ให้บริการที่น่าเชื่อถือมีวงเงินฝาก ตัวเตือนเซสชัน พักเล่นชั่วคราว และการตัดตนเอง หากต้องการจำกัดการเล่น ให้ใช้เครื่องมือเหล่านั้นบนเว็บของผู้ให้บริการ โครงการตัดตนเองระดับประเทศ (เช่น GAMSTOP ในสหราชอาณาจักร) อาจมีในที่ที่คุณอยู่ด้วย\n\nBC.GS ไม่สามารถตัดคุณออกจากคาสิโนภายนอกได้ หากต้องการบล็อกทั้งไซต์ ติดต่อผู้ให้บริการและโครงการระดับประเทศโดยตรง\n\n## เราจัดการเรื่องนี้บน BC.GS อย่างไร\n\nเราไม่นำเสนอการพนันว่าเป็นทางทำเงิน รีวิวพูดถึงคุณภาพสินค้า ความยุติธรรม และการถอน — ไม่ใช่ “ระบบชนะ” หากเครื่องมือการพนันอย่างปลอดภัยของผู้ให้บริการอ่อนแอ อาจกระทบคะแนนความน่าเชื่อถือของเรา	การพนันอย่างรับผิดชอบ	ข้อมูลการพนันอย่างรับผิดชอบจาก BC.GS รวมถึงข้อจำกัดอายุ สัญญาณเตือน และลิงก์ไปยังองค์กรช่วยเหลืออิสระ
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, "passwordHash", role, "createdAt", "updatedAt") FROM stdin;
cmtlrq7ht0000h0eqvup2e193	codex-auth-1788454656813@example.com	$2b$12$610XZyH8toBfGWPJ6JmX9.q.x5OO78bkObVagW56AVLFY.P8GsqBK	user	2026-09-03 16:57:39.954	2026-09-03 16:57:39.954
cmtlxbrag0000f9w65b0ktyj8	vitorlopes079@gmail.com	$2b$12$5hxqSyPpf.llYaHOH/oIQOPAJSXHkCeEoJ7o3jL9RI0xx1ityzxeq	user	2026-09-03 19:34:23.465	2026-09-03 19:34:23.465
cmtm30dsa00001i6fgbgvbqvl	codex-review-1788473610442@example.test	test-hash	user	2026-09-03 22:13:30.442	2026-09-03 22:13:30.442
\.


--
-- Data for Name: UserReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserReview" (id, "userId", "casinoId", rating, body, status, "createdAt", "updatedAt") FROM stdin;
cmtm30eju00021i6f3i75zrd1	cmtm30dsa00001i6fgbgvbqvl	cmtfyakfx000fqnf05u7feip1	5	Codex test pending review 1788473610442	pending	2026-09-03 22:13:31.434	2026-09-03 22:13:31.434
cmtm3j6ru0001u5ezjppw6pc8	cmtlxbrag0000f9w65b0ktyj8	cmtfyaf6s0000qnf0dcgi17t4	4	I like this cassino	pending	2026-09-03 22:28:07.817	2026-09-03 22:28:07.817
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
07405a2a-bd6c-4ecb-b62f-e6931e1cd697	fd85b55bec93bf807ea186652be8c45b7edfcf5a7fa1016d510984390ff2f550	2026-08-30 15:14:34.833484+00	20260830151200_add_casino_model		\N	2026-08-30 15:14:34.833484+00	0
349e3258-879d-4fcd-9c6b-5c6a99cd7552	6d2d7c22a020e09379f00806ab23fd1b435fe795d5aa07b170e5b54d21244a24	2026-08-30 16:25:34.975689+00	20260830162400_add_bonus_model	\N	\N	2026-08-30 16:25:33.892006+00	1
98ea03be-5fe2-43da-84ad-de5202a5855b	4adc2dd038ebf48552c3f8f08a48d9882475088518c7aefec612a98d5d2a09a1	2026-08-30 16:39:01.150553+00	20260830163800_add_category_model	\N	\N	2026-08-30 16:39:00.052178+00	1
ba15e2c6-999a-4460-a0fa-e16b8c2199b2	1ced5175cc5619deae9f5493817a707e4a4bb6a37725faaaea4f35f531284ce0	2026-08-30 16:47:10.816273+00	20260830164600_add_category_methodology	\N	\N	2026-08-30 16:47:09.687131+00	1
3330c5f2-e3e6-4353-b6e4-e887445cfe45	c2e2141c6a706c8276167fc8c6fb52662a5d3fbb7546860d19b2f8ebbaf625b5	2026-08-30 19:07:00.587901+00	20260830170000_add_affiliate_click_tracking	\N	\N	2026-08-30 19:06:59.499539+00	1
f714ae8b-44d9-43aa-99cb-b031cf59ef4f	97799e40e71a565e5d6a014dc42dae3313c04ac330dbd7591d640a78213fb55d	2026-08-30 22:22:00.331283+00	20260830173000_add_static_pages	\N	\N	2026-08-30 22:21:59.002102+00	1
8eea2a3a-cc26-4fbf-aad5-b23896a35958	10803f45970515bca5c614beed089b2b913021f414a42b7d8b5422a09e971c66	2026-09-02 13:15:34.298201+00	20260902120000_add_payout_speed_options	\N	\N	2026-09-02 13:15:32.632919+00	1
8fffbe7f-1704-4e0e-bccc-ac24bc25b3a2	4dd027b46117303f58a893a81f1df43810905ef433b8058978441a59afa8abc3	2026-09-03 12:44:03.254504+00	20260903120000_add_market_availability	\N	\N	2026-09-03 12:44:02.037499+00	1
83f408f1-c012-4f06-8df7-74c758c3a36e	9b74e16a0d96b50dfc76c4b1195d6390dceb7600b81baa14b9545bab2f2444f6	2026-09-03 13:41:35.763229+00	20260903140000_add_relational_licenses	\N	\N	2026-09-03 13:41:34.544871+00	1
767f6899-5179-4a75-9c2f-384f24c3ab35	006c7df4147c034216a8c67b08e3f099359c56b83f81cf7b322c0b20a2927591	2026-09-03 16:09:36.998666+00	20260903150000_add_category_ranking	\N	\N	2026-09-03 16:09:35.830675+00	1
ea670859-fbc1-4c97-9988-1d55a8ea961d	b4dcab1fcc517abf4b7b55fa334085469a864c9860602c0ece967ed88936003d	2026-09-03 16:48:04.888978+00	20260903160000_add_users	\N	\N	2026-09-03 16:48:03.758505+00	1
796a03f4-1385-4aef-bd16-62600e41e965	2d3f0276ac38b4ce80137f5a6f9983ef2f3e62960efe73beae223798439ba798	2026-09-03 22:11:56.101926+00	20260903170000_add_user_reviews	\N	\N	2026-09-03 22:11:54.997796+00	1
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-08-30 14:48:25
20211116045059	2026-08-30 14:48:25
20211116050929	2026-08-30 14:48:25
20211116051442	2026-08-30 14:48:25
20211116212300	2026-08-30 14:48:25
20211116213355	2026-08-30 14:48:25
20211116213934	2026-08-30 14:48:25
20211116214523	2026-08-30 14:48:25
20211122062447	2026-08-30 14:48:25
20211124070109	2026-08-30 14:48:25
20211202204204	2026-08-30 14:48:25
20211202204605	2026-08-30 14:48:25
20211210212804	2026-08-30 14:48:25
20211228014915	2026-08-30 14:48:25
20220107221237	2026-08-30 14:48:25
20220228202821	2026-08-30 14:48:25
20220312004840	2026-08-30 14:48:25
20220603231003	2026-08-30 14:48:25
20220603232444	2026-08-30 14:48:25
20220615214548	2026-08-30 14:48:25
20220712093339	2026-08-30 14:48:25
20220908172859	2026-08-30 14:48:25
20220916233421	2026-08-30 14:48:25
20230119133233	2026-08-30 14:48:25
20230128025114	2026-08-30 14:48:25
20230128025212	2026-08-30 14:48:25
20230227211149	2026-08-30 14:48:25
20230228184745	2026-08-30 14:48:25
20230308225145	2026-08-30 14:48:25
20230328144023	2026-08-30 14:48:25
20231018144023	2026-08-30 14:48:25
20231204144023	2026-08-30 14:48:25
20231204144024	2026-08-30 14:48:25
20231204144025	2026-08-30 14:48:25
20240108234812	2026-08-30 14:48:25
20240109165339	2026-08-30 14:48:25
20240227174441	2026-08-30 14:48:25
20240311171622	2026-08-30 14:48:25
20240321100241	2026-08-30 14:48:25
20240401105812	2026-08-30 14:48:25
20240418121054	2026-08-30 14:48:25
20240523004032	2026-08-30 14:48:25
20240618124746	2026-08-30 14:48:25
20240801235015	2026-08-30 14:48:25
20240805133720	2026-08-30 14:48:25
20240827160934	2026-08-30 14:48:25
20240919163303	2026-08-30 14:48:25
20240919163305	2026-08-30 14:48:25
20241019105805	2026-08-30 14:48:25
20241030150047	2026-08-30 14:48:25
20241108114728	2026-08-30 14:48:25
20241121104152	2026-08-30 14:48:25
20241130184212	2026-08-30 14:48:25
20241220035512	2026-08-30 14:48:25
20241220123912	2026-08-30 14:48:25
20241224161212	2026-08-30 14:48:25
20250107150512	2026-08-30 14:48:25
20250110162412	2026-08-30 14:48:25
20250123174212	2026-08-30 14:48:25
20250128220012	2026-08-30 14:48:25
20250506224012	2026-08-30 14:48:25
20250523164012	2026-08-30 14:48:25
20250714121412	2026-08-30 14:48:25
20250905041441	2026-08-30 14:48:25
20251103001201	2026-08-30 14:48:25
20251120212548	2026-08-30 14:48:25
20251120215549	2026-08-30 14:48:25
20260218120000	2026-08-30 14:48:25
20260326120000	2026-08-30 14:48:25
20260514120000	2026-08-30 14:48:25
20260527120000	2026-08-30 14:48:25
20260528120000	2026-08-30 14:48:25
20260603120000	2026-08-30 14:48:25
20260605120000	2026-08-30 14:48:25
20260606110000	2026-08-30 14:48:25
20260616120000	2026-08-30 14:48:25
20260624120000	2026-08-30 14:48:25
20260626120000	2026-08-30 14:48:25
20260706120000	2026-08-30 14:48:25
20260707120000	2026-08-30 14:48:25
20260709120000	2026-08-30 14:48:25
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type, versioning_status) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-08-30 09:29:15.582889
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-08-30 09:29:15.627461
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-08-30 09:29:15.633072
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-08-30 09:29:15.664406
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-08-30 09:29:15.683883
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-08-30 09:29:15.68936
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-08-30 09:29:15.696487
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-08-30 09:29:15.70277
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-08-30 09:29:15.708534
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-08-30 09:29:15.714397
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-08-30 09:29:15.720617
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-08-30 09:29:15.726779
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-08-30 09:29:15.733393
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-08-30 09:29:15.739258
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-08-30 09:29:15.745205
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-08-30 09:29:15.782084
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-08-30 09:29:15.788221
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-08-30 09:29:15.794253
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-08-30 09:29:15.799736
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-08-30 09:29:15.807076
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-08-30 09:29:15.813328
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-08-30 09:29:15.82066
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-08-30 09:29:15.83769
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-08-30 09:29:15.850552
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-08-30 09:29:15.856198
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-08-30 09:29:15.861867
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-08-30 09:29:15.867435
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-08-30 09:29:15.872555
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-08-30 09:29:15.87759
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-08-30 09:29:15.882582
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-08-30 09:29:15.887802
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-08-30 09:29:15.892953
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-08-30 09:29:15.898391
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-08-30 09:29:15.903509
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-08-30 09:29:15.908563
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-08-30 09:29:15.913788
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-08-30 09:29:15.919139
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-08-30 09:29:15.92438
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-08-30 09:29:15.930614
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-08-30 09:29:15.945832
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-08-30 09:29:15.951076
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-08-30 09:29:15.956433
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-08-30 09:29:15.961542
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-08-30 09:29:15.966527
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-08-30 09:29:15.971494
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-08-30 09:29:15.977335
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-08-30 09:29:15.990851
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-08-30 09:29:15.996872
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-08-30 09:29:16.002135
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-08-30 09:29:16.022985
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-08-30 09:29:16.028954
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-08-30 09:29:16.34708
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-08-30 09:29:16.349383
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-08-30 09:29:16.362088
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-08-30 09:29:16.365273
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-08-30 09:29:16.367349
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-08-30 09:29:16.373619
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-08-30 09:29:16.380596
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-08-30 09:29:16.386175
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-08-30 09:29:16.39238
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-08-30 09:29:16.398294
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-30 09:29:16.404152
62	object-versioning-core	0b855f00ff3be0bfca91efee02a9858912491a9a	2026-08-30 09:29:16.409563
63	fix-search-name-relative-to-prefix	c7485e417624f795ce8bb2da21927f48e088904d	2026-08-30 09:29:16.418019
64	fix-search-by-timestamp-sqli	0af424ecd388a39bb1645184b222185a12149675	2026-08-30 09:29:16.425029
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, archived_at, is_delete_marker, is_versioned) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: AffiliateClick AffiliateClick_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AffiliateClick"
    ADD CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY (id);


--
-- Name: BonusTranslation BonusTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BonusTranslation"
    ADD CONSTRAINT "BonusTranslation_pkey" PRIMARY KEY (id);


--
-- Name: Bonus Bonus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bonus"
    ADD CONSTRAINT "Bonus_pkey" PRIMARY KEY (id);


--
-- Name: CasinoCategoryNote CasinoCategoryNote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoCategoryNote"
    ADD CONSTRAINT "CasinoCategoryNote_pkey" PRIMARY KEY (id);


--
-- Name: CasinoCategory CasinoCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoCategory"
    ADD CONSTRAINT "CasinoCategory_pkey" PRIMARY KEY ("casinoId", "categoryId");


--
-- Name: CasinoLicense CasinoLicense_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoLicense"
    ADD CONSTRAINT "CasinoLicense_pkey" PRIMARY KEY ("casinoId", "licenseId");


--
-- Name: CasinoMarket CasinoMarket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoMarket"
    ADD CONSTRAINT "CasinoMarket_pkey" PRIMARY KEY ("casinoId", "marketId");


--
-- Name: CasinoTranslation CasinoTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoTranslation"
    ADD CONSTRAINT "CasinoTranslation_pkey" PRIMARY KEY (id);


--
-- Name: Casino Casino_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Casino"
    ADD CONSTRAINT "Casino_pkey" PRIMARY KEY (id);


--
-- Name: CategoryTranslation CategoryTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CategoryTranslation"
    ADD CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: LicenseTranslation LicenseTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LicenseTranslation"
    ADD CONSTRAINT "LicenseTranslation_pkey" PRIMARY KEY (id);


--
-- Name: License License_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."License"
    ADD CONSTRAINT "License_pkey" PRIMARY KEY (id);


--
-- Name: MarketTranslation MarketTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MarketTranslation"
    ADD CONSTRAINT "MarketTranslation_pkey" PRIMARY KEY (id);


--
-- Name: Market Market_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Market"
    ADD CONSTRAINT "Market_pkey" PRIMARY KEY (id);


--
-- Name: PayoutSpeedOptionTranslation PayoutSpeedOptionTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayoutSpeedOptionTranslation"
    ADD CONSTRAINT "PayoutSpeedOptionTranslation_pkey" PRIMARY KEY (id);


--
-- Name: PayoutSpeedOption PayoutSpeedOption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayoutSpeedOption"
    ADD CONSTRAINT "PayoutSpeedOption_pkey" PRIMARY KEY (id);


--
-- Name: StaticPageTranslation StaticPageTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StaticPageTranslation"
    ADD CONSTRAINT "StaticPageTranslation_pkey" PRIMARY KEY (id);


--
-- Name: StaticPage StaticPage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StaticPage"
    ADD CONSTRAINT "StaticPage_pkey" PRIMARY KEY (id);


--
-- Name: UserReview UserReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "UserReview_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: BonusTranslation_bonusId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BonusTranslation_bonusId_locale_key" ON public."BonusTranslation" USING btree ("bonusId", locale);


--
-- Name: CasinoCategoryNote_casinoId_categoryId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CasinoCategoryNote_casinoId_categoryId_locale_key" ON public."CasinoCategoryNote" USING btree ("casinoId", "categoryId", locale);


--
-- Name: CasinoTranslation_casinoId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CasinoTranslation_casinoId_locale_key" ON public."CasinoTranslation" USING btree ("casinoId", locale);


--
-- Name: Casino_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Casino_slug_key" ON public."Casino" USING btree (slug);


--
-- Name: CategoryTranslation_categoryId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CategoryTranslation_categoryId_locale_key" ON public."CategoryTranslation" USING btree ("categoryId", locale);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: LicenseTranslation_licenseId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LicenseTranslation_licenseId_locale_key" ON public."LicenseTranslation" USING btree ("licenseId", locale);


--
-- Name: License_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "License_slug_key" ON public."License" USING btree (slug);


--
-- Name: MarketTranslation_marketId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MarketTranslation_marketId_locale_key" ON public."MarketTranslation" USING btree ("marketId", locale);


--
-- Name: Market_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Market_code_key" ON public."Market" USING btree (code);


--
-- Name: PayoutSpeedOptionTranslation_optionId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PayoutSpeedOptionTranslation_optionId_locale_key" ON public."PayoutSpeedOptionTranslation" USING btree ("optionId", locale);


--
-- Name: PayoutSpeedOption_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PayoutSpeedOption_slug_key" ON public."PayoutSpeedOption" USING btree (slug);


--
-- Name: StaticPageTranslation_pageId_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StaticPageTranslation_pageId_locale_key" ON public."StaticPageTranslation" USING btree ("pageId", locale);


--
-- Name: StaticPage_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StaticPage_slug_key" ON public."StaticPage" USING btree (slug);


--
-- Name: UserReview_userId_casinoId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserReview_userId_casinoId_key" ON public."UserReview" USING btree ("userId", "casinoId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: AffiliateClick AffiliateClick_casinoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AffiliateClick"
    ADD CONSTRAINT "AffiliateClick_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES public."Casino"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BonusTranslation BonusTranslation_bonusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BonusTranslation"
    ADD CONSTRAINT "BonusTranslation_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES public."Bonus"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Bonus Bonus_casinoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bonus"
    ADD CONSTRAINT "Bonus_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES public."Casino"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoCategoryNote CasinoCategoryNote_casinoId_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoCategoryNote"
    ADD CONSTRAINT "CasinoCategoryNote_casinoId_categoryId_fkey" FOREIGN KEY ("casinoId", "categoryId") REFERENCES public."CasinoCategory"("casinoId", "categoryId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoCategory CasinoCategory_casinoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoCategory"
    ADD CONSTRAINT "CasinoCategory_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES public."Casino"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoCategory CasinoCategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoCategory"
    ADD CONSTRAINT "CasinoCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoLicense CasinoLicense_casinoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoLicense"
    ADD CONSTRAINT "CasinoLicense_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES public."Casino"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoLicense CasinoLicense_licenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoLicense"
    ADD CONSTRAINT "CasinoLicense_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES public."License"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoMarket CasinoMarket_casinoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoMarket"
    ADD CONSTRAINT "CasinoMarket_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES public."Casino"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoMarket CasinoMarket_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoMarket"
    ADD CONSTRAINT "CasinoMarket_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public."Market"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CasinoTranslation CasinoTranslation_casinoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CasinoTranslation"
    ADD CONSTRAINT "CasinoTranslation_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES public."Casino"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Casino Casino_payoutSpeedId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Casino"
    ADD CONSTRAINT "Casino_payoutSpeedId_fkey" FOREIGN KEY ("payoutSpeedId") REFERENCES public."PayoutSpeedOption"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CategoryTranslation CategoryTranslation_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CategoryTranslation"
    ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LicenseTranslation LicenseTranslation_licenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LicenseTranslation"
    ADD CONSTRAINT "LicenseTranslation_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES public."License"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MarketTranslation MarketTranslation_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MarketTranslation"
    ADD CONSTRAINT "MarketTranslation_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public."Market"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PayoutSpeedOptionTranslation PayoutSpeedOptionTranslation_optionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayoutSpeedOptionTranslation"
    ADD CONSTRAINT "PayoutSpeedOptionTranslation_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES public."PayoutSpeedOption"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StaticPageTranslation StaticPageTranslation_pageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StaticPageTranslation"
    ADD CONSTRAINT "StaticPageTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES public."StaticPage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserReview UserReview_casinoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "UserReview_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES public."Casino"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserReview UserReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "UserReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict XFeDYFZHqGrjKs1lpsMM5hZQCqaEvGat3c5I3DsyqcXqLw2YHjiuALMokF7HlNU


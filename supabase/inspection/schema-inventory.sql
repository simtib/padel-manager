-- Run on BOTH environments using psql -X -qAt -v ON_ERROR_STOP=1 -f this-file.
-- Metadata only; no application rows, auth users, tokens or Storage objects.
-- Keep exported results private: definitions may contain deployment details.
BEGIN READ ONLY;
SET LOCAL search_path = pg_catalog;
WITH namespaces AS (
  SELECT oid, nspname, nspacl FROM pg_namespace
  WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema'
), relations AS (
  SELECT c.*, n.nspname FROM pg_class c JOIN namespaces n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
), inventory AS (
  SELECT 'schemas' AS section, nspname AS object_name,
    jsonb_build_object('name', nspname, 'acl', nspacl::text) AS definition FROM namespaces
  UNION ALL
  SELECT 'relations', nspname || '.' || relname,
    jsonb_build_object('kind', relkind, 'rls', relrowsecurity, 'force_rls', relforcerowsecurity,
      'acl', relacl::text, 'owner', pg_get_userbyid(relowner),
      'replica_identity', relreplident, 'options', reloptions,
      'partition_bound', pg_get_expr(relpartbound,oid),
      'partition_key', CASE WHEN relkind = 'p' THEN pg_get_partkeydef(oid) END,
      'view', CASE WHEN relkind IN ('v','m') THEN pg_get_viewdef(oid, true) END)
    FROM relations
  UNION ALL
  SELECT 'columns', r.nspname || '.' || r.relname || '.' || a.attname,
    jsonb_build_object('position', a.attnum, 'type', format_type(a.atttypid,a.atttypmod),
      'not_null', a.attnotnull, 'identity', a.attidentity, 'generated', a.attgenerated,
      'default', pg_get_expr(d.adbin,d.adrelid), 'acl', a.attacl::text,
      'collation', CASE WHEN a.attcollation <> 0 THEN a.attcollation::regcollation::text END)
    FROM relations r JOIN pg_attribute a ON a.attrelid = r.oid
    LEFT JOIN pg_attrdef d ON d.adrelid = r.oid AND d.adnum = a.attnum
    WHERE a.attnum > 0 AND NOT a.attisdropped
  UNION ALL
  SELECT 'constraints', n.nspname || '.' || COALESCE(r.relname,t.typname) || '.' || c.conname,
    jsonb_build_object('type',c.contype,'definition',pg_get_constraintdef(c.oid,true),'validated',c.convalidated)
    FROM pg_constraint c JOIN namespaces n ON n.oid = c.connamespace
    LEFT JOIN pg_class r ON r.oid = c.conrelid LEFT JOIN pg_type t ON t.oid = c.contypid
  UNION ALL
  SELECT 'indexes', r.nspname || '.' || r.relname,
    jsonb_build_object('definition',pg_get_indexdef(r.oid),'valid',i.indisvalid)
    FROM pg_class r0 JOIN pg_index i ON i.indexrelid = r0.oid
    JOIN (SELECT c.*,n.nspname FROM pg_class c JOIN namespaces n ON n.oid=c.relnamespace) r ON r.oid=r0.oid
  UNION ALL
  SELECT 'functions', n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
    jsonb_build_object('definition',pg_get_functiondef(p.oid),'acl',p.proacl::text,'owner',pg_get_userbyid(p.proowner))
    FROM pg_proc p JOIN namespaces n ON n.oid=p.pronamespace
    WHERE p.prokind IN ('f','p','w')
  UNION ALL
  SELECT 'triggers', r.nspname || '.' || r.relname || '.' || t.tgname,
    jsonb_build_object('definition',pg_get_triggerdef(t.oid,true),'enabled',t.tgenabled)
    FROM pg_trigger t JOIN relations r ON r.oid=t.tgrelid WHERE NOT t.tgisinternal
  UNION ALL
  SELECT 'policies', schemaname || '.' || tablename || '.' || policyname,
    to_jsonb(p) - 'schemaname' - 'tablename' - 'policyname' FROM pg_policies p
  UNION ALL
  SELECT 'types', n.nspname || '.' || t.typname,
    jsonb_build_object('kind',t.typtype,'base',format_type(t.typbasetype,t.typtypmod),
      'not_null',t.typnotnull,'default',t.typdefault,'acl',t.typacl::text,
      'enum_values',(SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder) FROM pg_enum e WHERE e.enumtypid=t.oid),
      'attributes',(SELECT jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod)) ORDER BY a.attnum)
        FROM pg_attribute a WHERE a.attrelid=t.typrelid AND a.attnum>0 AND NOT a.attisdropped),
      'range',(SELECT jsonb_build_object('subtype',format_type(g.rngsubtype,NULL),
         'canonical',g.rngcanonical::regproc::text,'subdiff',g.rngsubdiff::regproc::text) FROM pg_range g WHERE g.rngtypid=t.oid))
    FROM pg_type t JOIN namespaces n ON n.oid=t.typnamespace WHERE t.typtype IN ('e','d','r','m','c')
  UNION ALL
  SELECT 'sequences', schemaname || '.' || sequencename,
    to_jsonb(s) - 'last_value' FROM pg_sequences s
  UNION ALL
  SELECT 'extensions', e.extname,
    jsonb_build_object('version',e.extversion,'schema',n.nspname,'relocatable',e.extrelocatable)
    FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace
  UNION ALL
  SELECT 'default_permissions', pg_get_userbyid(d.defaclrole) || '.' || COALESCE(n.nspname,'*') || '.' || d.defaclobjtype::text,
    jsonb_build_object('acl',d.defaclacl::text)
    FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace
  UNION ALL
  SELECT 'roles', rolname,
    jsonb_build_object('superuser',rolsuper,'inherit',rolinherit,'create_role',rolcreaterole,
      'create_db',rolcreatedb,'login',rolcanlogin,'replication',rolreplication,'bypass_rls',rolbypassrls)
    FROM pg_roles
  UNION ALL
  SELECT 'role_memberships', pg_get_userbyid(roleid) || '.' || pg_get_userbyid(member),
    jsonb_build_object('admin_option',admin_option) FROM pg_auth_members
  UNION ALL
  SELECT 'publications', pubname,
    jsonb_build_object('all_tables',puballtables,'insert',pubinsert,'update',pubupdate,'delete',pubdelete,'truncate',pubtruncate)
    FROM pg_publication
  UNION ALL
  SELECT 'publication_tables', pubname || '.' || schemaname || '.' || tablename, to_jsonb(p)
    FROM pg_publication_tables p
  UNION ALL
  SELECT 'storage_buckets', id,
    jsonb_build_object('name',name,'public',public,'file_size_limit',file_size_limit,'allowed_mime_types',allowed_mime_types)
    FROM storage.buckets
)
SELECT jsonb_build_object('server_version',current_setting('server_version'),
  'objects',jsonb_agg(jsonb_build_object('section',section,'name',object_name,'definition',definition)
    ORDER BY section,object_name)) FROM inventory;
ROLLBACK;

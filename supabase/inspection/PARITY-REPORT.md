# Schema parity inspection — 2026-09-11

**Status: blocked on read-only Cloud access. Local baseline validation passed;
Cloud parity has NOT been established.**

## Isolation and writable-local follow-up

Both development commands now use the guarded CLI launcher. A development-only
Next.js config check also rejects Cloud Supabase URLs when the launcher is
bypassed. Production build/start configuration remains environment-specific.
An actual `npm run dev` startup with deliberately invalid Cloud-like shell
overrides still served port 3001 with the local Supabase URL; the override URL
was absent from browser scripts. This is a configuration safeguard, not a
machine-wide network firewall.

The local database has `default_transaction_read_only = off` and
`transaction_read_only = off`. A synthetic SQL update succeeded and was rolled
back. Studio returned HTTP 200. Expanded app tests passed event CRUD, signup,
confirmation/recovery, registration, private-group/event creation and cleanup,
and unauthorized edit denial. Another clean local reset passed all 16 migrations.
Only synthetic fixtures were used. Read-only Cloud schema access was rechecked
and still returned HTTP 401, `Unregistered API key`.

Production equivalence remains unverified. No Cloud-only schema, policy, function,
trigger, extension, or bucket has been invented. Known environment differences
are local Docker endpoints, local captured email instead of delivery, synthetic
data, disabled OAuth providers and optional analytics, and unverified engine/
extension/service versions. Cloud-managed backups, HA, platform networking and
external provider integrations are not reproduced by the local stack. Supply
the read-only catalog export below before changing migrations for parity.

## Cloud evidence and access

- No Cloud database connection string or schema export was available locally.
- `supabase projects list -o json` returned `Unauthorized`.
- A read-only OpenAPI request using the publishable key returned HTTP 401,
  `Secret API key required`; the configured service key returned HTTP 401,
  `Unregistered API key`.
- Therefore no Cloud schema objects, RLS policies, functions, grants, Storage
  configuration, extension versions, or manual Studio changes could be verified.
  Unknown does not mean absent or equivalent.
- No Cloud writes, migration pushes, resets, repairs, policy changes, function
  changes, or Storage changes were performed. No secrets were printed or copied
  into migrations/seed. Nothing was committed or pushed.

## Verified local baseline

The metadata-only inventory is saved privately in the ignored
`supabase/schema-exports/local-inventory.json` directory. PostgreSQL version: 17.6.

| Category | Local finding | Cloud comparison |
| --- | --- | --- |
| Application tables | 18 public tables, 122 columns | Unknown |
| Keys/constraints | 78 constraints; definitions captured | Unknown |
| Indexes | 46 public indexes | Unknown |
| RLS | Enabled on all 18 public tables; 53 public policies | Unknown; none corrected |
| Functions | 15 public functions; definitions, owners, ACLs captured | Unknown |
| Triggers | 12 public triggers and `auth.users.on_auth_user_created` | Unknown |
| Storage | No buckets; no custom Storage RLS policies | Unknown |
| Realtime | `events`, `event_participants`, `matches` published | Unknown |
| Extensions | pgcrypto 1.3, uuid-ossp 1.1, pg_stat_statements 1.11, supabase_vault 0.3.1, plpgsql 1.0 | Unknown |
| Other metadata | Schemas, types, sequences without current values, views, grants/default ACLs and role memberships captured | Unknown |

No parity migrations were created or modified. Existing synthetic seed data and
all 16 existing migration files were preserved. No Cloud-only objects or manual
Studio changes were guessed. Intentionally unreconciled differences: all possible
Cloud/local differences, until Cloud metadata is supplied. Existing local-only
service choices (Docker endpoints, captured email, disabled analytics) remain.

The application uses email/password Auth and public schema queries/RPCs; no
application Storage API usage was found. The tracked database types lag the local
schema: `events.format`, `events.player_group_id`/its relationship and newer RPCs
such as `create_event`, `create_player_group`, `delete_event`, `delete_player_group`
and `update_event_settings` are missing. Fresh LOCAL types were generated to ignored
`supabase/schema-exports/local-database.types.ts`; active types were not replaced
with an unreconciled schema snapshot.

## Validation performed

- `npm run supabase:reset` (`supabase db reset --local`): passed all 16 migrations
  from an empty local database and loaded one fictional club and two courts.
- `npm run lint`: passed.
- `npm run build:local`: passed all existing Next.js routes.
- Safety/roster regression tests: all five passed.
- `node scripts/verify-local.mjs`: passed local Auth settings, CORS, signup/profile
  trigger, captured confirmation/recovery emails, session cookies, redirects to
  port 3001, magic-link redirect configuration, seed queries, event creation,
  cross-account registration visibility, and anonymous event-creation denial.
- Synthetic test users and events were removed afterwards; seed remained intact.
- `http://localhost:3001`: HTTP 200. Served browser scripts reference local
  Supabase (`http://127.0.0.1:54321`) and not the Cloud API URL.
- Port 3000 and its application were not modified.

## Required manual input

Provide a read-only PostgreSQL connection privately as `CLOUD_DATABASE_URL`, or
run `supabase/inspection/schema-inventory.sql` in the Cloud SQL Editor and save
its single JSON result as `supabase/schema-exports/cloud-inventory.json`.
This query is tested locally and explicitly uses `BEGIN READ ONLY`.

With psql installed, the equivalent command is:

```powershell
psql "$env:CLOUD_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 -f supabase/inspection/schema-inventory.sql -o supabase/schema-exports/cloud-inventory.json
```

The README's schema-only `supabase db dump --db-url ... --schema public --file ...`
command can supplement this catalog export. Do not send passwords in chat. Keep
exports private because function definitions may contain deployment details.
Once Cloud metadata is available, compare it to the local inventory, reconcile
only local migrations, regenerate LOCAL types if needed, and repeat local reset
and application checks. No Cloud write is needed for that process.

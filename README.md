# Padel Manager - Next.js + Supabase Migration Guide & Production Setup

This application has been migrated from a Vite single-page prototype to a full production architecture using **Next.js App Router**, **TypeScript**, **Supabase PostgreSQL**, **Supabase Authentication**, **Row Level Security (RLS)**, and **Supabase Realtime**, ready for deployment to **Vercel**.

---

## 1. Migrated Architecture Overview

- **Framework**: Next.js App Router (`/src/app`) with Next.js Server & Client Components
- **Domain Layer**: Dedicated tournament domain engine at `src/lib/tournament/` containing pure functions for:
  - `team-generator.ts` (Preferred partner priority + automatic pair generation)
  - `partner-matching.ts` (Validation and pairing requests)
  - `group-generator.ts` (4-team group division)
  - `round-robin.ts` (6 matches per 4-team group with court rotation)
  - `court-allocation.ts` (Court rotation assignments)
  - `standings.ts` (Tiebreak rules, points, score diff, head-to-head)
  - `qualification.ts` (Identifying top group qualifiers)
  - `knockout.ts` (Quarter-finals, semi-finals, and final bracket advancement)
  - `player-statistics.ts` (Player profile match & event stats calculation)
  - `validation.ts` (Score checks, permissions, waiting list auto-promotion)
- **Unit Tests**: Domain engine unit tests located in `src/lib/tournament/__tests__/tournament.test.ts`
- **Database Backend**: Supabase PostgreSQL with relational tables, foreign keys, triggers, and Row Level Security (RLS)
- **Authentication**: Supabase SSR Authentication (Email + Password only)
- **UI Preservation**: Complete visual design, dark theme, navigation tabs, modals, and UAE venue integration preserved.

---

## 2. Database Schema & Tables Created

SQL migration files are located in `supabase/migrations/20260101000000_init_schema.sql`.

### Relational Tables:
1. `profiles`: Extends `auth.users` with `first_name`, `last_name`, `display_name`, `email`, `phone`, `avatar_url`
2. `facilities`: UAE padel venues (`name`, `address`, `city`, `google_maps_url`)
3. `courts`: Courts linked to facilities (`facility_id`, `name`, `court_number`, `is_active`)
4. `events`: Parent event model for normal 2v2 games and tournaments (`owner_id`, `event_type`, `invite_code`, `status`, `max_players`)
5. `event_courts`: Junction table linking events to assigned courts
6. `event_admins`: Organizers and co-admins (`event_id`, `user_id`, `role`)
7. `guest_players`: Non-registered guest entries added by users
8. `event_participants`: Confirmed and waiting list registrations (`user_id` / `guest_player_id`)
9. `partner_requests`: Preferred partner requests (`requester_participant_id`, `requested_participant_id`, `status`)
10. `teams`: Two-player teams (`event_id`, `name`, `team_number`, `is_locked`)
11. `team_members`: Links participants to teams (`team_id`, `participant_id`)
12. `tournament_groups`: Tournament groups (`event_id`, `name`, `group_order`)
13. `tournament_group_teams`: Links teams to 4-team groups
14. `matches`: Group and knockout match records (`team_a_id`, `team_b_id`, `team_a_score`, `team_b_score`, `winner_team_id`, `next_match_id`)
15. `tournament_rules`: Points rules and tiebreak order (`points_win`, `points_draw`, `points_loss`, `qualifiers_per_group`)
16. `player_groups`: Reusable player pools ("Friday Padel Crew")
17. `player_group_members`: Memberships for player groups

---

## 3. Row Level Security (RLS) Policies

All tables in the `public` schema have Row Level Security enabled:

- **Profiles**: Authenticated users can view profiles; users can update only their own profile.
- **Events & Participants**: Public read for participants; updates restricted to event owner and co-admins.
- **Teams & Matches**: Read access for participants; score submission permitted for match players or event admins.
- **Player Groups**: Access restricted to group owner and active members.

## Local development with Supabase CLI

Install Node.js 22 or newer and Docker Desktop (Linux containers), then start Docker.
`npm ci` installs the pinned official Supabase CLI; use `npx supabase` from this
directory. No global CLI installation or custom Docker Compose stack is needed.

```sh
npm ci
npm run supabase:start
npm run supabase:env
npm run dev:local
```

The first start downloads Docker images, applies **all** migrations in timestamp
order, and loads `supabase/seed.sql`. Open **http://localhost:3001** for Next.js,
**http://localhost:54323** for Studio, and **http://localhost:54324** for captured
email. Supabase's API is at **http://127.0.0.1:54321**; PostgreSQL uses port 54322.
Both `npm run dev` and `npm run dev:local` explicitly use port 3001. Use
`localhost:3001` consistently for auth cookies. Other applications' ports are
unaffected; if 3001 is occupied, these commands fail instead of choosing another port.

`supabase:env` writes ignored `.env.development.local`, which takes precedence over
`.env.local` in Next.js development. It preserves the existing `.env.local` byte
for byte and refuses to overwrite a manually maintained `.env.development.local`.
Both `npm run dev` and `npm run dev:local` use the same guarded launcher: it reads
the running CLI's credentials, injects them ahead of shell/env files, verifies a
loopback API URL, and fails if the local stack is unavailable. It never falls
back to cloud and needs no generated env file. Direct `next dev` also rejects
non-local Supabase URLs or an incorrect local app origin at config load time.
Production builds and servers retain their environment-specific configuration.
These are application configuration guards, not a machine-wide network firewall.

The local database is fully read/write. Studio at `http://localhost:54323` can
inspect and edit local data; app clients remain governed by the real RLS policies.
The inspection SQL's `BEGIN READ ONLY` applies only to its export transaction,
not to the database or normal app sessions. Synthetic accounts can be created
through signup and edited in Studio; no production data is copied.

```sh
npm run supabase:status
npx supabase status -o env
```

Map `API_URL` to `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY` to the existing
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` name. Both legacy anon and publishable keys
work with the existing clients. The service-role key is server-only and currently
not required by the app. Never put it in a `NEXT_PUBLIC_*` variable. Credentials
and CLI temporary state are ignored by Git; don't commit status output.

### Authentication and seed data

Sign up through the app using a fictional address such as `player@example.test`.
Open the local inbox and follow the confirmation link. Password reset emails
also stay in that inbox. Local templates use the existing `/auth/confirm` token
verification route; recovery tokens lead to `/reset-password`. No real SMTP,
production users, or production data are used. Local signup requires confirmation;
pre-existing cloud Auth settings and email templates remain independently managed.

The local Auth Site URL is `http://localhost:3001`; allowed app redirects are
`/auth/confirm` and `/reset-password` on that port (including the loopback IP alias).
The app currently uses email/password, not an OAuth or magic-link login UI.
Magic-link redirects use the same allowed app origin. OAuth providers remain
disabled; if enabled later, their provider callback belongs to Supabase at
`http://127.0.0.1:54321/auth/v1/callback`, with the final app redirect on port 3001.
There is no separate application CORS allowlist to change. Production URLs remain
environment-specific, and `npm run start` retains the hosting environment's port.

The seed creates one fictional club, eight courts, and a confirmed local-only super
admin (`superadmin@example.test`, password `LocalPadel-Only-2026!`).
Create accounts, groups, and events through the app. Existing client-side demo
and cached state is preserved; use a fresh browser profile when switching from
an old cloud-backed localhost session to avoid displaying cached cloud data.
The existing venue/group loading behavior is unchanged; Studio can inspect the
seeded records even where the UI still uses client-side state.

### Reset, stop, and validate

```sh
npm run supabase:reset
# Equivalent: npx supabase db reset --local
# Plain npx supabase db reset also defaults to local.
npm run supabase:stop
```

Reset deletes **local** database data, replays migrations, and reloads the seed.
Stop retains local data for the next start. The npm helpers reject extra arguments,
so remote flags cannot be appended to `supabase:reset`. Never run `db reset
--linked` or `db reset --db-url` against cloud. None of the local scripts link,
push, repair migration history, or change cloud configuration.

```sh
npm run lint
npm run build:local
node --test scripts/supabase-local.test.mjs scripts/event-sync.test.cjs
# With dev:local running in another terminal:
node scripts/verify-local.mjs
```

`build:local` injects Docker credentials for compilation; the existing `build`
script remains available for deployments. Public environment variables are baked
into Next.js builds, so build separately for each environment. Do not deploy a
local build to staging or production.

### New migrations

```sh
npx supabase migration new describe_change
# Edit the new SQL file, then replay against local Docker:
npm run supabase:reset
# Or capture deliberate local Studio changes:
npx supabase db diff --local -f describe_change
```

Review generated SQL, RLS, and grants before committing. Keep existing migration
files immutable. The migration chain includes tables, foreign keys, indexes,
functions, triggers, RLS, and Realtime publication membership. Domain values use
text CHECK constraints, not PostgreSQL enums. Supabase manages the auth/storage
system schemas; the app has no Storage API usage or bucket migrations, so no
application buckets are invented. `match_sets` is also created by the hardening
migration. The tracked database types predate some newer RPCs/columns; regenerate
to a temporary file with `npx supabase gen types typescript --local` and review
the diff before replacing `src/types/database.types.ts`.

## Staging and production

| Environment | Database | App configuration |
| --- | --- | --- |
| Local development | CLI-managed Docker, `padel-manager-local` | `dev:local` or generated `.env.development.local` |
| Staging | A **separate** Supabase Cloud project | Staging hosting environment variables |
| Production | Existing Supabase Cloud project | Existing production hosting environment variables |

Keep the same variable names in external hosting settings:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and
`NEXT_PUBLIC_SITE_URL`. Set `SUPABASE_SERVICE_ROLE_KEY` only if server tooling needs
it. Each environment must use its own credentials. `.env.example` documents local
placeholders; do not copy it over an existing `.env.local` containing cloud values.
The local config's Postgres major version is 17, the CLI default; verify the cloud
version before claiming version parity.

For a **future, separately created staging project**, first review the migrations
and use a dedicated checkout/CI job with staging credentials. These are manual
remote actions, never part of local startup:

```sh
npx supabase login
npx supabase link --project-ref YOUR_STAGING_PROJECT_REF
npx supabase db push --linked --dry-run
# After reviewing the target and SQL:
npx supabase db push --linked
```

Do not pass `--include-seed`. Set staging Auth Site URL and allowed redirects to
that staging application's `/auth/confirm` and `/reset-password` URLs and configure
its email provider/templates separately. Keep existing production settings intact.
Existing projects with manually applied SQL need a schema/history comparison
before any push; do not blindly apply the full migration chain or repair history.

### Read-only cloud schema comparison

The migration files represent the repository's required schema, not a verified
snapshot of cloud. To establish parity, obtain a PostgreSQL connection string
through the Dashboard and perform a **schema-only, read-only export**. In
PowerShell, with `CLOUD_DATABASE_URL` supplied privately by your secret manager:

```powershell
New-Item -ItemType Directory -Force supabase/schema-exports
npx supabase db dump --db-url "$env:CLOUD_DATABASE_URL" --schema public --file supabase/schema-exports/cloud-public.sql
```

This does not apply SQL or migrate cloud. Supabase's managed auth/storage schemas
are omitted by the CLI dump, so also export the following read-only query results
from the cloud SQL Editor to compare managed-schema customizations:

```sql
SHOW server_version;
SELECT extname, extversion, extnamespace::regnamespace FROM pg_extension;
SELECT pg_get_triggerdef(oid) FROM pg_trigger
  WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
SELECT * FROM pg_policies WHERE schemaname = 'storage';
SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets;
SELECT schemaname, tablename FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime';
```

Keep exports private; do not export customer rows or credentials. Auth dashboard
settings, SMTP settings, and bucket configuration require a separate read-only
review. No cloud export or database write is required to start local development.

For a complete catalog comparison, run
`supabase/inspection/schema-inventory.sql` against both databases. It uses an
explicit read-only transaction and exports definitions, keys/constraints, indexes,
types, sequences (without current values), views, functions, triggers, extensions,
RLS, ACLs, Storage bucket settings, and Realtime publication metadata. It does not
read application rows, auth users, tokens, or stored files. Exported function
definitions may contain deployment details; keep the results in the ignored
`supabase/schema-exports/` directory and review before sharing.

With PostgreSQL client tools installed and the connection URL supplied privately:

```powershell
psql "$env:CLOUD_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 -f supabase/inspection/schema-inventory.sql -o supabase/schema-exports/cloud-inventory.json
```

Alternatively, run the same SQL in the Cloud SQL Editor and save the returned
JSON value as `supabase/schema-exports/cloud-inventory.json`. A Supabase service
API key alone is not a PostgreSQL connection string and cannot inspect all RLS,
trigger, constraint, and grant metadata. Never create a cloud RPC just to export
the catalog, and never use `db push`, `db reset --linked`, or `migration repair`
as a schema-inspection workaround.

The read-only Cloud Auth settings check confirmed email/password signup and email
confirmation are enabled. Full cloud schema parity remains unverified: the public
API did not expose its schema and no working database export credential was
available. No existing migrations have been rewritten. The new Realtime migration
turns the old documented Dashboard setup into reproducible SQL, but the current
cloud publication membership still needs the read-only comparison above.

Optional local analytics is disabled: the Vector log collector could not reach
Docker Desktop's TCP API on this Windows host. Core services work without it;
use `docker logs` for local diagnostics. This does not change cloud logging.

References: [official local workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
and [seed behavior](https://supabase.com/docs/guides/local-development/seeding-your-database).

Validation on 2026-09-09: official CLI start/stop and local reset succeeded; all 16
migrations and synthetic seed replayed; all application tables had RLS enabled.
TypeScript, all existing Next.js build routes, and five regression/safety tests
passed. `verify-local.mjs` passed signup/profile creation, captured confirmation
and recovery emails, SSR session cookies, seed reads, event creation, registration
visibility across accounts, and anonymous RPC denial. Its test users were removed.
Port 3001 is the official local app port. Confirmation and recovery links use
that origin directly, without test-time URL rewriting. The browser build
contained the local API URL and no cloud API URL.
The original `.env.local` hash was unchanged, and no cloud writes were performed.
Port-3001 verification also passed the normal `npm run dev` startup, actual email
links and final redirects without rewriting, browser local-Supabase configuration,
CORS, and magic-link redirect configuration. OAuth providers remain disabled.

### Feedback and local administrators

Signed-in players can open **Provide Feedback** and **My Feedback** from their
profile menu. **My Feedback** is also available on the Profile page, including
before the first submission. Players see only their own submissions and statuses.

**Manage Feedback** appears in both places only for application administrators.
This is a separate role from organizing an event. Administrators can read all
feedback and set its status to New, Reviewing, Planned, Done, or Rejected; they
cannot overwrite the author's submission text. Database permissions enforce these
rules independently of the UI. New signups always receive the `user` role.

Apply pending migrations to the running **local** database with
`npx --no-install supabase migration up --local`. Sign in as the seeded local
super admin and open `/admin` → Users to assign or remove roles.
A local reset removes manual role assignments and restores the seeded account.
Do not perform this setup against the existing Cloud project as part of local
development; its schema and permissions remain unchanged.

Run `node scripts/verify-feedback.mjs` with local Supabase running to check feedback
ownership, moderation permissions, role revocation, and rejected self-promotion.
It creates synthetic local accounts and removes them after the checks.

### Application roles and administration

`profiles.role` is a non-null enum: `user`, `admin`, or `super_admin`. The role
migration backfills the old feedback admin list to `admin` and removes
`application_admins` so it cannot remain an alternative privilege source.
The migration itself creates no privileged accounts. The test super admin is
created only by `supabase/seed.sql`, for the local Docker environment.

| Capability | user | admin | super_admin |
| --- | --- | --- | --- |
| Games, player directory, club browsing, own profile and feedback | Yes | Yes | Yes |
| Read full user profiles and edit names/phone | No | Yes | Yes |
| Manage clubs and courts | No | Yes | Yes |
| Read all feedback and moderate its status | No | Yes | Yes |
| Create and update internal support cases | No | Yes | Yes |
| Assign/revoke any application role and read role history | No | No | Yes |

The protected `/admin` page redirects unauthenticated visitors to `/login` and
normal users to `/dashboard`. Its `/api/admin` endpoints independently return
401/403 and recheck the caller's current database role on every request. Writes
validate input and origin, and use the caller's session, never a service-role
client. RLS and column privileges also enforce permissions on direct Supabase
requests. Existing sessions lose access when their database role is revoked.

Role updates use the checked `set_user_role` RPC and produce immutable audit
records. Neither normal profile updates, inserts/upserts, nor editable Auth
metadata can set a role. Super admins cannot change their own role; another
super admin must do that, preventing the last super admin from demoting themself.
Event ownership/co-admin membership never grants application administration.

Full profile/contact information is restricted to the owner and app admins. The
read-only `player_directory` view intentionally exposes just player names,
avatars, IDs and creation dates to signed-in players for game/group selection.
Internal support cases are separate from player-visible feedback. User management
edits profile details; it does not change Auth passwords, email addresses or
delete Auth accounts.

Local setup and verification (no Cloud commands):

```powershell
npm run supabase:start
npm run supabase:reset
npm run dev:local
# In a second terminal:
node scripts/verify-roles.mjs
node scripts/verify-feedback.mjs
node scripts/verify-local.mjs
node --test scripts/supabase-local.test.mjs scripts/event-sync.test.cjs
npm run lint
npm run build:local
```

Open `http://localhost:3001/login` with the local super-admin credentials above,
then visit `http://localhost:3001/admin`. Create additional local players through
signup (email captured at `http://localhost:54324`) and assign roles in Users.
The role integration suite creates temporary users/admins, tests all three roles
against RLS and real HTTP endpoints, verifies privilege escalation and revocation,
then cleans up its synthetic records. It derives credentials only from local CLI
status and refuses a non-loopback Supabase URL. Never deploy the local seed or
test credentials to Cloud.

Local validation on 2026-09-12: `npm run supabase:reset` successfully replayed
all migrations and loaded the super-admin seed. `verify-roles.mjs` passed for
anonymous access and all three roles, including direct RLS checks, protected
HTTP routes, rejected self-promotion, role history, and existing-session
revocation. Feedback and normal authentication/game integration checks also
passed. All testing used the local Docker stack; no Cloud changes were made.

---

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

---

## 4. Required Environment Variables

Copy `.env.example` to `.env.local` for local development or add to Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

---

## 5. Manual Supabase Setup Steps

1. **Create Supabase Project**: Go to [Supabase Dashboard](https://app.supabase.com) and create a new project.
2. **Apply Migrations**: Navigate to SQL Editor in Supabase Dashboard and run the contents of `supabase/migrations/20260101000000_init_schema.sql`.
3. **Configure Authentication**:
   - Enable Email/Password auth provider under Authentication > Providers.
   - Set Site URL to your production Vercel URL (e.g. `https://your-app.vercel.app`).
   - Add Allowed Redirect URLs: `https://your-app.vercel.app/**`, `http://localhost:3000/**`.
4. **Configure Email Templates & Custom SMTP**: Set up custom SMTP (Resend, SendGrid, Postmark) for production email verification and password reset emails.
5. **Realtime Configuration**: Enable Realtime on `matches`, `events`, and `event_participants` tables in Database > Publication.

---

## 6. Manual Vercel Setup Steps

1. **Import Repository**: Connect your GitHub repository to Vercel.
2. **Set Framework Preset**: Select **Next.js**.
3. **Configure Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy**: Trigger initial deployment. Direct URL refreshes and SSR session handling will function out of the box.

---

## 7. Build Verification

- TypeScript check (`npm run lint`): **PASSED**
- Production build (`npm run build`): **PASSED**

-- Initial Schema Migration for Padel Manager Supabase Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FACILITIES TABLE
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United Arab Emirates',
  google_maps_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COURTS TABLE
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  court_number INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('normal_game', 'tournament')),
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'full', 'teams_generated', 'ready', 'in_progress', 'knockout', 'completed', 'cancelled')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  max_players INTEGER NOT NULL DEFAULT 48,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EVENT COURTS TABLE
CREATE TABLE IF NOT EXISTS public.event_courts (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, court_id)
);

-- 6. EVENT ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.event_admins (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'co_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- 7. GUEST PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.guest_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EVENT PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_player_id UUID REFERENCES public.guest_players(id) ON DELETE CASCADE,
  registration_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (registration_status IN ('confirmed', 'waiting_list', 'withdrawn')),
  registered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT participant_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_player_id IS NULL) OR
    (user_id IS NULL AND guest_player_id IS NOT NULL)
  )
);

-- 9. PARTNER REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.partner_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  requester_participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  requested_participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_partner_pair UNIQUE (event_id, requester_participant_id, requested_participant_id)
);

-- 10. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT,
  team_number INTEGER,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, participant_id)
);

-- 12. TOURNAMENT GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.tournament_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. TOURNAMENT GROUP TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.tournament_group_teams (
  group_id UUID NOT NULL REFERENCES public.tournament_groups(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  seed INTEGER,
  PRIMARY KEY (group_id, team_id)
);

-- 14. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.tournament_groups(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('group', 'round_of_16', 'quarter_final', 'semi_final', 'final', 'normal')),
  round_number INTEGER NOT NULL DEFAULT 1,
  court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
  team_a_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team_a_score INTEGER,
  team_b_score INTEGER,
  winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ready', 'in_progress', 'completed')),
  scheduled_order INTEGER,
  next_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  next_match_slot TEXT CHECK (next_match_slot IN ('1', '2')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. TOURNAMENT RULES TABLE
CREATE TABLE IF NOT EXISTS public.tournament_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID UNIQUE NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  points_win INTEGER NOT NULL DEFAULT 3,
  points_draw INTEGER NOT NULL DEFAULT 1,
  points_loss INTEGER NOT NULL DEFAULT 0,
  qualifiers_per_group INTEGER NOT NULL DEFAULT 2,
  allow_draw BOOLEAN NOT NULL DEFAULT FALSE,
  ranking_rules JSONB NOT NULL DEFAULT '["points", "matchesWon", "scoreDiff", "scoreFor", "headToHead"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. PLAYER GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.player_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PLAYER GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.player_group_members (
  group_id UUID NOT NULL REFERENCES public.player_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- INDEXES FOR FREQUENT QUERIES
CREATE INDEX IF NOT EXISTS idx_events_owner_id ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_invite_code ON public.events(invite_code);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_event_id ON public.teams(event_id);
CREATE INDEX IF NOT EXISTS idx_tournament_groups_event_id ON public.tournament_groups(event_id);
CREATE INDEX IF NOT EXISTS idx_matches_event_id ON public.matches(event_id);
CREATE INDEX IF NOT EXISTS idx_matches_group_id ON public.matches(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_court_id ON public.matches(court_id);
CREATE INDEX IF NOT EXISTS idx_player_group_members_user_id ON public.player_group_members(user_id);

-- TRIGGER FOR AUTH USER CREATION AUTOMATIC PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Player'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_group_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_group_members ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Facilities & Courts Policies
CREATE POLICY "Facilities are viewable by authenticated users" ON public.facilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Facilities editable by creator" ON public.facilities
  FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Courts are viewable by authenticated users" ON public.courts
  FOR SELECT TO authenticated USING (true);

-- Events Policies
CREATE POLICY "Events viewable by authenticated users" ON public.events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Events insertable by authenticated users" ON public.events
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Events editable by owner or co-admin" ON public.events
  FOR UPDATE TO authenticated USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.event_admins WHERE event_id = events.id AND user_id = auth.uid())
  );

CREATE POLICY "Events deletable by owner" ON public.events
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Event Courts & Event Admins Policies
CREATE POLICY "Event courts viewable by authenticated users" ON public.event_courts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Event admins viewable by authenticated users" ON public.event_admins
  FOR SELECT TO authenticated USING (true);

-- Participants Policies
CREATE POLICY "Participants viewable by authenticated users" ON public.event_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Participants insertable by logged in user" ON public.event_participants
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() OR registered_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
  );

CREATE POLICY "Participants manageable by self or event admin" ON public.event_participants
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR registered_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
  );

-- Guest Players
CREATE POLICY "Guest players viewable by authenticated users" ON public.guest_players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Guest players insertable by authenticated users" ON public.guest_players
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Partner Requests
CREATE POLICY "Partner requests viewable by event participants" ON public.partner_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Partner requests manageable by involved users" ON public.partner_requests
  FOR ALL TO authenticated USING (true);

-- Teams & Team Members
CREATE POLICY "Teams viewable by authenticated users" ON public.teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teams manageable by event owner or admin" ON public.teams
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.event_admins WHERE event_id = events.id AND user_id = auth.uid())))
  );

CREATE POLICY "Team members viewable by authenticated users" ON public.team_members
  FOR SELECT TO authenticated USING (true);

-- Groups & Matches
CREATE POLICY "Tournament groups viewable by authenticated users" ON public.tournament_groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tournament group teams viewable by authenticated users" ON public.tournament_group_teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Matches viewable by authenticated users" ON public.matches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Matches score entry by match participants or event admins" ON public.matches
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.event_admins WHERE event_id = events.id AND user_id = auth.uid())))
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.event_participants ep ON ep.id = tm.participant_id
      WHERE (tm.team_id = matches.team_a_id OR tm.team_id = matches.team_b_id)
      AND ep.user_id = auth.uid()
    )
  );

-- Tournament Rules
CREATE POLICY "Tournament rules viewable by authenticated users" ON public.tournament_rules
  FOR SELECT TO authenticated USING (true);

-- Player Groups
CREATE POLICY "Player groups viewable by members or owner" ON public.player_groups
  FOR SELECT TO authenticated USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.player_group_members WHERE group_id = player_groups.id AND user_id = auth.uid())
  );

CREATE POLICY "Player groups manageable by owner" ON public.player_groups
  FOR ALL TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Player group members viewable by group members" ON public.player_group_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Player group members manageable by group owner or self" ON public.player_group_members
  FOR ALL TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.player_groups WHERE id = group_id AND owner_id = auth.uid())
  );

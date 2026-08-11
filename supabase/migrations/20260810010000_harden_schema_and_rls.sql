-- Harden authorization, relational integrity, and common query paths.
-- This migration is intentionally additive/idempotent so it can be applied to
-- databases created from the original development schema.

-- ---------------------------------------------------------------------------
-- Shared authorization helpers. SECURITY DEFINER avoids recursive RLS checks;
-- each helper has an immutable search path and execute access is constrained.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_event_admin(target_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = target_event_id
      AND (
        e.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.event_admins ea
          WHERE ea.event_id = e.id AND ea.user_id = auth.uid()
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_event(target_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = target_event_id
      AND (
        e.visibility = 'public'
        OR e.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.event_admins ea
          WHERE ea.event_id = e.id AND ea.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.event_participants ep
          WHERE ep.event_id = e.id AND ep.user_id = auth.uid()
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_event_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_event_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_event(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Correct RLS policies that were previously over-broad.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Events viewable by authenticated users" ON public.events;
CREATE POLICY "Events visible to public or involved users" ON public.events
  FOR SELECT TO authenticated
  USING (public.can_view_event(id));

DROP POLICY IF EXISTS "Courts insertable by authenticated users" ON public.courts;
CREATE POLICY "Courts insertable by facility creator" ON public.courts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id AND f.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Participants viewable by authenticated users" ON public.event_participants;
CREATE POLICY "Participants viewable by event viewers" ON public.event_participants
  FOR SELECT TO authenticated
  USING (public.can_view_event(event_id));

DROP POLICY IF EXISTS "Participants insertable by logged in user" ON public.event_participants;
CREATE POLICY "Participants insertable by self or event admin" ON public.event_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    (user_id = auth.uid() AND guest_player_id IS NULL AND registered_by = auth.uid())
    OR public.is_event_admin(event_id)
  );

DROP POLICY IF EXISTS "Participants manageable by self or event admin" ON public.event_participants;
CREATE POLICY "Participants updatable by self or event admin" ON public.event_participants
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_event_admin(event_id))
  WITH CHECK (user_id = auth.uid() OR public.is_event_admin(event_id));

CREATE POLICY "Participants deletable by self or event admin" ON public.event_participants
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_event_admin(event_id));

DROP POLICY IF EXISTS "Partner requests viewable by event participants" ON public.partner_requests;
CREATE POLICY "Partner requests viewable by involved users or admins" ON public.partner_requests
  FOR SELECT TO authenticated
  USING (
    public.is_event_admin(event_id)
    OR EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.id IN (requester_participant_id, requested_participant_id)
        AND ep.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Partner requests manageable by involved users" ON public.partner_requests;
CREATE POLICY "Partner requests insertable by requester" ON public.partner_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.id = requester_participant_id
        AND ep.event_id = partner_requests.event_id
        AND ep.user_id = auth.uid()
    )
  );
CREATE POLICY "Partner requests updatable by involved users or admins" ON public.partner_requests
  FOR UPDATE TO authenticated
  USING (
    public.is_event_admin(event_id)
    OR EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.id IN (requester_participant_id, requested_participant_id)
        AND ep.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_event_admin(event_id)
    OR EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.id IN (requester_participant_id, requested_participant_id)
        AND ep.user_id = auth.uid()
    )
  );
CREATE POLICY "Partner requests deletable by requester or admins" ON public.partner_requests
  FOR DELETE TO authenticated
  USING (
    public.is_event_admin(event_id)
    OR EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.id = requester_participant_id AND ep.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Prevent duplicate registrations and a participant appearing in two teams.
-- Existing duplicates must be resolved before these indexes can be installed.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_participants_user
  ON public.event_participants(event_id, user_id)
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_participants_guest
  ON public.event_participants(event_id, guest_player_id)
  WHERE guest_player_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_team_members_participant
  ON public.team_members(participant_id);

-- Useful indexes for foreign keys, RLS checks, and dashboard filters.
CREATE INDEX IF NOT EXISTS idx_events_date_status ON public.events(event_date, status);
CREATE INDEX IF NOT EXISTS idx_events_facility_id ON public.events(facility_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status_joined
  ON public.event_participants(event_id, registration_status, joined_at);
CREATE INDEX IF NOT EXISTS idx_event_admins_user_id ON public.event_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_requests_requester ON public.partner_requests(requester_participant_id);
CREATE INDEX IF NOT EXISTS idx_partner_requests_requested ON public.partner_requests(requested_participant_id);
CREATE INDEX IF NOT EXISTS idx_tournament_group_teams_team_id ON public.tournament_group_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_a_id ON public.matches(team_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_b_id ON public.matches(team_b_id);
CREATE INDEX IF NOT EXISTS idx_guest_players_created_by ON public.guest_players(created_by);
CREATE INDEX IF NOT EXISTS idx_player_groups_owner_id ON public.player_groups(owner_id);

-- Basic domain checks.
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_max_players_positive;
ALTER TABLE public.events ADD CONSTRAINT events_max_players_positive CHECK (max_players > 0);
ALTER TABLE public.courts DROP CONSTRAINT IF EXISTS courts_number_positive;
ALTER TABLE public.courts ADD CONSTRAINT courts_number_positive CHECK (court_number IS NULL OR court_number > 0);
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_scores_nonnegative;
ALTER TABLE public.matches ADD CONSTRAINT matches_scores_nonnegative CHECK (
  (team_a_score IS NULL OR team_a_score >= 0)
  AND (team_b_score IS NULL OR team_b_score >= 0)
);
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_distinct_teams;
ALTER TABLE public.matches ADD CONSTRAINT matches_distinct_teams CHECK (
  team_a_id IS NULL OR team_b_id IS NULL OR team_a_id <> team_b_id
);
ALTER TABLE public.tournament_rules DROP CONSTRAINT IF EXISTS tournament_rules_values_valid;
ALTER TABLE public.tournament_rules ADD CONSTRAINT tournament_rules_values_valid CHECK (
  points_win >= 0 AND points_draw >= 0 AND points_loss >= 0 AND qualifiers_per_group > 0
);

-- Validate that cross-table references all belong to the same event.
CREATE OR REPLACE FUNCTION public.validate_event_relationships()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  expected_event uuid;
BEGIN
  IF TG_TABLE_NAME = 'team_members' THEN
    SELECT event_id INTO expected_event FROM public.teams WHERE id = NEW.team_id;
    IF NOT EXISTS (
      SELECT 1 FROM public.event_participants
      WHERE id = NEW.participant_id AND event_id = expected_event
    ) THEN
      RAISE EXCEPTION 'Team member participant must belong to the team event';
    END IF;
  ELSIF TG_TABLE_NAME = 'tournament_group_teams' THEN
    SELECT event_id INTO expected_event FROM public.tournament_groups WHERE id = NEW.group_id;
    IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id = NEW.team_id AND event_id = expected_event) THEN
      RAISE EXCEPTION 'Team must belong to the tournament group event';
    END IF;
  ELSIF TG_TABLE_NAME = 'partner_requests' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.event_participants
      WHERE id = NEW.requester_participant_id AND event_id = NEW.event_id
    ) OR NOT EXISTS (
      SELECT 1 FROM public.event_participants
      WHERE id = NEW.requested_participant_id AND event_id = NEW.event_id
    ) THEN
      RAISE EXCEPTION 'Partner request participants must belong to the request event';
    END IF;
    IF NEW.requester_participant_id = NEW.requested_participant_id THEN
      RAISE EXCEPTION 'A participant cannot request themselves as partner';
    END IF;
  ELSIF TG_TABLE_NAME = 'matches' THEN
    IF NEW.group_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.tournament_groups WHERE id = NEW.group_id AND event_id = NEW.event_id
    ) THEN RAISE EXCEPTION 'Match group must belong to the match event'; END IF;
    IF NEW.team_a_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.teams WHERE id = NEW.team_a_id AND event_id = NEW.event_id
    ) THEN RAISE EXCEPTION 'Match team A must belong to the match event'; END IF;
    IF NEW.team_b_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.teams WHERE id = NEW.team_b_id AND event_id = NEW.event_id
    ) THEN RAISE EXCEPTION 'Match team B must belong to the match event'; END IF;
    IF NEW.winner_team_id IS NOT NULL
      AND NEW.winner_team_id IS DISTINCT FROM NEW.team_a_id
      AND NEW.winner_team_id IS DISTINCT FROM NEW.team_b_id
    THEN RAISE EXCEPTION 'Winner must be one of the match teams'; END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_team_member_event ON public.team_members;
CREATE TRIGGER validate_team_member_event BEFORE INSERT OR UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_relationships();
DROP TRIGGER IF EXISTS validate_group_team_event ON public.tournament_group_teams;
CREATE TRIGGER validate_group_team_event BEFORE INSERT OR UPDATE ON public.tournament_group_teams
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_relationships();
DROP TRIGGER IF EXISTS validate_partner_request_event ON public.partner_requests;
CREATE TRIGGER validate_partner_request_event BEFORE INSERT OR UPDATE ON public.partner_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_relationships();
DROP TRIGGER IF EXISTS validate_match_event ON public.matches;
CREATE TRIGGER validate_match_event BEFORE INSERT OR UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_relationships();

-- Persist set-level scoring rather than keeping it only in browser state.
CREATE TABLE IF NOT EXISTS public.match_sets (
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  set_number integer NOT NULL CHECK (set_number > 0),
  team_a_score integer NOT NULL CHECK (team_a_score >= 0),
  team_b_score integer NOT NULL CHECK (team_b_score >= 0),
  PRIMARY KEY (match_id, set_number)
);
ALTER TABLE public.match_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Match sets viewable by event viewers" ON public.match_sets
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND public.can_view_event(m.event_id))
  );
CREATE POLICY "Match sets manageable by event admins" ON public.match_sets
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND public.is_event_admin(m.event_id))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND public.is_event_admin(m.event_id))
  );

-- Keep updated_at accurate on all mutable entities.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'facilities', 'events', 'partner_requests', 'matches',
    'tournament_rules', 'player_groups'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', table_name);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      table_name
    );
  END LOOP;
END;
$$;

-- Atomically register the current user and assign the waiting list server-side.
CREATE OR REPLACE FUNCTION public.register_for_event(target_event_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  event_capacity integer;
  confirmed_count integer;
  assigned_status text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  SELECT max_players INTO event_capacity
  FROM public.events
  WHERE id = target_event_id AND status NOT IN ('completed', 'cancelled')
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found or closed'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.event_participants
    WHERE event_id = target_event_id AND user_id = auth.uid()
  ) THEN RAISE EXCEPTION 'Already registered for this event'; END IF;

  SELECT count(*) INTO confirmed_count
  FROM public.event_participants
  WHERE event_id = target_event_id AND registration_status = 'confirmed';
  assigned_status := CASE WHEN confirmed_count >= event_capacity THEN 'waiting_list' ELSE 'confirmed' END;

  INSERT INTO public.event_participants(event_id, user_id, registration_status, registered_by)
  VALUES (target_event_id, auth.uid(), assigned_status, auth.uid());
  RETURN assigned_status;
END;
$$;
REVOKE ALL ON FUNCTION public.register_for_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_for_event(uuid) TO authenticated;

-- The invite-code trigger does not require elevated privileges. Some early
-- deployed databases predate this helper, so only alter it when present.
DO $$
BEGIN
  IF to_regprocedure('public.generate_invite_code()') IS NOT NULL THEN
    ALTER FUNCTION public.generate_invite_code() SECURITY INVOKER;
  END IF;
END;
$$;

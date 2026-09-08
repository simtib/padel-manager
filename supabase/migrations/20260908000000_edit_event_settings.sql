-- Store the format independently of the broad match/tournament event type.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS format text
  CHECK (format IN ('standard_3_sets', 'americano', 'custom'));

CREATE OR REPLACE FUNCTION public.update_event_settings(
  target_event_id uuid, event_name text, event_description text,
  format_value text, event_date_value date, start_time_value time,
  visibility_value text, max_players_value integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing public.events%ROWTYPE;
  confirmed_count integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_event_admin(target_event_id) THEN
    RAISE EXCEPTION 'Only the organizer or a co-admin can edit this event';
  END IF;
  SELECT * INTO existing FROM public.events WHERE id = target_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;
  IF event_name IS NULL OR trim(event_name) = '' THEN RAISE EXCEPTION 'Event name is required'; END IF;
  IF format_value IS NULL OR format_value NOT IN ('standard_3_sets', 'americano', 'custom') THEN RAISE EXCEPTION 'Invalid game format'; END IF;
  IF visibility_value IS NULL OR visibility_value NOT IN ('private', 'public') THEN RAISE EXCEPTION 'Invalid visibility'; END IF;
  IF event_date_value IS NULL OR start_time_value IS NULL THEN RAISE EXCEPTION 'Date and start time are required'; END IF;
  IF max_players_value IS NULL OR max_players_value < 4 OR max_players_value % 2 <> 0 THEN RAISE EXCEPTION 'Capacity must be an even number of at least 4'; END IF;
  IF format_value = 'standard_3_sets' AND max_players_value <> 4 THEN RAISE EXCEPTION 'Standard games require four players'; END IF;
  SELECT count(*) INTO confirmed_count FROM public.event_participants WHERE event_id = target_event_id AND status = 'confirmed';
  IF max_players_value < confirmed_count THEN RAISE EXCEPTION 'Capacity cannot be lower than the confirmed player count'; END IF;
  IF format_value <> COALESCE(existing.format, CASE WHEN existing.event_type = 'normal_match' THEN 'standard_3_sets' ELSE 'custom' END)
    AND (existing.status NOT IN ('draft', 'open', 'full')
      OR EXISTS (SELECT 1 FROM public.teams WHERE event_id = target_event_id)
      OR EXISTS (SELECT 1 FROM public.tournament_groups WHERE event_id = target_event_id)
      OR EXISTS (SELECT 1 FROM public.matches WHERE event_id = target_event_id)) THEN
    RAISE EXCEPTION 'Game format cannot change after teams or matches have been created';
  END IF;
  UPDATE public.events SET
    name = trim(event_name), description = event_description, format = format_value,
    event_type = CASE WHEN format_value = 'standard_3_sets' THEN 'normal_match' ELSE 'tournament' END,
    event_date = event_date_value, start_time = start_time_value,
    visibility = visibility_value, max_players = max_players_value,
    status = CASE WHEN existing.status IN ('open', 'full') THEN
      CASE WHEN confirmed_count >= max_players_value THEN 'full' ELSE 'open' END ELSE existing.status END
  WHERE id = target_event_id;
END;
$$;
REVOKE ALL ON FUNCTION public.update_event_settings(uuid, text, text, text, date, time, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_event_settings(uuid, text, text, text, date, time, text, integer) TO authenticated;

-- Preserve the chosen format when creating new events as well.
CREATE OR REPLACE FUNCTION public.create_event(
  event_name text,
  event_description text,
  event_type_value text,
  event_date_value date,
  start_time_value time,
  facility_id_value uuid DEFAULT NULL,
  visibility_value text DEFAULT 'private',
  max_players_value integer DEFAULT 16,
  court_ids uuid[] DEFAULT ARRAY[]::uuid[],
  co_admin_ids uuid[] DEFAULT ARRAY[]::uuid[],
  rules_value jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_event_id uuid;
  auth_user auth.users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF trim(event_name) = '' THEN RAISE EXCEPTION 'Event name is required'; END IF;
  IF event_type_value NOT IN ('normal_match', 'tournament') THEN RAISE EXCEPTION 'Invalid event type'; END IF;
  IF visibility_value NOT IN ('private', 'public') THEN RAISE EXCEPTION 'Invalid visibility'; END IF;
  IF max_players_value <= 0 THEN RAISE EXCEPTION 'Maximum players must be positive'; END IF;

  SELECT * INTO auth_user FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.profiles(id, first_name, last_name, display_name, email, avatar_url)
  VALUES (
    auth_user.id,
    COALESCE(NULLIF(auth_user.raw_user_meta_data->>'first_name', ''), 'Player'),
    COALESCE(auth_user.raw_user_meta_data->>'last_name', ''),
    COALESCE(NULLIF(auth_user.raw_user_meta_data->>'display_name', ''), auth_user.email, 'Player'),
    COALESCE(auth_user.email, ''),
    auth_user.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  IF facility_id_value IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.facilities WHERE id = facility_id_value
  ) THEN RAISE EXCEPTION 'Facility not found'; END IF;

  INSERT INTO public.events(
    owner_id, event_type, name, description, event_date, start_time,
    facility_id, status, visibility, max_players, format, invite_code
  ) VALUES (
    auth.uid(), event_type_value, trim(event_name), NULLIF(trim(event_description), ''),
    event_date_value, start_time_value, facility_id_value, 'open', visibility_value,
    CASE WHEN event_type_value = 'normal_match' THEN 4 ELSE max_players_value END,
    COALESCE(rules_value->>'format', CASE WHEN event_type_value = 'normal_match' THEN 'standard_3_sets' ELSE 'custom' END), encode(extensions.gen_random_bytes(12), 'hex')
  ) RETURNING id INTO new_event_id;

  INSERT INTO public.event_admins(event_id, user_id, role)
  VALUES (new_event_id, auth.uid(), 'owner');

  INSERT INTO public.event_admins(event_id, user_id, role)
  SELECT new_event_id, candidate_id, 'co_admin'
  FROM unnest(co_admin_ids) candidate_id
  WHERE candidate_id <> auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = candidate_id)
  ON CONFLICT (event_id, user_id) DO NOTHING;

  INSERT INTO public.event_courts(event_id, court_id)
  SELECT new_event_id, c.id
  FROM public.courts c
  WHERE c.id = ANY(court_ids)
    AND (facility_id_value IS NULL OR c.facility_id = facility_id_value)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.tournament_rules(
    event_id, points_win, points_draw, points_loss, qualifiers_per_group,
    allow_draw, ranking_rules
  ) VALUES (
    new_event_id,
    COALESCE((rules_value->>'winPoints')::integer, 3),
    COALESCE((rules_value->>'drawPoints')::integer, 1),
    COALESCE((rules_value->>'lossPoints')::integer, 0),
    COALESCE((rules_value->>'qualifiersPerGroup')::integer, 2),
    false,
    COALESCE(rules_value->'tiebreakOrder', '["points","matchesWon","scoreDiff","scoreFor","headToHead"]'::jsonb)
  );

  RETURN new_event_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_event(text, text, text, date, time, uuid, text, integer, uuid[], uuid[], jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_event(text, text, text, date, time, uuid, text, integer, uuid[], uuid[], jsonb) TO authenticated;


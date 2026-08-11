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
    facility_id, status, visibility, max_players, invite_code
  ) VALUES (
    auth.uid(), event_type_value, trim(event_name), NULLIF(trim(event_description), ''),
    event_date_value, start_time_value, facility_id_value, 'open', visibility_value,
    CASE WHEN event_type_value = 'normal_match' THEN 4 ELSE max_players_value END,
    encode(extensions.gen_random_bytes(12), 'hex')
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

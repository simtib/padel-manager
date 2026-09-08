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
  SELECT count(*) INTO confirmed_count FROM public.event_participants WHERE event_id = target_event_id AND registration_status = 'confirmed';
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



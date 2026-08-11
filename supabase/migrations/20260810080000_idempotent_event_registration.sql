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

  -- Retrying a request or hydrating stale local state should not fail.
  SELECT registration_status INTO assigned_status
  FROM public.event_participants
  WHERE event_id = target_event_id AND user_id = auth.uid();
  IF FOUND THEN RETURN assigned_status; END IF;

  SELECT max_players INTO event_capacity
  FROM public.events
  WHERE id = target_event_id AND status NOT IN ('completed', 'cancelled')
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found or closed'; END IF;

  SELECT count(*) INTO confirmed_count
  FROM public.event_participants
  WHERE event_id = target_event_id AND registration_status = 'confirmed';
  assigned_status := CASE WHEN confirmed_count >= event_capacity THEN 'waiting_list' ELSE 'confirmed' END;

  INSERT INTO public.event_participants(event_id, user_id, registration_status, registered_by)
  VALUES (target_event_id, auth.uid(), assigned_status, auth.uid())
  ON CONFLICT (event_id, user_id) WHERE user_id IS NOT NULL
  DO UPDATE SET registration_status = public.event_participants.registration_status
  RETURNING registration_status INTO assigned_status;
  RETURN assigned_status;
END;
$$;
REVOKE ALL ON FUNCTION public.register_for_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_for_event(uuid) TO authenticated;

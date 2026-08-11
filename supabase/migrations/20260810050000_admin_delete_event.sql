CREATE OR REPLACE FUNCTION public.delete_event(target_event_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NOT public.is_event_admin(target_event_id) THEN
    RAISE EXCEPTION 'Only the event owner or a co-admin can delete this event';
  END IF;
  DELETE FROM public.events WHERE id = target_event_id;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_event(uuid) TO authenticated;

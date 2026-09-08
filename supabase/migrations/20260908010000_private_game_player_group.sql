ALTER TABLE public.events ADD COLUMN player_group_id uuid REFERENCES public.player_groups(id) ON DELETE RESTRICT;
CREATE INDEX events_player_group_id_idx ON public.events(player_group_id);

-- Keep creation atomic, and prevent callers from bypassing group validation.
ALTER FUNCTION public.create_event(text, text, text, date, time, uuid, text, integer, uuid[], uuid[], jsonb) RENAME TO create_event_base;
REVOKE ALL ON FUNCTION public.create_event_base(text, text, text, date, time, uuid, text, integer, uuid[], uuid[], jsonb) FROM PUBLIC, authenticated, anon;

CREATE FUNCTION public.create_event(
  event_name text, event_description text, event_type_value text,
  event_date_value date, start_time_value time,
  facility_id_value uuid DEFAULT NULL, visibility_value text DEFAULT 'private',
  max_players_value integer DEFAULT 16, court_ids uuid[] DEFAULT ARRAY[]::uuid[],
  co_admin_ids uuid[] DEFAULT ARRAY[]::uuid[], rules_value jsonb DEFAULT '{}'::jsonb,
  player_group_id_value uuid DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE new_event_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF visibility_value = 'private' THEN
    IF player_group_id_value IS NULL THEN RAISE EXCEPTION 'A player group is required for private games'; END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.player_groups g WHERE g.id = player_group_id_value
      AND (g.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.player_group_members gm
        WHERE gm.group_id = g.id AND gm.user_id = auth.uid() AND gm.status = 'active'
      ))
    ) THEN RAISE EXCEPTION 'Select a player group you own or belong to'; END IF;
  END IF;
  new_event_id := public.create_event_base(event_name, event_description, event_type_value,
    event_date_value, start_time_value, facility_id_value, visibility_value,
    max_players_value, court_ids, co_admin_ids, rules_value);
  UPDATE public.events SET player_group_id = CASE WHEN visibility_value = 'private' THEN player_group_id_value ELSE NULL END
  WHERE id = new_event_id;
  RETURN new_event_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_event(text, text, text, date, time, uuid, text, integer, uuid[], uuid[], jsonb, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_event(text, text, text, date, time, uuid, text, integer, uuid[], uuid[], jsonb, uuid) TO authenticated;

-- Group membership grants visibility; players still choose whether to register.
CREATE OR REPLACE FUNCTION public.can_view_event(target_event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = target_event_id AND (
      e.visibility = 'public' OR e.owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.event_admins ea WHERE ea.event_id = e.id AND ea.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.event_participants ep WHERE ep.event_id = e.id AND ep.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.player_groups g WHERE g.id = e.player_group_id AND g.owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.player_group_members gm WHERE gm.group_id = e.player_group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
    )
  );
$$;

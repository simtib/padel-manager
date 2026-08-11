CREATE OR REPLACE FUNCTION public.delete_player_group(target_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.player_groups
    WHERE id = target_group_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the group owner can delete this group';
  END IF;
  DELETE FROM public.player_groups WHERE id = target_group_id;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_player_group(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_player_group(uuid) TO authenticated;

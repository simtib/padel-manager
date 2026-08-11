CREATE OR REPLACE FUNCTION public.create_player_group(
  group_name text,
  group_description text DEFAULT '',
  member_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_group_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF trim(group_name) = '' THEN RAISE EXCEPTION 'Group name is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Authenticated user profile is missing';
  END IF;

  INSERT INTO public.player_groups(owner_id, name, description)
  VALUES (auth.uid(), trim(group_name), NULLIF(trim(group_description), ''))
  RETURNING id INTO new_group_id;

  INSERT INTO public.player_group_members(group_id, user_id, status)
  VALUES (new_group_id, auth.uid(), 'active');

  INSERT INTO public.player_group_members(group_id, user_id, status)
  SELECT new_group_id, candidate_id, 'active'
  FROM unnest(member_ids) candidate_id
  WHERE candidate_id <> auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = candidate_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN new_group_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_player_group(text, text, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_player_group(text, text, uuid[]) TO authenticated;

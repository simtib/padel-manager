-- Transactional operations used by the application for scoring and roster
-- changes. Keeping these workflows in PostgreSQL prevents partial updates.

CREATE OR REPLACE FUNCTION public.record_match_score(
  target_event_id uuid,
  target_match_id uuid,
  score_a integer,
  score_b integer,
  set_scores jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  match_row public.matches%ROWTYPE;
  winner_id uuid;
  wins_a integer := 0;
  wins_b integer := 0;
  set_item jsonb;
  set_index integer := 0;
  may_score boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF score_a < 0 OR score_b < 0 THEN RAISE EXCEPTION 'Scores cannot be negative'; END IF;
  IF jsonb_typeof(set_scores) <> 'array' THEN RAISE EXCEPTION 'set_scores must be an array'; END IF;

  SELECT * INTO match_row FROM public.matches
  WHERE id = target_match_id AND event_id = target_event_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Match not found'; END IF;

  SELECT public.is_event_admin(target_event_id) OR EXISTS (
    SELECT 1
    FROM public.team_members tm
    JOIN public.event_participants ep ON ep.id = tm.participant_id
    WHERE tm.team_id IN (match_row.team_a_id, match_row.team_b_id)
      AND ep.user_id = auth.uid()
  ) INTO may_score;
  IF NOT may_score THEN RAISE EXCEPTION 'Not authorized to score this match'; END IF;

  DELETE FROM public.match_sets WHERE match_id = target_match_id;
  FOR set_item IN SELECT value FROM jsonb_array_elements(set_scores) LOOP
    set_index := set_index + 1;
    IF (set_item->>'team1Score')::integer < 0 OR (set_item->>'team2Score')::integer < 0 THEN
      RAISE EXCEPTION 'Set scores cannot be negative';
    END IF;
    INSERT INTO public.match_sets(match_id, set_number, team_a_score, team_b_score)
    VALUES (
      target_match_id,
      set_index,
      (set_item->>'team1Score')::integer,
      (set_item->>'team2Score')::integer
    );
    IF (set_item->>'team1Score')::integer > (set_item->>'team2Score')::integer THEN wins_a := wins_a + 1;
    ELSIF (set_item->>'team2Score')::integer > (set_item->>'team1Score')::integer THEN wins_b := wins_b + 1;
    END IF;
  END LOOP;

  IF set_index > 0 THEN
    IF wins_a > wins_b THEN winner_id := match_row.team_a_id;
    ELSIF wins_b > wins_a THEN winner_id := match_row.team_b_id;
    END IF;
  ELSE
    IF score_a > score_b THEN winner_id := match_row.team_a_id;
    ELSIF score_b > score_a THEN winner_id := match_row.team_b_id;
    END IF;
  END IF;

  UPDATE public.matches SET
    team_a_score = score_a,
    team_b_score = score_b,
    winner_team_id = winner_id,
    status = 'completed'
  WHERE id = target_match_id;

  IF winner_id IS NOT NULL AND match_row.next_match_id IS NOT NULL THEN
    IF match_row.next_match_slot = '1' THEN
      UPDATE public.matches SET team_a_id = winner_id WHERE id = match_row.next_match_id;
    ELSIF match_row.next_match_slot = '2' THEN
      UPDATE public.matches SET team_b_id = winner_id WHERE id = match_row.next_match_id;
    END IF;
  END IF;

  IF match_row.stage = 'final' THEN
    UPDATE public.events SET status = 'completed' WHERE id = target_event_id;
  ELSIF EXISTS (SELECT 1 FROM public.events WHERE id = target_event_id AND status = 'ready') THEN
    UPDATE public.events SET status = 'in_progress' WHERE id = target_event_id;
  END IF;

  RETURN jsonb_build_object('winner_team_id', winner_id, 'status', 'completed');
END;
$$;
REVOKE ALL ON FUNCTION public.record_match_score(uuid, uuid, integer, integer, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_match_score(uuid, uuid, integer, integer, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.remove_event_participant(
  target_event_id uuid,
  target_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  participant_row public.event_participants%ROWTYPE;
  promoted_user_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO participant_row
  FROM public.event_participants
  WHERE event_id = target_event_id AND user_id = target_user_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Participant not found'; END IF;
  IF target_user_id <> auth.uid() AND NOT public.is_event_admin(target_event_id) THEN
    RAISE EXCEPTION 'Not authorized to remove this participant';
  END IF;

  DELETE FROM public.event_participants WHERE id = participant_row.id;

  IF participant_row.registration_status = 'confirmed' THEN
    SELECT user_id INTO promoted_user_id
    FROM public.event_participants
    WHERE event_id = target_event_id AND registration_status = 'waiting_list'
    ORDER BY joined_at, id
    LIMIT 1
    FOR UPDATE;
    IF FOUND THEN
      UPDATE public.event_participants
      SET registration_status = 'confirmed'
      WHERE event_id = target_event_id AND user_id = promoted_user_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('promoted_user_id', promoted_user_id);
END;
$$;
REVOKE ALL ON FUNCTION public.remove_event_participant(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_event_participant(uuid, uuid) TO authenticated;

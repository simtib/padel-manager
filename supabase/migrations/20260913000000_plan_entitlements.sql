CREATE TYPE public.app_plan AS ENUM ('free', 'pro');
ALTER TABLE public.profiles ADD COLUMN plan public.app_plan NOT NULL DEFAULT 'free';
-- Existing column grants intentionally exclude plan. Only trusted service-side
-- billing/provisioning may change it; roles and editable metadata grant no plan.

CREATE FUNCTION public.plan_is_pro(target_user uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user AND plan = 'pro');
$$;
REVOKE ALL ON FUNCTION public.plan_is_pro(uuid) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.check_plan_action(action_name text, waiting boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.' USING ERRCODE = '42501'; END IF;
 IF action_name NOT IN ('guest', 'waitlist') THEN RAISE EXCEPTION 'Unknown plan action'; END IF;
 IF NOT public.plan_is_pro(auth.uid()) THEN
  IF action_name = 'guest' THEN RAISE EXCEPTION 'Upgrade to Pro to add guest players.' USING ERRCODE = '42501'; END IF;
  IF action_name = 'waitlist' OR waiting THEN
   IF (SELECT count(*) FROM public.event_participants p JOIN public.events e ON e.id = p.event_id
       WHERE p.user_id = auth.uid()
       AND p.registration_status = 'waiting_list'
       AND e.status NOT IN ('completed','cancelled')) >= 1 THEN
    RAISE EXCEPTION 'Free lets you join 1 waiting list. Leave a waiting list or upgrade to Pro.' USING ERRCODE = '42501';
   END IF;
  END IF;
 END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.check_plan_action(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_plan_action(text, boolean) TO authenticated;

CREATE FUNCTION public.enforce_event_plan() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE member record;
BEGIN
 PERFORM pg_advisory_xact_lock(706164656, 2);
 IF NEW.status NOT IN ('completed','cancelled') THEN
  IF (TG_OP = 'INSERT' OR OLD.owner_id IS DISTINCT FROM NEW.owner_id OR OLD.status IN ('completed','cancelled'))
    AND NOT public.plan_is_pro(NEW.owner_id)
    AND (SELECT count(*) FROM public.events WHERE owner_id = NEW.owner_id AND id <> NEW.id AND status NOT IN ('completed','cancelled')) >= 1 THEN
   RAISE EXCEPTION 'Free lets you organize 1 active match. Complete or cancel your current match, or upgrade to Pro.' USING ERRCODE = '42501';
  END IF;
  -- Rescheduling/reopening must not bypass a participant's upcoming-match limit.
  IF TG_OP = 'UPDATE' AND (NEW.event_date,NEW.start_time,NEW.status,NEW.owner_id) IS DISTINCT FROM (OLD.event_date,OLD.start_time,OLD.status,OLD.owner_id)
    AND (NEW.event_date + NEW.start_time) AT TIME ZONE 'Asia/Dubai' >= now() THEN
   FOR member IN SELECT user_id FROM public.event_participants WHERE event_id = NEW.id AND registration_status IN ('confirmed','waiting_list') AND user_id <> NEW.owner_id LOOP
    IF NOT public.plan_is_pro(member.user_id) AND (SELECT count(*) FROM public.event_participants p JOIN public.events e ON e.id=p.event_id
      WHERE p.user_id=member.user_id AND p.registration_status IN ('confirmed','waiting_list') AND e.id<>NEW.id AND e.owner_id<>member.user_id
      AND e.status NOT IN ('completed','cancelled') AND (e.event_date+e.start_time) AT TIME ZONE 'Asia/Dubai'>=now()) >= 3 THEN
     RAISE EXCEPTION 'A Free player already has 3 upcoming matches. Remove their registration or upgrade to Pro before rescheduling.' USING ERRCODE='42501';
    END IF;
   END LOOP;
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_event_plan BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.enforce_event_plan();

CREATE FUNCTION public.enforce_participant_plan() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE game public.events%ROWTYPE; actor uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(706164656, 2);
 IF NEW.registration_status='withdrawn' THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' AND (NEW.event_id,NEW.user_id,NEW.guest_player_id,NEW.registration_status) IS NOT DISTINCT FROM (OLD.event_id,OLD.user_id,OLD.guest_player_id,OLD.registration_status) THEN RETURN NEW; END IF;
 SELECT * INTO game FROM public.events WHERE id=NEW.event_id;
 actor := COALESCE(auth.uid(),NEW.registered_by);
 IF NEW.guest_player_id IS NOT NULL AND NOT public.plan_is_pro(actor) THEN
  RAISE EXCEPTION 'Upgrade to Pro to add guest players.' USING ERRCODE='42501';
 END IF;
 IF NEW.registration_status='confirmed' AND (SELECT count(*) FROM public.event_participants WHERE event_id=NEW.event_id AND id<>NEW.id AND registration_status='confirmed') >= game.max_players THEN
  NEW.registration_status := 'waiting_list';
 END IF;
 IF NEW.registration_status='waiting_list' AND (NOT public.plan_is_pro(actor) OR (NEW.user_id IS NOT NULL AND NOT public.plan_is_pro(NEW.user_id))) THEN
  IF (SELECT count(*) FROM public.event_participants p JOIN public.events e ON e.id=p.event_id
      WHERE p.user_id=COALESCE(NEW.user_id, actor)
      AND p.id<>COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND p.registration_status='waiting_list'
      AND e.status NOT IN ('completed','cancelled')) >= 1 THEN
   RAISE EXCEPTION 'Free lets you join 1 waiting list. Leave a waiting list or upgrade to Pro.' USING ERRCODE='42501';
  END IF;
 END IF;
 IF NEW.user_id IS NOT NULL AND NOT public.plan_is_pro(NEW.user_id) AND game.owner_id<>NEW.user_id
  AND game.status NOT IN ('completed','cancelled') AND (game.event_date+game.start_time) AT TIME ZONE 'Asia/Dubai'>=now()
  AND (SELECT count(*) FROM public.event_participants p JOIN public.events e ON e.id=p.event_id WHERE p.user_id=NEW.user_id
    AND p.id<>NEW.id AND p.registration_status IN ('confirmed','waiting_list') AND e.owner_id<>NEW.user_id
    AND e.status NOT IN ('completed','cancelled') AND (e.event_date+e.start_time) AT TIME ZONE 'Asia/Dubai'>=now()) >= 3 THEN
  RAISE EXCEPTION 'Free lets you join 3 upcoming matches. Leave a match or upgrade to Pro.' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_participant_plan BEFORE INSERT OR UPDATE ON public.event_participants FOR EACH ROW EXECUTE FUNCTION public.enforce_participant_plan();

CREATE FUNCTION public.enforce_guest_plan() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT public.plan_is_pro(COALESCE(auth.uid(),NEW.created_by)) THEN
  RAISE EXCEPTION 'Upgrade to Pro to add guest players.' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_guest_plan BEFORE INSERT ON public.guest_players FOR EACH ROW EXECUTE FUNCTION public.enforce_guest_plan();
REVOKE ALL ON FUNCTION public.enforce_event_plan(), public.enforce_participant_plan(), public.enforce_guest_plan() FROM PUBLIC, anon, authenticated;
NOTIFY pgrst, 'reload schema';

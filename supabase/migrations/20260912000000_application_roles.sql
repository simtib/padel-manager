-- Profiles are the single source of application authority. Auth metadata is never trusted.
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
ALTER TABLE public.profiles ADD COLUMN role public.app_role NOT NULL DEFAULT 'user';
UPDATE public.profiles SET role = 'admin'
WHERE id IN (SELECT user_id FROM public.application_admins);

CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin'));
$$;
CREATE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
DROP TABLE public.application_admins;

-- Full profiles contain contact details and roles. The player directory below
-- deliberately exposes only the fields needed for normal game/group selection.
DROP POLICY "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Owners and admins read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_app_admin());
DROP POLICY "Users can update their own profile" ON public.profiles;
CREATE POLICY "Owners and admins edit profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_app_admin())
  WITH CHECK (id = auth.uid() OR public.is_app_admin());
-- Column grants prevent role changes through PATCH, INSERT and UPSERT, even
-- when the caller can update the row. Role changes use the checked RPC below.
REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT (id, first_name, last_name, display_name, email, phone, avatar_url)
  ON public.profiles TO authenticated;
GRANT UPDATE (first_name, last_name, display_name, email, phone, avatar_url)
  ON public.profiles TO authenticated;

CREATE VIEW public.player_directory WITH (security_barrier = true) AS
SELECT id, first_name, last_name, display_name, avatar_url, created_at
FROM public.profiles WHERE auth.uid() IS NOT NULL;
REVOKE ALL ON public.player_directory FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.player_directory TO authenticated;

CREATE TABLE public.role_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_role public.app_role NOT NULL,
  new_role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.role_changes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.role_changes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.role_changes TO authenticated;
CREATE POLICY "Super admins read role history" ON public.role_changes
  FOR SELECT TO authenticated USING (public.is_super_admin());

CREATE FUNCTION public.set_user_role(target_user_id uuid, new_role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE previous_role public.app_role;
BEGIN
  -- Serialize changes before authorization, so a concurrent revocation cannot
  -- leave another in-flight role change authorized by an obsolete role.
  PERFORM pg_advisory_xact_lock(706164656, 1);
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can manage roles' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Ask another super admin to change your role' USING ERRCODE = '42501';
  END IF;
  IF new_role IS NULL THEN RAISE EXCEPTION 'A role is required' USING ERRCODE = '22023'; END IF;
  SELECT role INTO previous_role FROM public.profiles WHERE id = target_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found' USING ERRCODE = 'P0002'; END IF;
  IF previous_role = new_role THEN RETURN; END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
  INSERT INTO public.role_changes (actor_id, user_id, old_role, new_role)
    VALUES (auth.uid(), target_user_id, previous_role, new_role);
END;
$$;
REVOKE ALL ON FUNCTION public.set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;

-- Clubs and courts remain visible for normal booking/event flows. Only
-- application admins can create, edit or delete the shared club directory.
DROP POLICY "Facilities editable by creator" ON public.facilities;
CREATE POLICY "Admins manage facilities" ON public.facilities FOR ALL TO authenticated
  USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());
DROP POLICY "Courts insertable by facility creator" ON public.courts;
DROP POLICY "Courts updatable by facility creator" ON public.courts;
DROP POLICY "Courts deletable by facility creator" ON public.courts;
CREATE POLICY "Admins manage courts" ON public.courts FOR ALL TO authenticated
  USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

-- Internal support cases are separate from a player's feedback submissions.
CREATE TABLE public.support_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (length(btrim(subject)) BETWEEN 1 AND 200),
  notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 10000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_cases_user_id_idx ON public.support_cases(user_id);
ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_cases FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.support_cases TO authenticated;
GRANT UPDATE (subject, notes, status) ON public.support_cases TO authenticated;
CREATE POLICY "Admins read support cases" ON public.support_cases FOR SELECT TO authenticated
  USING (public.is_app_admin());
CREATE POLICY "Admins create support cases" ON public.support_cases FOR INSERT TO authenticated
  WITH CHECK (public.is_app_admin() AND created_by = auth.uid());
CREATE POLICY "Admins update support cases" ON public.support_cases FOR UPDATE TO authenticated
  USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.support_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
NOTIFY pgrst, 'reload schema';

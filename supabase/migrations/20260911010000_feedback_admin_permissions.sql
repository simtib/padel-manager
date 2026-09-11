-- Application admins are explicitly assigned by trusted database operators.
-- Event ownership and editable Auth user metadata do not grant this role.
CREATE TABLE public.application_admins (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.application_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.application_admins FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.application_admins TO authenticated;
GRANT ALL ON public.application_admins TO service_role;
CREATE POLICY "Users can check their own application role" ON public.application_admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE FUNCTION public.is_app_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.application_admins WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_app_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;

DROP POLICY "Users can submit feedback" ON public.feedback;
CREATE POLICY "Users can submit new feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'new');
DROP POLICY "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Owners and application admins can read feedback" ON public.feedback
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_app_admin());
DROP POLICY "Users can update their own feedback" ON public.feedback;
CREATE POLICY "Application admins can update feedback status" ON public.feedback
  FOR UPDATE TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());
-- RLS restricts rows; column privileges prevent editing the author or content.
REVOKE ALL ON public.feedback FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.feedback TO authenticated;
GRANT UPDATE (status) ON public.feedback TO authenticated;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

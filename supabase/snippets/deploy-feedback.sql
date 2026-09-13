-- Run once in the online app's Supabase project SQL Editor.
-- Both feedback migrations are applied atomically; an error rolls everything back.
BEGIN;
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'Required public.profiles table is missing. Check the selected project.';
  END IF;
  IF to_regprocedure('public.set_updated_at()') IS NULL THEN
    RAISE EXCEPTION 'Required public.set_updated_at() function is missing. Reconcile earlier migrations first.';
  END IF;
  IF to_regclass('public.feedback') IS NOT NULL OR to_regclass('public.application_admins') IS NOT NULL THEN
    RAISE EXCEPTION 'Feedback objects already exist. Inspect applied migrations before proceeding.';
  END IF;
END;
$$;
-- Migration: Add feedback table for user feedback submissions

-- Enable UUID extension (already enabled in init, but safe to include)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'feature_request', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_route TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'planned', 'done', 'rejected')),
  contact_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 2. RLS POLICIES

-- Users can insert their own feedback
CREATE POLICY "Users can submit feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view only their own feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can update their own feedback (e.g., while it's still editable)
CREATE POLICY "Users can update their own feedback" ON public.feedback
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback" ON public.feedback
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

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

NOTIFY pgrst, 'reload schema';
COMMIT;
SELECT to_regclass('public.feedback') AS feedback_table,
       to_regprocedure('public.is_app_admin()') AS admin_function;

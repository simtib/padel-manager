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

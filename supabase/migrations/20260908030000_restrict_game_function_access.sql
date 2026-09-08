-- Supabase default privileges may grant anon explicitly, independently of PUBLIC.
REVOKE ALL ON FUNCTION public.update_event_settings(uuid, text, text, text, date, time, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.create_event(text, text, text, date, time, uuid, text, integer, uuid[], uuid[], jsonb, uuid) FROM anon;

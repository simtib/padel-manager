-- Align the events.event_type check constraint with the application vocabulary.
-- The frontend uses 'normal_match' (see src/types.ts EventType), but the
-- original schema only allowed 'normal_game'. This caused every event insert
-- for a normal match to fail the CHECK constraint.

-- 1. Normalize any legacy 'normal_game' rows to 'normal_match'
UPDATE public.events
SET event_type = 'normal_match'
WHERE event_type = 'normal_game';

-- 2. Drop the old constraint and recreate it with the correct allowed values
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_event_type_check
  CHECK (event_type IN ('normal_match', 'tournament'));

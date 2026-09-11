-- Synthetic local fixtures only. The CLI loads this on local start/reset.
-- Never use db push --include-seed against staging or production.
INSERT INTO public.facilities (id, name, address, city, country)
VALUES ('10000000-0000-4000-8000-000000000001', 'Local Test Padel Club',
        '1 Example Court (fictional)', 'Test City', 'United Arab Emirates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courts (id, facility_id, name, court_number)
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Local Court 1', 1),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Local Court 2', 2)
ON CONFLICT (id) DO NOTHING;

-- Create test players through the application's signup form. Their confirmation
-- emails are captured locally at http://localhost:54324; no shared passwords.

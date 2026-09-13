-- Synthetic local fixtures only. The CLI loads this on local start/reset.
-- Never use db push --include-seed against staging or production.
INSERT INTO public.facilities (id, name, address, city, country)
VALUES ('10000000-0000-4000-8000-000000000001', 'Local Test Padel Club',
        '1 Example Court (fictional)', 'Test City', 'United Arab Emirates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courts (id, facility_id, name, court_number)
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Local Court 1', 1),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Local Court 2', 2),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Local Court 3', 3),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'Local Court 4', 4),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', 'Local Court 5', 5),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 'Local Court 6', 6),
  ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', 'Local Court 7', 7),
  ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', 'Local Court 8', 8)
ON CONFLICT (id) DO NOTHING;

-- LOCAL ONLY: one confirmed super admin. No privileged account is created by
-- migrations; this synthetic password must never be used outside local Docker.
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES ('00000000-0000-0000-0000-000000000000', '30000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'superadmin@example.test',
  extensions.crypt('LocalPadel-Only-2026!', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"first_name":"Local","last_name":"Super Admin","display_name":"Local Super Admin"}',
  now(), now(), '', '', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('30000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '{"sub":"30000000-0000-4000-8000-000000000001","email":"superadmin@example.test","email_verified":true}',
  'email', now(), now(), now()) ON CONFLICT (provider_id, provider) DO NOTHING;
UPDATE public.profiles SET role = 'super_admin' WHERE id = '30000000-0000-4000-8000-000000000001';

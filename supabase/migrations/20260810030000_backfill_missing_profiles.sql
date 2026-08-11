-- Repair auth accounts created before the profile trigger was installed.
INSERT INTO public.profiles (
  id, first_name, last_name, display_name, email, avatar_url
)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'first_name', ''), 'Player'),
  COALESCE(u.raw_user_meta_data ->> 'last_name', ''),
  COALESCE(
    NULLIF(u.raw_user_meta_data ->> 'display_name', ''),
    NULLIF(trim(concat(
      u.raw_user_meta_data ->> 'first_name', ' ',
      u.raw_user_meta_data ->> 'last_name'
    )), ''),
    u.email,
    'Player'
  ),
  COALESCE(u.email, ''),
  u.raw_user_meta_data ->> 'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

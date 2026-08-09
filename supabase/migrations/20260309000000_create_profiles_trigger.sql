-- Migration to handle automatic profile creation on user signup and configure RLS for profiles

-- Create function to create profile from auth.users metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    display_name,
    email,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Player'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
      ),
      NEW.email
    ),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Re-create policies idempotently
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

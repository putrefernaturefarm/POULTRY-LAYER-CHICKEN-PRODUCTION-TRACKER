-- ============================================================
-- Fix: handle_new_user trigger — allow user creation even if
-- profile insert fails due to RLS context during trigger execution
-- ============================================================

-- Drop and recreate trigger function with error handling + RLS bypass
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;  -- Never block user creation
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Fix: profiles RLS — allow trigger to insert without auth context
-- ============================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_own" ON public.profiles;

-- Server/trigger can insert any profile (no auth context in trigger)
CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR id = auth.uid());

-- Users can only read their own profile
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- Done. Try registering again.
-- ============================================================

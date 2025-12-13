-- Fix Profile Creation Trigger
-- Run this in your Supabase SQL Editor to ensure profiles are automatically created

-- First, drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile for new user
  -- Using INSERT ... ON CONFLICT to handle race conditions
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing users without profiles
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT
  au.id,
  au.email,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the trigger is active
SELECT
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check for users without profiles
SELECT COUNT(*) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

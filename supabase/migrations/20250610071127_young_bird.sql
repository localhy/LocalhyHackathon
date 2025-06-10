/*
  # Fix user profiles and auth display names

  1. Changes
    - Create missing user profiles for existing auth users
    - Update auth users to have proper display names
    - Add function to sync user profiles with auth users

  2. Security
    - Maintain existing RLS policies
*/

-- Function to create missing user profiles for existing auth users
CREATE OR REPLACE FUNCTION create_missing_user_profiles()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Loop through auth users that don't have profiles
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  LOOP
    -- Create profile for this user
    INSERT INTO public.user_profiles (
      id,
      name,
      user_type,
      newsletter_opt_in,
      created_at,
      updated_at
    ) VALUES (
      auth_user.id,
      COALESCE(
        auth_user.raw_user_meta_data->>'name',
        auth_user.raw_user_meta_data->>'full_name',
        split_part(auth_user.email, '@', 1)
      ),
      auth_user.raw_user_meta_data->>'user_type',
      COALESCE((auth_user.raw_user_meta_data->>'newsletter_opt_in')::boolean, false),
      now(),
      now()
    );
    
    RAISE NOTICE 'Created profile for user: %', auth_user.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create missing profiles
SELECT create_missing_user_profiles();

-- Function to update auth users with proper display names
CREATE OR REPLACE FUNCTION update_auth_display_names()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
  display_name text;
BEGIN
  -- Loop through auth users and update their display names
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data
    FROM auth.users
  LOOP
    -- Get display name from metadata or email
    display_name := COALESCE(
      auth_user.raw_user_meta_data->>'name',
      auth_user.raw_user_meta_data->>'full_name',
      split_part(auth_user.email, '@', 1)
    );
    
    -- Update the auth user's metadata to include full_name for display
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{full_name}',
      to_jsonb(display_name)
    )
    WHERE id = auth_user.id;
    
    RAISE NOTICE 'Updated display name for user: % to %', auth_user.id, display_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update display names
SELECT update_auth_display_names();

-- Create a trigger function to automatically create user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    name,
    user_type,
    newsletter_opt_in
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'user_type',
    COALESCE((NEW.raw_user_meta_data->>'newsletter_opt_in')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Clean up the functions (they're only needed for this migration)
DROP FUNCTION IF EXISTS create_missing_user_profiles();
DROP FUNCTION IF EXISTS update_auth_display_names();
-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Users can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile management" ON profiles;

-- Remove email validation constraints
ALTER TABLE auth.users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE auth.users DROP CONSTRAINT IF EXISTS users_email_check;

-- Remove email constraint from profiles
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Create simplified policy for profile management
CREATE POLICY "Allow profile management"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;

-- Update existing function to handle non-email usernames
CREATE OR REPLACE FUNCTION handle_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'username'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'collector')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
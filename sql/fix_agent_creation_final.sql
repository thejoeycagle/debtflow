-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profile management" ON profiles;

-- Create simplified policy for profile management
CREATE POLICY "Allow profile management"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Modify profiles table to handle simple usernames
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE profiles ALTER COLUMN email TYPE text;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
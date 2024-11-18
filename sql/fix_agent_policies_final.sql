-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profile management" ON profiles;
DROP POLICY IF EXISTS "Allow profile management" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Create single simplified policy for profile management
CREATE POLICY "Manage profiles"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Ensure proper columns exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS temp_password TEXT;

-- Create index for faster lookups
DROP INDEX IF EXISTS idx_profiles_username;
CREATE INDEX idx_profiles_username ON profiles(username);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
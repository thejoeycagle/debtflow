-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profile management" ON profiles;

-- Create simplified policy for profile management
CREATE POLICY "Allow profile management"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Add temp_password column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS temp_password TEXT;

-- Add username column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
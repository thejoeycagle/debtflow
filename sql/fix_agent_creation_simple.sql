-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profile management" ON profiles;

-- Create simplified policy for profile management
CREATE POLICY "Allow profile management"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
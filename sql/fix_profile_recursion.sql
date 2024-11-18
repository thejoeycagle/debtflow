-- Drop existing policies
DROP POLICY IF EXISTS "View own profile" ON profiles;
DROP POLICY IF EXISTS "Admin manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Create new non-recursive policies using auth.users metadata
CREATE POLICY "View own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin manage profiles"
    ON profiles
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
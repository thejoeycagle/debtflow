-- Drop and recreate policies with simpler conditions
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Create simplified policy for all authenticated users
CREATE POLICY "Allow authenticated access"
    ON profiles
    FOR ALL 
    USING (auth.role() = 'authenticated');
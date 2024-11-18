-- Drop existing policies
DROP POLICY IF EXISTS "Admin debtors access" ON debtors;
DROP POLICY IF EXISTS "Collector debtors access" ON debtors;
DROP POLICY IF EXISTS "Allow authenticated users" ON debtors;

-- Create simplified policies for debtors
CREATE POLICY "Debtors access"
    ON debtors
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON debtors TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Ensure RLS is enabled but with open policies for now
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;

-- Create or update profiles policies
DROP POLICY IF EXISTS "View own profile" ON profiles;
DROP POLICY IF EXISTS "Admin manage profiles" ON profiles;

CREATE POLICY "Profiles access"
    ON profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
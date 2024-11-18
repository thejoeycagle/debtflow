-- Drop existing policies
DROP POLICY IF EXISTS "Admin debtors access" ON debtors;
DROP POLICY IF EXISTS "Collector debtors access" ON debtors;

-- Create new simplified policies for debtors using JWT claims
CREATE POLICY "Admin debtors access"
    ON debtors
    FOR ALL 
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Collector debtors access"
    ON debtors
    FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'collector'
        AND assigned_collector = auth.uid()
    );

-- Grant necessary permissions
GRANT ALL ON debtors TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;

-- Update profiles policies to use JWT claims
DROP POLICY IF EXISTS "View own profile" ON profiles;
DROP POLICY IF EXISTS "Admin manage profiles" ON profiles;

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

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
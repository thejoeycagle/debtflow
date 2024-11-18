-- Drop existing policies
DROP POLICY IF EXISTS "View debtors" ON debtors;
DROP POLICY IF EXISTS "Manage debtors" ON debtors;
DROP POLICY IF EXISTS "Admin debtors access" ON debtors;
DROP POLICY IF EXISTS "Collector debtors access" ON debtors;

-- Create new simplified policies for debtors
CREATE POLICY "Admin debtors access"
    ON debtors
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Collector debtors access"
    ON debtors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'collector'
            AND debtors.assigned_collector = profiles.id
        )
    );

-- Grant necessary permissions
GRANT ALL ON debtors TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;

-- Update profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

CREATE POLICY "View own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin manage profiles"
    ON profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
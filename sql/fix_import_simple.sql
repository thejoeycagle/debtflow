-- Drop existing policies
DROP POLICY IF EXISTS "Admin debtors access" ON debtors;
DROP POLICY IF EXISTS "Collector debtors access" ON debtors;
DROP POLICY IF EXISTS "View debtors" ON debtors;
DROP POLICY IF EXISTS "Manage debtors" ON debtors;

-- Create a simple policy that allows authenticated users to insert debtors
CREATE POLICY "Allow authenticated users"
    ON debtors
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON debtors TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;
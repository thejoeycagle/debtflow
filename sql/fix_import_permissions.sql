-- Drop existing policies
DROP POLICY IF EXISTS "View debtors" ON debtors;
DROP POLICY IF EXISTS "Manage debtors" ON debtors;

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
            AND (
                profiles.role = 'collector'
                AND debtors.assigned_collector = profiles.id
            )
        )
    );

-- Grant necessary permissions
GRANT ALL ON debtors TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;
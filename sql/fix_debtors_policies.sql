-- Drop existing policies
DROP POLICY IF EXISTS "Collectors can view assigned debtors" ON debtors;
DROP POLICY IF EXISTS "Collectors can update assigned debtors" ON debtors;
DROP POLICY IF EXISTS "Only admins can insert debtors" ON debtors;
DROP POLICY IF EXISTS "Only admins can delete debtors" ON debtors;

-- Create new simplified policies
CREATE POLICY "Collectors can view assigned debtors"
    ON debtors
    FOR SELECT
    USING (
        assigned_collector = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
        )
    );

CREATE POLICY "Collectors can update assigned debtors"
    ON debtors
    FOR UPDATE
    USING (
        assigned_collector = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
        )
    );

CREATE POLICY "Admin insert access"
    ON debtors
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
        )
    );

CREATE POLICY "Admin delete access"
    ON debtors
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
        )
    );

-- Ensure RLS is enabled
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view import history" ON import_history;
DROP POLICY IF EXISTS "Users can create import history" ON import_history;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_history;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_history;

-- Create simplified policies
CREATE POLICY "Import history access"
    ON import_history
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- Ensure created_by has a default value
ALTER TABLE import_history 
ALTER COLUMN created_by SET DEFAULT auth.uid();
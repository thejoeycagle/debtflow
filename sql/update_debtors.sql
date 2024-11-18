-- Add phone column to debtors table
ALTER TABLE public.debtors
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update existing triggers and policies
DROP TRIGGER IF EXISTS update_debtors_updated_at ON debtors;

CREATE TRIGGER update_debtors_updated_at
    BEFORE UPDATE ON debtors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Recreate policies
DROP POLICY IF EXISTS "Admin debtors access" ON debtors;
DROP POLICY IF EXISTS "Collector debtors access" ON debtors;

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
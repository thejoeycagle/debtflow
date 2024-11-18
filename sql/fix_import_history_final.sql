-- Drop existing policies
DROP POLICY IF EXISTS "Import history access" ON import_history;
DROP POLICY IF EXISTS "Users can view import history" ON import_history;
DROP POLICY IF EXISTS "Users can create import history" ON import_history;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_history;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_history;

-- Recreate the import_history table with proper defaults
CREATE TABLE IF NOT EXISTS public.import_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    total_records INTEGER NOT NULL,
    successful_records INTEGER NOT NULL DEFAULT 0,
    failed_records INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Create a single, simplified policy for authenticated users
CREATE POLICY "Authenticated users full access"
    ON import_history
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON import_history TO authenticated;
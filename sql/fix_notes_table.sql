-- Drop existing table if it exists to ensure clean state
DROP TABLE IF EXISTS public.notes CASCADE;

-- Create notes table
CREATE TABLE public.notes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    debtor_id uuid REFERENCES public.debtors(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notes_debtor_id ON notes(debtor_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Disable RLS temporarily
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Create simplified policy for testing
CREATE POLICY "Allow authenticated access"
    ON notes
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON notes TO authenticated;

-- Re-enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
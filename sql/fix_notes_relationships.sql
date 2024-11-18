-- Disable RLS temporarily
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE debtors DISABLE ROW LEVEL SECURITY;

-- Drop and recreate notes table with proper relationships
DROP TABLE IF EXISTS public.notes CASCADE;

CREATE TABLE public.notes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    debtor_id uuid REFERENCES public.debtors(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notes_debtor_id ON notes(debtor_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Create simplified policies for testing
CREATE POLICY "Allow authenticated access"
    ON notes
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated access"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated access"
    ON debtors
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON notes TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON debtors TO authenticated;

-- Re-enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;
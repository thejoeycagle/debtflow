-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
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

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view notes for their debtors"
    ON notes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM debtors
            WHERE debtors.id = notes.debtor_id
            AND (
                debtors.assigned_collector = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can create notes"
    ON notes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM debtors
            WHERE debtors.id = notes.debtor_id
            AND (
                debtors.assigned_collector = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            )
        )
    );

-- Grant permissions
GRANT ALL ON notes TO authenticated;
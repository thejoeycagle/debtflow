-- Create import_history table
CREATE TABLE IF NOT EXISTS public.import_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    total_records INTEGER NOT NULL,
    successful_records INTEGER NOT NULL DEFAULT 0,
    failed_records INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Add import_id column to debtors table
ALTER TABLE public.debtors
ADD COLUMN IF NOT EXISTS import_id uuid REFERENCES import_history(id);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view import history"
    ON import_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can create import history"
    ON import_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own imports"
    ON import_history
    FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own imports"
    ON import_history
    FOR DELETE
    USING (created_by = auth.uid());
-- Drop existing policies
DROP POLICY IF EXISTS "Import history access" ON import_history;
DROP POLICY IF EXISTS "Users can view import history" ON import_history;
DROP POLICY IF EXISTS "Users can create import history" ON import_history;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_history;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_history;
DROP POLICY IF EXISTS "Authenticated users full access" ON import_history;

-- Recreate the import_history table
DROP TABLE IF EXISTS public.import_history CASCADE;
CREATE TABLE public.import_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    total_records INTEGER NOT NULL,
    successful_records INTEGER NOT NULL DEFAULT 0,
    failed_records INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Add import_id column to debtors if it doesn't exist
ALTER TABLE public.debtors
ADD COLUMN IF NOT EXISTS import_id uuid REFERENCES import_history(id);

-- Disable RLS
ALTER TABLE public.import_history DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON public.import_history TO authenticated;
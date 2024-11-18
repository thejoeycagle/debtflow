-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();

-- Add pinned column if it doesn't exist
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Create index for pinned notes
CREATE INDEX IF NOT EXISTS idx_notes_pinned 
ON notes(pinned, created_at DESC);

-- Update existing notes to have pinned=false
UPDATE notes SET pinned = false WHERE pinned IS NULL;
-- Add pinned column to notes table
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Create index for pinned notes
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned, created_at DESC);

-- Update existing notes to have pinned=false
UPDATE notes SET pinned = false WHERE pinned IS NULL;
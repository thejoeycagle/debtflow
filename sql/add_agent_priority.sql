-- Add priority_rank column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS priority_rank INTEGER DEFAULT 999;

-- Create index for faster priority-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_priority_rank 
ON profiles(priority_rank) 
WHERE role = 'collector';

-- Update existing collectors with sequential ranks
WITH ranked_collectors AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rank
  FROM profiles
  WHERE role = 'collector'
)
UPDATE profiles p
SET priority_rank = rc.rank
FROM ranked_collectors rc
WHERE p.id = rc.id;
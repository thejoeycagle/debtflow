-- Add username and temp_password columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS temp_password TEXT;

-- Update existing agents to have usernames if missing
UPDATE profiles 
SET username = 'agent_' || substr(md5(random()::text), 1, 6)
WHERE role = 'collector' AND username IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);
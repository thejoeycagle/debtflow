-- Drop existing policies first
DROP POLICY IF EXISTS "Users can manage their own integrations" ON user_integrations;

-- Create user_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    account_sid TEXT,
    auth_token TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Ensure phone_number column exists in profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for faster lookups
DROP INDEX IF EXISTS idx_profiles_phone_number;
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number);

-- Update existing agent profiles with their phone numbers if missing
UPDATE profiles p
SET phone_number = ui.phone_number
FROM user_integrations ui
WHERE p.id = ui.user_id
AND p.phone_number IS NULL
AND ui.phone_number IS NOT NULL;

-- Grant necessary permissions
GRANT ALL ON user_integrations TO authenticated;

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage their own integrations"
    ON user_integrations
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
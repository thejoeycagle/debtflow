-- Disable RLS temporarily
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own integrations" ON user_integrations;

-- Create more permissive policy for authenticated users
CREATE POLICY "Allow authenticated users"
    ON user_integrations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON user_integrations TO authenticated;

-- Re-enable RLS with new policy
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Update existing integrations with Twilio defaults
UPDATE user_integrations
SET 
    account_sid = 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token = '1df8cc892f0a9bed66a6d77b8f2dff48'
WHERE account_sid IS NULL OR auth_token IS NULL;
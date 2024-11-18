-- Disable RLS temporarily
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;

-- Update all existing integrations with fixed credentials
UPDATE user_integrations
SET 
    account_sid = 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token = '1df8cc892f0a9bed66a6d77b8f2dff48',
    voice_enabled = true,
    is_active = false;

-- Create simplified policy
CREATE POLICY "Allow authenticated access"
    ON user_integrations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
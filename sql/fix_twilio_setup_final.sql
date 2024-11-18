-- Disable RLS temporarily for setup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Users can view own integration" ON user_integrations;
DROP POLICY IF EXISTS "Admin full access integrations" ON user_integrations;
DROP POLICY IF EXISTS "Edge function full access to user_integrations" ON user_integrations;

-- Create simplified policies for testing
CREATE POLICY "Allow all access"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access"
    ON user_integrations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Ensure integration exists for all collector agents
INSERT INTO user_integrations (
    user_id,
    account_sid,
    auth_token,
    phone_number,
    voice_enabled,
    is_active
)
SELECT 
    p.id,
    'ACa06f6ac15dcbab6cd11e272f4e774247',
    '1df8cc892f0a9bed66a6d77b8f2dff48',
    p.phone_number,
    true,
    false
FROM profiles p
WHERE p.role = 'collector'
AND NOT EXISTS (
    SELECT 1 FROM user_integrations ui WHERE ui.user_id = p.id
)
ON CONFLICT (user_id) DO UPDATE
SET 
    account_sid = EXCLUDED.account_sid,
    auth_token = EXCLUDED.auth_token,
    phone_number = EXCLUDED.phone_number,
    voice_enabled = EXCLUDED.voice_enabled;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_integrations TO authenticated;
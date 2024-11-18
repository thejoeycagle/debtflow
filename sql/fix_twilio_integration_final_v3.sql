-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS user_integrations CASCADE;

-- Create user_integrations table with proper structure
CREATE TABLE public.user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    account_sid TEXT NOT NULL DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT NOT NULL DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    phone_number TEXT,
    device_id TEXT,
    voice_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT false,
    last_connected_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_integration UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_user_integrations_phone_number ON user_integrations(phone_number);
CREATE INDEX idx_user_integrations_device_id ON user_integrations(device_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_integrations_updated_at
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
GRANT ALL ON user_integrations TO authenticated;

-- Create simplified policy
CREATE POLICY "Allow authenticated access"
    ON user_integrations
    FOR ALL 
    USING (true)
    WITH CHECK (true);
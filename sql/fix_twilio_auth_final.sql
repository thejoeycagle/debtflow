-- Update admin settings with Twilio configuration
UPDATE admin_settings
SET 
    account_sid = 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token = '1df8cc892f0a9bed66a6d77b8f2dff48',
    twiml_app_sid = 'AP936b25312c4d651739880d6bf0df7044',
    updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Ensure user_integrations table exists with proper structure
CREATE TABLE IF NOT EXISTS user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    account_sid TEXT NOT NULL,
    auth_token TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_integration UNIQUE(user_id)
);

-- Disable RLS temporarily for setup
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON user_integrations TO authenticated;
GRANT ALL ON admin_settings TO authenticated;
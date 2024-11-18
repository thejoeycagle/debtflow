-- Check and fix user_integrations table
CREATE TABLE IF NOT EXISTS public.user_integrations (
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

-- Check and fix admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_sid TEXT NOT NULL DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT NOT NULL DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    twiml_app_sid TEXT NOT NULL DEFAULT 'AP936b25312c4d651739880d6bf0df7044',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default admin settings if not exists
INSERT INTO admin_settings (
    id,
    account_sid,
    auth_token,
    twiml_app_sid
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'ACa06f6ac15dcbab6cd11e272f4e774247',
    '1df8cc892f0a9bed66a6d77b8f2dff48',
    'AP936b25312c4d651739880d6bf0df7044'
)
ON CONFLICT (id) DO UPDATE
SET 
    account_sid = EXCLUDED.account_sid,
    auth_token = EXCLUDED.auth_token,
    twiml_app_sid = EXCLUDED.twiml_app_sid;

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
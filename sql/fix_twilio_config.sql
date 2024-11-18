-- Drop existing table if it exists
DROP TABLE IF EXISTS public.admin_settings CASCADE;

-- Create admin_settings table with Twilio fields
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    openai_api_key TEXT,
    openai_model TEXT DEFAULT 'gpt-4',
    account_sid TEXT,
    auth_token TEXT,
    twiml_app_sid TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin settings access"
    ON admin_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default settings with Twilio configuration
INSERT INTO public.admin_settings (
    id,
    openai_model,
    account_sid,
    auth_token,
    twiml_app_sid
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'gpt-4',
    'ACa06f6ac15dcbab6cd11e272f4e774247',
    '1df8cc892f0a9bed66a6d77b8f2dff48',
    'AP936b25312c4d651739880d6bf0df7044'
) ON CONFLICT (id) DO UPDATE 
SET 
    account_sid = EXCLUDED.account_sid,
    auth_token = EXCLUDED.auth_token,
    twiml_app_sid = EXCLUDED.twiml_app_sid,
    updated_at = now();
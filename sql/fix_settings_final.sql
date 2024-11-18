-- Drop existing policies and recreate table
DROP POLICY IF EXISTS "Admin settings access" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow full access to admins" ON public.admin_settings;

-- Recreate admin_settings table
DROP TABLE IF EXISTS public.admin_settings CASCADE;
CREATE TABLE public.admin_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    openai_api_key TEXT,
    openai_model TEXT DEFAULT 'gpt-4',
    twilio_account_sid TEXT,
    twilio_auth_token TEXT,
    twilio_phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create admin policy using direct role check
CREATE POLICY "Admin settings access" ON public.admin_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO public.admin_settings (id, openai_model)
VALUES ('00000000-0000-0000-0000-000000000000', 'gpt-4')
ON CONFLICT (id) DO NOTHING;
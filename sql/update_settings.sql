-- Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    openai_api_key TEXT,
    openai_model TEXT DEFAULT 'gpt-4' NOT NULL,
    ai_temperature NUMERIC DEFAULT 0.7 NOT NULL,
    max_tokens INTEGER DEFAULT 150 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT temperature_range CHECK (ai_temperature >= 0 AND ai_temperature <= 1),
    CONSTRAINT max_tokens_range CHECK (max_tokens > 0 AND max_tokens <= 4000)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY admin_settings_policy ON public.admin_settings
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    ));

-- Create function to update settings
CREATE OR REPLACE FUNCTION update_admin_settings(
    p_openai_api_key TEXT,
    p_openai_model TEXT DEFAULT 'gpt-4',
    p_ai_temperature NUMERIC DEFAULT 0.7,
    p_max_tokens INTEGER DEFAULT 150
) RETURNS void AS $$
BEGIN
    INSERT INTO admin_settings (
        openai_api_key,
        openai_model,
        ai_temperature,
        max_tokens
    )
    VALUES (
        p_openai_api_key,
        p_openai_model,
        p_ai_temperature,
        p_max_tokens
    )
    ON CONFLICT (id)
    DO UPDATE SET
        openai_api_key = p_openai_api_key,
        openai_model = p_openai_model,
        ai_temperature = p_ai_temperature,
        max_tokens = p_max_tokens,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
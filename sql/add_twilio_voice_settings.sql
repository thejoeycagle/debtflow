-- Add voice settings columns to admin_settings
ALTER TABLE admin_settings
ADD COLUMN IF NOT EXISTS twiml_app_sid TEXT DEFAULT 'AP936b25312c4d651739880d6bf0df7044',
ADD COLUMN IF NOT EXISTS voice_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS voice_fallback_url TEXT,
ADD COLUMN IF NOT EXISTS voice_status_callback_url TEXT,
ADD COLUMN IF NOT EXISTS capability_token_ttl INTEGER DEFAULT 3600;

-- Add voice settings columns to user_integrations
ALTER TABLE user_integrations
ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_answer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ringtone_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS microphone_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS speaker_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS call_timeout INTEGER DEFAULT 30;
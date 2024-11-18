-- Add error tracking columns if they don't exist
ALTER TABLE admin_settings
ADD COLUMN IF NOT EXISTS last_phone_error TEXT,
ADD COLUMN IF NOT EXISTS last_phone_error_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS phone_error_count INTEGER DEFAULT 0;

-- Update Twilio credentials with proper values
UPDATE admin_settings
SET 
    account_sid = 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token = '1df8cc892f0a9bed66a6d77b8f2dff48',
    twiml_app_sid = 'AP936b25312c4d651739880d6bf0df7044',
    last_phone_error = NULL,
    last_phone_error_at = NULL,
    phone_error_count = 0
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Create index for error monitoring
CREATE INDEX IF NOT EXISTS idx_admin_settings_phone_errors 
ON admin_settings(last_phone_error_at)
WHERE last_phone_error IS NOT NULL;
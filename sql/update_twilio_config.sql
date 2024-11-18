-- Update Twilio configuration in admin_settings
UPDATE admin_settings
SET 
    account_sid = 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token = '1df8cc892f0a9bed66a6d77b8f2dff48',
    twiml_app_sid = 'AP936b25312c4d651739880d6bf0df7044'
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Add twiml_app_sid column if it doesn't exist
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS twiml_app_sid TEXT;
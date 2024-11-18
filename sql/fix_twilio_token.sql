-- Add capability token fields to admin_settings
ALTER TABLE admin_settings
ADD COLUMN IF NOT EXISTS capability_token_ttl INTEGER DEFAULT 3600;

-- Update admin settings with token configuration
UPDATE admin_settings
SET 
    capability_token_ttl = 3600
WHERE id = '00000000-0000-0000-0000-000000000000';
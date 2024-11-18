-- Add error tracking columns to user_integrations
ALTER TABLE user_integrations
ADD COLUMN IF NOT EXISTS last_error TEXT,
ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ;

-- Create function to track errors
CREATE OR REPLACE FUNCTION track_integration_error()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_error IS NOT NULL AND (OLD.last_error IS NULL OR NEW.last_error != OLD.last_error) THEN
        NEW.error_count = COALESCE(OLD.error_count, 0) + 1;
        NEW.last_error_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for error tracking
DROP TRIGGER IF EXISTS track_integration_error_trigger ON user_integrations;
CREATE TRIGGER track_integration_error_trigger
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION track_integration_error();

-- Create index for error monitoring
CREATE INDEX IF NOT EXISTS idx_user_integrations_errors 
ON user_integrations(last_error_at)
WHERE last_error IS NOT NULL;
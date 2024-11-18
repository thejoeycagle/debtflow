-- Add error tracking columns to admin_settings
ALTER TABLE admin_settings
ADD COLUMN IF NOT EXISTS last_phone_error TEXT,
ADD COLUMN IF NOT EXISTS last_phone_error_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS phone_error_count INTEGER DEFAULT 0;

-- Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for activity monitoring
CREATE INDEX IF NOT EXISTS idx_activity_logs_action 
ON activity_logs(action, created_at DESC);

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for activity logs
CREATE POLICY "Admin users can view all logs"
    ON activity_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON activity_logs TO authenticated;
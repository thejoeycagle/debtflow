-- Add activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for activity monitoring
CREATE INDEX IF NOT EXISTS idx_activity_logs_action 
ON activity_logs(action, created_at DESC);

-- Disable RLS temporarily
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON activity_logs TO authenticated;
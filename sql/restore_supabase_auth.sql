-- Drop old profiles table and related objects
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;

-- Create user_integrations table that references auth.users directly
CREATE TABLE public.user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    account_sid TEXT NOT NULL DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT NOT NULL DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    phone_number TEXT,
    device_id TEXT,
    is_active BOOLEAN DEFAULT false,
    last_connected_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_integration UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_user_integrations_phone_number ON user_integrations(phone_number);

-- Disable RLS temporarily
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;

-- Create simplified policy for authenticated users
CREATE POLICY "Allow authenticated users"
    ON user_integrations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON user_integrations TO authenticated;

-- Re-enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
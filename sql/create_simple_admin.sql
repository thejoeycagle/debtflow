-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

-- Create simplified profiles table
CREATE TABLE profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    role text CHECK (role IN ('admin', 'collector')),
    temp_password text,
    phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_integrations table
CREATE TABLE user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    account_sid TEXT DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    phone_number TEXT,
    device_id TEXT,
    is_active BOOLEAN DEFAULT false,
    last_connected_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_integration UNIQUE(user_id)
);

-- Create admin_settings table
CREATE TABLE admin_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_sid TEXT DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    twiml_app_sid TEXT DEFAULT 'AP936b25312c4d651739880d6bf0df7044',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);

-- Insert admin user with new credentials
INSERT INTO profiles (
    username,
    full_name,
    role,
    temp_password
) VALUES (
    'siteadmin',
    'Site Administrator',
    'admin',
    'Password123!'
) ON CONFLICT (username) DO UPDATE
SET temp_password = 'Password123!';

-- Insert default admin settings
INSERT INTO admin_settings (id)
VALUES ('00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_integrations TO authenticated;
GRANT ALL ON admin_settings TO authenticated;

-- Create simplified policies
CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users"
    ON user_integrations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users"
    ON admin_settings
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
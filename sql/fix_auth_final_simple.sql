-- Disable RLS on all tables
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_settings DISABLE ROW LEVEL SECURITY;

-- Drop existing tables
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

-- Create simplified profiles table
CREATE TABLE profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL,
    phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create unique index on username
CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);

-- Create user_integrations table
CREATE TABLE user_integrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    account_sid TEXT DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    phone_number TEXT,
    device_id TEXT,
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE admin_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    account_sid TEXT DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    twiml_app_sid TEXT DEFAULT 'AP936b25312c4d651739880d6bf0df7044',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert admin user
INSERT INTO profiles (username, password, full_name, role)
VALUES ('admin', 'admin123!', 'Admin User', 'admin');

-- Insert default admin settings
INSERT INTO admin_settings (id)
VALUES ('00000000-0000-0000-0000-000000000000');

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_integrations TO authenticated;
GRANT ALL ON admin_settings TO authenticated;
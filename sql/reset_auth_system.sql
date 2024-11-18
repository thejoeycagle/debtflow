-- Disable RLS on all tables for beta
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE debtors DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE voicemails DISABLE ROW LEVEL SECURITY;

-- Drop all existing tables and recreate profiles
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'collector')),
    temp_password text NOT NULL,
    phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number);

-- Create admin user
INSERT INTO profiles (
    username,
    full_name,
    role,
    temp_password
) VALUES (
    'admin',
    'Admin User',
    'admin',
    'admin123!'
);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
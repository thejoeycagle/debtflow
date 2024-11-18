-- Disable RLS on all tables for beta
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE debtors DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE voicemails DISABLE ROW LEVEL SECURITY;

-- Drop and recreate profiles table
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id uuid PRIMARY KEY,
    username text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'collector')),
    temp_password text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin user
INSERT INTO auth.users (
    email,
    encrypted_password,
    raw_user_meta_data,
    role,
    aud,
    confirmed_at
)
VALUES (
    'admin@debtflow.ai',
    crypt('admin123!', gen_salt('bf')),
    '{"role": "admin", "full_name": "Admin User"}'::jsonb,
    'authenticated',
    'authenticated',
    now()
)
ON CONFLICT (email) DO UPDATE
SET 
    encrypted_password = crypt('admin123!', gen_salt('bf')),
    raw_user_meta_data = '{"role": "admin", "full_name": "Admin User"}'::jsonb;

-- Create admin profile
INSERT INTO profiles (
    id,
    username,
    full_name,
    role,
    temp_password
)
SELECT 
    id,
    'admin',
    'Admin User',
    'admin',
    'admin123!'
FROM auth.users 
WHERE email = 'admin@debtflow.ai'
ON CONFLICT (username) DO UPDATE
SET temp_password = 'admin123!';

-- Grant permissions
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON profiles TO authenticated;
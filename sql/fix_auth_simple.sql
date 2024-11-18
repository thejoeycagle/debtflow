-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;

-- Create simplified profiles table
CREATE TABLE IF NOT EXISTS profiles_new (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text CHECK (role IN ('admin', 'collector')),
    temp_password text NOT NULL,
    phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Copy data if table exists
INSERT INTO profiles_new (id, username, full_name, role, temp_password, phone_number, created_at, updated_at)
SELECT id, username, full_name, role, temp_password, phone_number, created_at, updated_at
FROM profiles
ON CONFLICT (username) DO NOTHING;

-- Drop old table and rename new one
DROP TABLE profiles CASCADE;
ALTER TABLE profiles_new RENAME TO profiles;

-- Create indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Create admin user if not exists
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
) ON CONFLICT (username) DO UPDATE
SET temp_password = 'admin123!';

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
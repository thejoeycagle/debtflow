-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Create temporary table with new structure
CREATE TABLE profiles_temp (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text CHECK (role IN ('admin', 'collector')),
    temp_password text NOT NULL,
    phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Drop existing table and rename temp
DROP TABLE IF EXISTS profiles CASCADE;
ALTER TABLE profiles_temp RENAME TO profiles;

-- Create indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

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
) ON CONFLICT (username) DO UPDATE
SET temp_password = 'admin123!';

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
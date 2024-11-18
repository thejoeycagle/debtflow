-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Drop existing table and recreate with simplified structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    username text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'collector')),
    temp_password text NOT NULL,
    phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Insert admin user
INSERT INTO profiles (
    email,
    username,
    full_name,
    role,
    temp_password
) VALUES (
    'admin@debtflow.ai',
    'admin',
    'Admin User',
    'admin',
    'admin123!'
) ON CONFLICT (username) DO UPDATE
SET 
    temp_password = 'admin123!',
    email = 'admin@debtflow.ai',
    full_name = 'Admin User',
    role = 'admin';

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
DROP POLICY IF EXISTS "Admin settings access" ON admin_settings;

-- Create temporary table with new structure
CREATE TABLE profiles_temp (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text,
    username text UNIQUE,
    full_name text,
    role text CHECK (role IN ('admin', 'collector')),
    temp_password text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Copy existing data
INSERT INTO profiles_temp (id, email, username, full_name, role, temp_password, created_at, updated_at)
SELECT id, email, username, full_name, role, temp_password, created_at, updated_at
FROM profiles;

-- Drop old table with CASCADE to handle dependencies
DROP TABLE profiles CASCADE;

-- Rename temp table
ALTER TABLE profiles_temp RENAME TO profiles;

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);

-- Create admin user if not exists
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud
)
VALUES (
    'admin@debtflow.ai',
    crypt('admin123!', gen_salt('bf')),
    now(),
    jsonb_build_object(
        'role', 'admin',
        'full_name', 'Admin User',
        'username', 'admin'
    ),
    'authenticated',
    'authenticated'
)
ON CONFLICT (email) DO UPDATE
SET 
    encrypted_password = crypt('admin123!', gen_salt('bf')),
    raw_user_meta_data = jsonb_build_object(
        'role', 'admin',
        'full_name', 'Admin User',
        'username', 'admin'
    );

-- Create admin profile
INSERT INTO profiles (
    id,
    email,
    username,
    full_name,
    role,
    temp_password
)
SELECT 
    id,
    'admin@debtflow.ai',
    'admin',
    'Admin User',
    'admin',
    'admin123!'
FROM auth.users
WHERE email = 'admin@debtflow.ai'
ON CONFLICT (id) DO UPDATE
SET 
    username = 'admin',
    role = 'admin',
    temp_password = 'admin123!';

-- Re-enable RLS with simplified policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin settings access"
    ON admin_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON admin_settings TO authenticated;
-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;

-- Create temporary table with new structure
CREATE TABLE profiles_temp (
    id uuid PRIMARY KEY,
    username text,
    full_name text,
    role text CHECK (role IN ('admin', 'collector')),
    temp_password text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Drop existing table and rename temp
DROP TABLE IF EXISTS profiles CASCADE;
ALTER TABLE profiles_temp RENAME TO profiles;

-- Create unique index for username
CREATE UNIQUE INDEX profiles_username_unique_idx ON profiles(username);

-- Create admin user first to get ID
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
ON CONFLICT (email) 
DO UPDATE SET
    encrypted_password = crypt('admin123!', gen_salt('bf')),
    raw_user_meta_data = jsonb_build_object(
        'role', 'admin',
        'full_name', 'Admin User',
        'username', 'admin'
    );

-- Now create admin profile using the ID from auth.users
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
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Re-enable RLS with simplified policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
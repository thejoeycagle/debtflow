-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;

-- Drop existing constraints and indexes
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key CASCADE;
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_username_idx;

-- Recreate profiles table with proper constraints
CREATE TABLE IF NOT EXISTS profiles_new (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text,
    username text UNIQUE,
    full_name text,
    role text CHECK (role IN ('admin', 'collector')),
    temp_password text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Copy existing data if any
INSERT INTO profiles_new (id, email, username, full_name, role, temp_password, created_at, updated_at)
SELECT id, email, username, full_name, role, temp_password, created_at, updated_at
FROM profiles;

-- Drop old table and rename new one
DROP TABLE profiles;
ALTER TABLE profiles_new RENAME TO profiles;

-- Create admin user
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
    )
RETURNING id;

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
WHERE email = 'admin@debtflow.ai';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Re-enable RLS with simplified policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
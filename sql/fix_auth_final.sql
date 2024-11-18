-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Drop existing table and recreate with proper structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'collector')),
    phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

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
        'full_name', 'Admin User'
    ),
    'authenticated',
    'authenticated'
)
ON CONFLICT (email) DO UPDATE
SET 
    encrypted_password = crypt('admin123!', gen_salt('bf')),
    raw_user_meta_data = jsonb_build_object(
        'role', 'admin',
        'full_name', 'Admin User'
    );

-- Create admin profile
INSERT INTO profiles (
    id,
    email,
    full_name,
    role
)
SELECT 
    id,
    email,
    'Admin User',
    'admin'
FROM auth.users
WHERE email = 'admin@debtflow.ai'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Create policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin full access"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
        )
    );

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;

-- Create profiles table that references auth.users
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

-- Create user_integrations table
CREATE TABLE public.user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    account_sid TEXT NOT NULL DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT NOT NULL DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    phone_number TEXT,
    device_id TEXT,
    is_active BOOLEAN DEFAULT false,
    last_connected_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_integration UNIQUE(user_id)
);

-- Create indexes for user_integrations
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_user_integrations_phone_number ON user_integrations(phone_number);

-- Delete existing admin user if exists
DELETE FROM auth.users WHERE email = 'admin@debtflow.ai';

-- Create admin user
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud,
    confirmed_at
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
    'authenticated',
    now()
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
WHERE email = 'admin@debtflow.ai';

-- Grant necessary permissions
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_integrations TO authenticated;

-- Create simplified policies
CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users"
    ON user_integrations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
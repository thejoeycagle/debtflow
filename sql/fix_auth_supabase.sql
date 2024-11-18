-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Drop existing tables
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

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

-- Create user_integrations table
CREATE TABLE public.user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    account_sid TEXT DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    phone_number TEXT,
    device_id TEXT,
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE public.admin_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_sid TEXT DEFAULT 'ACa06f6ac15dcbab6cd11e272f4e774247',
    auth_token TEXT DEFAULT '1df8cc892f0a9bed66a6d77b8f2dff48',
    twiml_app_sid TEXT DEFAULT 'AP936b25312c4d651739880d6bf0df7044',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin user in auth.users
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

-- Insert default admin settings
INSERT INTO admin_settings (id)
VALUES ('00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_integrations TO authenticated;
GRANT ALL ON admin_settings TO authenticated;

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

CREATE POLICY "Allow authenticated users"
    ON admin_settings
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
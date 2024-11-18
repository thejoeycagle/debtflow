-- Drop existing tables
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;

-- Create profiles table that references auth.users
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
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

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create admin user profile directly
INSERT INTO profiles (
    id,
    email,
    full_name,
    role
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@debtflow.ai',
    'Admin User',
    'admin'
);

-- Create user_integrations table
CREATE TABLE public.user_integrations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Disable RLS on user_integrations
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_integrations TO authenticated;
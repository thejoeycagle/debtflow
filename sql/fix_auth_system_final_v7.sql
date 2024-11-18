-- Drop existing policies and disable RLS permanently
DROP POLICY IF EXISTS "Manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

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

-- Delete existing admin user if exists
DELETE FROM auth.users WHERE email = 'admin@debtflow.ai';

-- Create admin user with explicit ID
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
BEGIN
    -- Insert admin user with explicit ID
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        role,
        aud
    )
    VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
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
    );
    
    -- Delete existing admin profile if exists
    DELETE FROM profiles WHERE username = 'admin';
    
    -- Create admin profile
    INSERT INTO profiles (
        id,
        username,
        full_name,
        role,
        temp_password
    ) VALUES (
        admin_id,
        'admin',
        'Admin User',
        'admin',
        'admin123!'
    );
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create voicemails table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.voicemails (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    from_number TEXT NOT NULL,
    duration INTEGER NOT NULL,
    recording_url TEXT NOT NULL,
    transcription TEXT,
    is_new BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON voicemails TO authenticated;

-- Disable RLS on all tables for beta
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE debtors DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE voicemails DISABLE ROW LEVEL SECURITY;
-- Disable RLS on all tables for beta
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE debtors DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE voicemails DISABLE ROW LEVEL SECURITY;

-- Drop existing admin user and profile
DELETE FROM auth.users WHERE email = 'admin@debtflow.ai';
DELETE FROM profiles WHERE username = 'admin';

-- Create admin user with explicit ID and role
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
    '{"role": "admin", "full_name": "Admin User"}'::jsonb,
    'authenticated',
    'authenticated',
    now()
);

-- Get the admin user ID
DO $$
DECLARE
    admin_id uuid;
BEGIN
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@debtflow.ai';
    
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

-- Grant necessary permissions
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON profiles TO authenticated;
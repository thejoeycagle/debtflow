-- First, disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Delete existing admin user and related data
DELETE FROM auth.users WHERE email = 'admin@debtflow.ai';
DELETE FROM profiles WHERE email = 'admin@debtflow.ai';

-- Create admin user with explicit ID
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
BEGIN
    -- Insert admin user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        role,
        aud,
        created_at,
        updated_at,
        confirmation_token
    )
    VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@debtflow.ai',
        crypt('admin123!', gen_salt('bf')),
        now(),
        jsonb_build_object(
            'role', 'admin',
            'full_name', 'Admin User'
        ),
        'authenticated',
        'authenticated',
        now(),
        now(),
        encode(gen_random_bytes(32), 'hex')
    );

    -- Create admin profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role
    )
    VALUES (
        admin_id,
        'admin@debtflow.ai',
        'Admin User',
        'admin'
    );

    -- Create default admin settings if not exists
    INSERT INTO admin_settings (
        id,
        account_sid,
        auth_token,
        twiml_app_sid
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'ACa06f6ac15dcbab6cd11e272f4e774247',
        '1df8cc892f0a9bed66a6d77b8f2dff48',
        'AP936b25312c4d651739880d6bf0df7044'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        account_sid = EXCLUDED.account_sid,
        auth_token = EXCLUDED.auth_token,
        twiml_app_sid = EXCLUDED.twiml_app_sid;

END $$;

-- Grant necessary permissions
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON admin_settings TO authenticated;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
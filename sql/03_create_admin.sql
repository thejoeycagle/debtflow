-- Create admin user in auth.users
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Create or update admin user
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        role,
        aud,
        created_at,
        updated_at
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
        now(),
        now()
    )
    ON CONFLICT (email) 
    DO UPDATE SET
        encrypted_password = crypt('admin123!', gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object(
            'role', 'admin',
            'full_name', 'Admin User'
        ),
        updated_at = now()
    RETURNING id INTO admin_id;

    -- Create or update admin profile
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
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        role = 'admin',
        updated_at = now();
END $$;
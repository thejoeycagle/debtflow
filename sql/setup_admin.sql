-- Create admin user if not exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get or create admin user
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@debtflow.ai';

    -- Create profile if not exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@debtflow.ai') THEN
        INSERT INTO profiles (id, email, full_name, role)
        VALUES (
            admin_user_id,
            'admin@debtflow.ai',
            'Admin User',
            'admin'
        )
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin';
    END IF;
END
$$;
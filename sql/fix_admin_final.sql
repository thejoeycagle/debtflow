-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Get existing admin user ID
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Get the existing admin user ID
    SELECT id INTO admin_id
    FROM auth.users
    WHERE email = 'admin@debtflow.ai';

    -- Create or update admin profile using the existing ID
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
        full_name = 'Admin User',
        updated_at = now();

END $$;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
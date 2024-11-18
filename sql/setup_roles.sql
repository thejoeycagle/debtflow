-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "View debtors" ON debtors;
DROP POLICY IF EXISTS "Manage debtors" ON debtors;

-- Create simplified profile policies
CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin full access"
    ON profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create simplified debtors policies
CREATE POLICY "View debtors"
    ON debtors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.uid() = debtors.assigned_collector
            )
        )
    );

CREATE POLICY "Manage debtors"
    ON debtors
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create default admin user if not exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Create admin user through auth.users
    INSERT INTO auth.users (
        email,
        raw_user_meta_data,
        role,
        encrypted_password
    )
    VALUES (
        'admin@debtflow.ai',
        '{"role": "admin", "full_name": "Admin User"}'::jsonb,
        'authenticated',
        crypt('admin123!', gen_salt('bf'))
    )
    ON CONFLICT (email) DO UPDATE
    SET raw_user_meta_data = '{"role": "admin", "full_name": "Admin User"}'::jsonb
    RETURNING id INTO admin_user_id;

    -- Create or update admin profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        admin_user_id,
        'admin@debtflow.ai',
        'Admin User',
        'admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
END
$$;
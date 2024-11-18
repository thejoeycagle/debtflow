-- Update admin user's metadata and ensure proper role
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'admin@debtflow.ai';

-- Ensure admin profile exists with correct role
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
    'admin'
FROM auth.users 
WHERE email = 'admin@debtflow.ai'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    updated_at = now();

-- Verify and fix policies
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Recreate profile policies
CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin full access"
    ON profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON debtors TO authenticated;
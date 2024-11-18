-- Drop all existing policies
DROP POLICY IF EXISTS "Manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profile management" ON profiles;
DROP POLICY IF EXISTS "Allow profile management" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Users can manage profiles" ON profiles;

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Update admin user
UPDATE auth.users 
SET 
    raw_user_meta_data = jsonb_build_object(
        'role', 'admin',
        'full_name', 'Admin User',
        'username', 'admin'
    ),
    email = 'admin@debtflow.ai',
    encrypted_password = crypt('admin123!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin@debtflow.ai';

-- Update admin profile
UPDATE profiles
SET 
    username = 'admin',
    email = 'admin@debtflow.ai',
    full_name = 'Admin User',
    role = 'admin',
    updated_at = now()
WHERE email = 'admin@debtflow.ai';

-- Re-enable RLS with a single simplified policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage profiles"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
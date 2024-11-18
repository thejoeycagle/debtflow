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

-- Ensure username column exists and is properly indexed
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Re-enable RLS with simplified policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage profiles"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
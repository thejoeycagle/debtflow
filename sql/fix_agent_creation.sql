-- Enable RLS bypass for admin users
ALTER TABLE auth.users SECURITY DEFINER;

-- Create policy for admin user management
CREATE POLICY "Admins can manage users"
    ON auth.users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow email registration without domain restrictions
INSERT INTO auth.email_allow_list (email, created_at, updated_at)
VALUES 
    ('*@debtflow.ai', now(), now()),
    ('*@temp.debtflow.ai', now(), now())
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Ensure RLS is enabled but admin can bypass
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
-- Enable service role capabilities
ALTER ROLE authenticator SET request.jwt.claim.role TO 'service_role';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticator;
GRANT ALL ON auth.users TO authenticator;

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

-- Ensure profiles table permissions
GRANT ALL ON profiles TO authenticated;

-- Allow direct user creation without email verification
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
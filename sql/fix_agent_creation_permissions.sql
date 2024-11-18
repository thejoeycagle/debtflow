-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;

-- Create policy for profile management
CREATE POLICY "Profile management"
    ON profiles
    FOR ALL 
    USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;

-- Allow email registration for agent accounts
INSERT INTO auth.email_allow_list (email)
VALUES ('*@debtflow.ai')
ON CONFLICT DO NOTHING;
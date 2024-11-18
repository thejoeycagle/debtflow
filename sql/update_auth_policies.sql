-- Update policies to allow admin users to manage other users
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

-- Grant necessary permissions
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON profiles TO authenticated;
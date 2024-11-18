-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin settings access" ON public.admin_settings;

-- Create new profile policies without recursion
CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin full access"
    ON profiles
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Fix admin_settings policy
CREATE POLICY "Admin settings access"
    ON admin_settings
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Insert default admin settings if not exists
INSERT INTO admin_settings (id, openai_model)
VALUES ('00000000-0000-0000-0000-000000000000', 'gpt-4')
ON CONFLICT (id) DO NOTHING;
-- Drop existing policies and disable RLS temporarily
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Modify profiles table to handle agent creation properly
ALTER TABLE profiles ALTER COLUMN id DROP NOT NULL;

-- Add trigger to handle ID assignment
CREATE OR REPLACE FUNCTION set_profile_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL THEN
        NEW.id := gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ID if not provided
DROP TRIGGER IF EXISTS set_profile_id_trigger ON profiles;
CREATE TRIGGER set_profile_id_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_profile_id();

-- Re-enable RLS with simplified policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
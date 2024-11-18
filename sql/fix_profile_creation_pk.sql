-- Drop existing policies and disable RLS temporarily
DROP POLICY IF EXISTS "Allow authenticated users" ON profiles;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create temporary table with new structure
CREATE TABLE profiles_new (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'collector'))
);

-- Copy existing data
INSERT INTO profiles_new (id, email, full_name, role, created_at, updated_at)
SELECT id, email, full_name, role, created_at, updated_at
FROM profiles;

-- Drop old table and rename new one
DROP TABLE profiles;
ALTER TABLE profiles_new RENAME TO profiles;

-- Create index on email
CREATE UNIQUE INDEX profiles_email_idx ON profiles(email);

-- Re-enable RLS with simplified policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
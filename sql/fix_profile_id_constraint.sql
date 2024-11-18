-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create temporary table with modified structure
CREATE TABLE profiles_temp (
    id uuid DEFAULT gen_random_uuid(),
    email text NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'collector'))
);

-- Copy existing data
INSERT INTO profiles_temp (id, email, full_name, role, created_at, updated_at)
SELECT id, email, full_name, role, created_at, updated_at
FROM profiles;

-- Drop existing table and constraints
DROP TABLE profiles CASCADE;

-- Rename temp table to profiles
ALTER TABLE profiles_temp RENAME TO profiles;

-- Add primary key constraint after data is inserted
ALTER TABLE profiles ADD PRIMARY KEY (id);

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
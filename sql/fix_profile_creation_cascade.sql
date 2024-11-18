-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE debtors DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

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

-- Drop old table and constraints with cascade
DROP TABLE profiles CASCADE;

-- Rename new table
ALTER TABLE profiles_new RENAME TO profiles;

-- Recreate foreign key constraints
ALTER TABLE debtors
    ADD CONSTRAINT debtors_assigned_collector_fkey 
    FOREIGN KEY (assigned_collector) 
    REFERENCES profiles(id);

ALTER TABLE activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id);

-- Recreate view
CREATE OR REPLACE VIEW collector_performance AS
SELECT 
    p.id as collector_id,
    p.full_name as collector_name,
    count(d.id) as total_cases,
    count(case when d.status = 'resolved' then 1 end) as resolved_cases,
    sum(d.total_balance) as total_debt_assigned,
    count(case when d.status = 'resolved' then 1 end)::float / 
        nullif(count(d.id), 0) * 100 as resolution_rate
FROM 
    profiles p
    LEFT JOIN debtors d on d.assigned_collector = p.id
WHERE 
    p.role = 'collector'
GROUP BY 
    p.id, p.full_name;

-- Create index on email
CREATE UNIQUE INDEX profiles_email_idx ON profiles(email);

-- Re-enable RLS with simplified policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Recreate necessary policies
CREATE POLICY "Allow authenticated users"
    ON profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin settings access"
    ON admin_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin debtors access"
    ON debtors
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Collector debtors access"
    ON debtors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'collector'
            AND debtors.assigned_collector = profiles.id
        )
    );

CREATE POLICY "Users can view activity logs"
    ON activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM debtors
            WHERE debtors.id = activity_logs.debtor_id
            AND (
                debtors.assigned_collector = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            )
        )
    );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON debtors TO authenticated;
GRANT ALL ON activity_logs TO authenticated;
GRANT ALL ON admin_settings TO authenticated;
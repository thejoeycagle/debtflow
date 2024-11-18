-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or update profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id uuid references auth.users on delete cascade primary key,
            email text unique not null,
            full_name text not null,
            role text not null,
            created_at timestamptz default now() not null,
            updated_at timestamptz default now() not null,
            CONSTRAINT valid_role CHECK (role IN ('admin', 'collector'))
        );

        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Profiles policies
        CREATE POLICY "Users can view their own profile"
            ON profiles FOR SELECT
            USING (auth.uid() = id);

        CREATE POLICY "Admins can view all profiles"
            ON profiles FOR ALL
            USING (EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            ));
    END IF;
END $$;

-- Create or update admin_settings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_settings') THEN
        CREATE TABLE public.admin_settings (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            openai_api_key TEXT,
            openai_model TEXT DEFAULT 'gpt-4',
            twilio_account_sid TEXT,
            twilio_auth_token TEXT,
            twilio_phone_number TEXT,
            created_at timestamptz default now(),
            updated_at timestamptz default now()
        );

        ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow full access to admins" ON public.admin_settings
            USING (EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            ));

        -- Insert default settings if none exist
        INSERT INTO public.admin_settings (id, openai_model)
        VALUES ('00000000-0000-0000-0000-000000000000', 'gpt-4')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Create or update debtors table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'debtors') THEN
        CREATE TABLE public.debtors (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            full_name text not null,
            first_name text not null,
            last_name text not null,
            address text,
            city text,
            state text,
            zipcode text,
            dob date,
            ssn text,
            creditor_name text,
            date_chargedoff date,
            date_opened date,
            original_creditor_number text,
            account_number text,
            total_balance numeric not null default 0,
            assigned_collector uuid references profiles(id),
            status text check (status in ('new', 'in_progress', 'pending', 'resolved')) not null default 'new',
            created_at timestamptz default now() not null,
            updated_at timestamptz default now() not null
        );

        ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;

        -- Debtors policies
        CREATE POLICY "Collectors can view assigned debtors"
            ON debtors FOR SELECT
            USING (
                assigned_collector = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );

        CREATE POLICY "Collectors can update assigned debtors"
            ON debtors FOR UPDATE
            USING (
                assigned_collector = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );

        CREATE POLICY "Only admins can insert debtors"
            ON debtors FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );

        CREATE POLICY "Only admins can delete debtors"
            ON debtors FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
    END IF;
END $$;

-- Create or update activity_logs table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_logs') THEN
        CREATE TABLE public.activity_logs (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id uuid references profiles(id) not null,
            debtor_id uuid references debtors(id) not null,
            action text not null,
            details jsonb,
            created_at timestamptz default now() not null
        );

        ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view activity logs for their debtors"
            ON activity_logs FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM debtors
                    WHERE debtors.id = activity_logs.debtor_id
                    AND (debtors.assigned_collector = auth.uid() OR
                        EXISTS (
                            SELECT 1 FROM profiles
                            WHERE profiles.id = auth.uid()
                            AND profiles.role = 'admin'
                        )
                    )
                )
            );
    END IF;
END $$;

-- Create or update collector_performance view
DO $$ 
BEGIN
    DROP VIEW IF EXISTS collector_performance;
    CREATE VIEW collector_performance AS
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
END $$;

-- Create or update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or update triggers
DO $$ 
BEGIN
    -- Profiles trigger
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Debtors trigger
    DROP TRIGGER IF EXISTS update_debtors_updated_at ON debtors;
    CREATE TRIGGER update_debtors_updated_at
        BEFORE UPDATE ON debtors
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Admin settings trigger
    DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
    CREATE TRIGGER update_admin_settings_updated_at
        BEFORE UPDATE ON admin_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;
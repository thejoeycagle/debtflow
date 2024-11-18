-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.activity_logs;
DROP TABLE IF EXISTS public.debtors;
DROP TABLE IF EXISTS public.admin_settings;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text not null,
    role text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'collector'))
);

-- Create admin_settings table
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

-- Create debtors table
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

-- Create activity_logs table
CREATE TABLE public.activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid references profiles(id) not null,
    debtor_id uuid references debtors(id) not null,
    action text not null,
    details jsonb,
    created_at timestamptz default now() not null
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debtors_updated_at
    BEFORE UPDATE ON debtors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Admin settings policies
CREATE POLICY "Admins can manage settings"
    ON admin_settings FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Debtors policies
CREATE POLICY "Collectors can view assigned debtors"
    ON debtors FOR SELECT
    USING (
        assigned_collector = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Collectors can update assigned debtors"
    ON debtors FOR UPDATE
    USING (
        assigned_collector = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage debtors"
    ON debtors FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Activity logs policies
CREATE POLICY "Users can view relevant activity logs"
    ON activity_logs FOR SELECT
    USING (
        user_id = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can create activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

-- Insert default admin settings if not exists
INSERT INTO public.admin_settings (id, openai_model)
VALUES ('00000000-0000-0000-0000-000000000000', 'gpt-4')
ON CONFLICT (id) DO NOTHING;
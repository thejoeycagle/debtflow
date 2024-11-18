-- Drop existing policy
DROP POLICY IF EXISTS "Phone numbers access" ON phone_numbers;

-- Disable RLS temporarily to ensure clean state
ALTER TABLE public.phone_numbers DISABLE ROW LEVEL SECURITY;

-- Create simplified policy for authenticated users
CREATE POLICY "Authenticated users full access"
    ON phone_numbers
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.phone_numbers TO authenticated;
-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access to admins" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new admin_settings policy
CREATE POLICY "Admin settings access" ON public.admin_settings
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Create new profiles policy for admins
CREATE POLICY "Admin profiles access" ON public.profiles
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
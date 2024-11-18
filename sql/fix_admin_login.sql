-- Drop existing admin user if exists
DELETE FROM auth.users WHERE email = 'admin@debtflow.ai';
DELETE FROM public.profiles WHERE email = 'admin@debtflow.ai';

-- Create admin user with proper credentials
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@debtflow.ai',
    crypt('admin123!', gen_salt('bf')),
    now(),
    '{"role": "admin", "full_name": "Admin User"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    encode(gen_random_bytes(32), 'hex')
);

-- Create admin profile
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'role',
    created_at,
    updated_at
FROM auth.users
WHERE email = 'admin@debtflow.ai'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    updated_at = now();
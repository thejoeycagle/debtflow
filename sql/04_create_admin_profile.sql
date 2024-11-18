-- Create or update admin profile
INSERT INTO profiles (
    id,
    email,
    full_name,
    role
)
SELECT 
    id,
    email,
    'Admin User',
    'admin'
FROM auth.users
WHERE email = 'admin@debtflow.ai'
ON CONFLICT (id) 
DO UPDATE SET
    role = 'admin',
    updated_at = now();
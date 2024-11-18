-- Enable admin API for user management
ALTER ROLE authenticator SET request.jwt.claim.role TO 'service_role';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticator;
GRANT ALL ON auth.users TO authenticator;
GRANT ALL ON auth.refresh_tokens TO authenticator;
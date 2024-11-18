-- Add phone_number to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number 
ON profiles(phone_number);
-- Add phone_number column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for phone number lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number 
ON profiles(phone_number);
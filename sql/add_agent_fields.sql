-- Add username and temp_password columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS temp_password TEXT;
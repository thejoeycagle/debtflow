-- Add temporary password column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS temp_password TEXT;
-- Add contact_name column to phone_numbers table if it doesn't exist
ALTER TABLE phone_numbers 
ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Create index for contact name search
CREATE INDEX IF NOT EXISTS idx_phone_numbers_contact_name 
ON phone_numbers(contact_name);
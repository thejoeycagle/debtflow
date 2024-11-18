-- Create index for phone number search if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_phone_numbers_number ON phone_numbers(number);

-- Ensure phone_numbers table has proper structure
ALTER TABLE phone_numbers
ALTER COLUMN number TYPE text,
ALTER COLUMN number SET NOT NULL;
-- Add billing zip column to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS card_zip TEXT;

-- Create index for billing zip lookups
CREATE INDEX IF NOT EXISTS idx_payments_card_zip 
ON payments(card_zip);

-- Update existing payments to have null card_zip
UPDATE payments 
SET card_zip = NULL 
WHERE card_zip IS NOT NULL;
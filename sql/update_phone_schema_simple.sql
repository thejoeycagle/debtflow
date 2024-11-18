-- Drop existing phone_numbers column
ALTER TABLE public.debtors 
DROP COLUMN IF EXISTS phone_numbers;

-- Add phone_numbers column with simplified validation
ALTER TABLE public.debtors
ADD COLUMN phone_numbers jsonb DEFAULT '[]'::jsonb NOT NULL
CONSTRAINT valid_phone_numbers CHECK (
  jsonb_typeof(phone_numbers) = 'array'
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_debtors_phone_numbers 
ON public.debtors USING gin (phone_numbers);

-- Convert any existing phone data to new format
UPDATE public.debtors
SET phone_numbers = '[]'::jsonb
WHERE phone_numbers IS NULL;
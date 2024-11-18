-- Drop existing phone_numbers column and recreate with proper default
ALTER TABLE public.debtors 
DROP COLUMN IF EXISTS phone_numbers;

ALTER TABLE public.debtors
ADD COLUMN phone_numbers jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Update any existing null values to empty array
UPDATE public.debtors 
SET phone_numbers = '[]'::jsonb 
WHERE phone_numbers IS NULL;
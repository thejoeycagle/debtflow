-- Rename phone column to phone_numbers and change type to jsonb
ALTER TABLE public.debtors 
DROP COLUMN IF EXISTS phone;

ALTER TABLE public.debtors
ADD COLUMN phone_numbers jsonb DEFAULT '[]'::jsonb;
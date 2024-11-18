-- Alter payments table to make customer_name nullable
ALTER TABLE public.payments
ALTER COLUMN customer_name DROP NOT NULL;
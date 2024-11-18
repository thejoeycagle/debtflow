-- Create phone_numbers table
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    debtor_id uuid REFERENCES public.debtors(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    status TEXT CHECK (status IN ('good', 'bad', 'unknown')) DEFAULT 'unknown',
    label TEXT CHECK (label IN ('direct', 'relative')) DEFAULT 'direct',
    contact_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_phone_numbers_debtor_id 
ON public.phone_numbers(debtor_id);

-- Create updated_at trigger
CREATE TRIGGER update_phone_numbers_updated_at
    BEFORE UPDATE ON public.phone_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create policy for access
CREATE POLICY "Phone numbers access"
    ON phone_numbers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM debtors
            WHERE debtors.id = phone_numbers.debtor_id
            AND (
                debtors.assigned_collector = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            )
        )
    );

-- Migrate existing phone numbers
INSERT INTO phone_numbers (debtor_id, number, status, label, contact_name)
SELECT 
    d.id as debtor_id,
    (p->>'number')::text as number,
    COALESCE(p->>'status', 'unknown') as status,
    COALESCE(p->>'label', 'direct') as label,
    COALESCE(p->>'name', '') as contact_name
FROM debtors d
CROSS JOIN LATERAL jsonb_array_elements(
    CASE 
        WHEN d.phone_numbers IS NULL THEN '[]'::jsonb
        ELSE d.phone_numbers
    END
) as p
WHERE jsonb_typeof(d.phone_numbers) = 'array';

-- Drop old phone_numbers column
ALTER TABLE public.debtors
DROP COLUMN IF EXISTS phone_numbers;
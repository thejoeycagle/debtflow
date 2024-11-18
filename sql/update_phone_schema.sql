-- Drop existing phone_numbers column
ALTER TABLE public.debtors 
DROP COLUMN IF EXISTS phone_numbers;

-- Add phone_numbers column with proper JSONB schema validation
ALTER TABLE public.debtors
ADD COLUMN phone_numbers jsonb DEFAULT '[]'::jsonb NOT NULL
CONSTRAINT valid_phone_numbers CHECK (
  jsonb_typeof(phone_numbers) = 'array' 
  AND (
    (jsonb_array_length(phone_numbers) = 0)
    OR
    NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(phone_numbers) AS phone
      WHERE NOT (
        -- Check required fields exist
        phone ? 'number' 
        AND phone ? 'status'
        -- Check status is valid
        AND (phone->>'status' IN ('good', 'bad', 'unknown'))
        -- Check number is not empty
        AND (phone->>'number' <> '')
        -- If label exists, check it's valid
        AND (
          NOT (phone ? 'label') 
          OR (phone->>'label' IN ('direct', 'relative'))
        )
      )
    )
  )
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_debtors_phone_numbers 
ON public.debtors USING gin (phone_numbers);

-- Convert any existing phone data to new format
UPDATE public.debtors
SET phone_numbers = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'number', CASE 
          WHEN jsonb_typeof(p) = 'string' THEN p::text 
          WHEN jsonb_typeof(p) = 'object' AND p ? 'number' THEN p->>'number'
          ELSE NULL 
        END,
        'status', COALESCE(p->>'status', 'unknown')
      )
    )
    FROM jsonb_array_elements(
      CASE 
        WHEN jsonb_typeof(phone_numbers) = 'array' THEN phone_numbers
        WHEN phone_numbers IS NULL THEN '[]'::jsonb
        ELSE jsonb_build_array(phone_numbers)
      END
    ) AS p
    WHERE CASE 
      WHEN jsonb_typeof(p) = 'string' THEN p::text 
      WHEN jsonb_typeof(p) = 'object' AND p ? 'number' THEN p->>'number'
      ELSE NULL 
    END IS NOT NULL
  ),
  '[]'::jsonb
)
WHERE phone_numbers IS NULL OR jsonb_typeof(phone_numbers) = 'array';
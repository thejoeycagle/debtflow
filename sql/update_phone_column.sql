-- Update phone column to store JSON data
ALTER TABLE public.debtors
ALTER COLUMN phone TYPE jsonb USING 
  CASE 
    WHEN phone IS NULL THEN '[]'::jsonb
    WHEN phone = '' THEN '[]'::jsonb
    ELSE ('[' || 
      string_agg(
        json_build_object(
          'number', trim(value),
          'status', 'unknown',
          'label', 'direct',
          'name', ''
        )::text,
        ','
      ) ||
    ']')::jsonb
  END;
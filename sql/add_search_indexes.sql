-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Add GIN indexes for faster text search
CREATE INDEX IF NOT EXISTS idx_debtors_full_name_gin ON debtors USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_debtors_first_name_gin ON debtors USING gin(first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_debtors_last_name_gin ON debtors USING gin(last_name gin_trgm_ops);

-- Add index for phone numbers text search
CREATE INDEX IF NOT EXISTS idx_phone_numbers_number_gin ON phone_numbers USING gin(number gin_trgm_ops);

-- Add index for social media JSONB search
CREATE INDEX IF NOT EXISTS idx_debtors_social_media_gin ON debtors USING gin(social_media);
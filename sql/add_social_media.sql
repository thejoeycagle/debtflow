-- Add social_media column to debtors table
ALTER TABLE debtors
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- Create index for social media search
CREATE INDEX IF NOT EXISTS idx_debtors_social_media_gin ON debtors USING gin(social_media);

-- Create function to search social media
CREATE OR REPLACE FUNCTION search_social_media(search_term TEXT)
RETURNS TABLE (
    debtor_id uuid,
    match_type TEXT,
    match_value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        'social_media' as match_type,
        COALESCE(
            d.social_media->>'facebook',
            d.social_media->>'twitter',
            d.social_media->>'instagram'
        ) as match_value
    FROM debtors d
    WHERE 
        d.social_media->>'facebook' ILIKE '%' || search_term || '%' OR
        d.social_media->>'twitter' ILIKE '%' || search_term || '%' OR
        d.social_media->>'instagram' ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;
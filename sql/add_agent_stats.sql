-- Create agent_stats table to track call metrics
CREATE TABLE IF NOT EXISTS public.agent_stats (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    calls_taken INTEGER DEFAULT 0,
    calls_missed INTEGER DEFAULT 0,
    calls_resolved INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_stats_agent_id 
ON agent_stats(agent_id);

-- Create function to calculate close rate
CREATE OR REPLACE FUNCTION get_agent_close_rate(calls_resolved INTEGER, calls_taken INTEGER)
RETURNS NUMERIC AS $$
BEGIN
    IF calls_taken = 0 THEN
        RETURN 0;
    END IF;
    RETURN ROUND((calls_resolved::NUMERIC / calls_taken::NUMERIC) * 100, 1);
END;
$$ LANGUAGE plpgsql;
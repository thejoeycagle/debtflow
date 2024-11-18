-- Function to update agent stats when a call is handled
CREATE OR REPLACE FUNCTION update_agent_call_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Create stats record if it doesn't exist
    INSERT INTO agent_stats (agent_id)
    VALUES (NEW.user_id)
    ON CONFLICT (agent_id) DO NOTHING;

    -- Update stats based on call outcome
    UPDATE agent_stats
    SET 
        calls_taken = CASE 
            WHEN NEW.action = 'call_answered' THEN calls_taken + 1
            ELSE calls_taken
        END,
        calls_missed = CASE 
            WHEN NEW.action = 'call_missed' THEN calls_missed + 1
            ELSE calls_missed
        END,
        calls_resolved = CASE 
            WHEN NEW.action = 'call_resolved' THEN calls_resolved + 1
            ELSE calls_resolved
        END,
        updated_at = now()
    WHERE agent_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats on activity log entries
CREATE TRIGGER update_agent_stats_trigger
    AFTER INSERT ON activity_logs
    FOR EACH ROW
    WHEN (NEW.action IN ('call_answered', 'call_missed', 'call_resolved'))
    EXECUTE FUNCTION update_agent_call_stats();
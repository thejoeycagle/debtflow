-- Ensure all agents have stats records
INSERT INTO agent_stats (agent_id)
SELECT id FROM profiles 
WHERE role = 'collector'
AND NOT EXISTS (
    SELECT 1 FROM agent_stats WHERE agent_id = profiles.id
)
ON CONFLICT DO NOTHING;

-- Ensure all agents have performance records
INSERT INTO agent_performance (agent_id, date)
SELECT id, CURRENT_DATE FROM profiles 
WHERE role = 'collector'
AND NOT EXISTS (
    SELECT 1 FROM agent_performance 
    WHERE agent_id = profiles.id AND date = CURRENT_DATE
)
ON CONFLICT DO NOTHING;

-- Create or replace function to track activity and update streaks
CREATE OR REPLACE FUNCTION update_agent_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update agent stats
    UPDATE agent_stats 
    SET 
        current_streak = CASE 
            WHEN EXISTS (
                SELECT 1 FROM agent_performance 
                WHERE agent_id = NEW.agent_id 
                AND date = CURRENT_DATE - INTERVAL '1 day'
            ) THEN current_streak + 1
            ELSE 1
        END,
        longest_streak = GREATEST(
            COALESCE(longest_streak, 0),
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM agent_performance 
                    WHERE agent_id = NEW.agent_id 
                    AND date = CURRENT_DATE - INTERVAL '1 day'
                ) THEN current_streak + 1
                ELSE 1
            END
        )
    WHERE agent_id = NEW.agent_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity tracking
DROP TRIGGER IF EXISTS track_agent_activity_trigger ON activity_logs;
CREATE TRIGGER track_agent_activity_trigger
    AFTER INSERT ON activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_activity();

-- Enable all achievement triggers
DROP TRIGGER IF EXISTS check_achievements_trigger ON agent_stats;
CREATE TRIGGER check_achievements_trigger
    AFTER UPDATE ON agent_stats
    FOR EACH ROW
    EXECUTE FUNCTION check_achievements();

DROP TRIGGER IF EXISTS update_daily_performance_trigger ON activity_logs;
CREATE TRIGGER update_daily_performance_trigger
    AFTER INSERT ON activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_performance();

-- Grant necessary permissions
GRANT ALL ON agent_stats TO authenticated;
GRANT ALL ON agent_performance TO authenticated;
GRANT ALL ON agent_achievements TO authenticated;
GRANT ALL ON achievements TO authenticated;

-- Enable RLS
ALTER TABLE agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for testing
CREATE POLICY "Allow authenticated access" ON agent_stats FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON agent_performance FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON agent_achievements FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON achievements FOR ALL USING (true);
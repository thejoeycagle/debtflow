-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
    achievement_record RECORD;
BEGIN
    -- Check First Call achievement
    IF NEW.calls_taken = 1 THEN
        INSERT INTO agent_achievements (agent_id, achievement_id)
        SELECT NEW.agent_id, id FROM achievements WHERE name = 'First Call'
        ON CONFLICT DO NOTHING;
    END IF;

    -- Check Speed Demon achievement
    IF NEW.calls_taken >= 10 THEN
        INSERT INTO agent_achievements (agent_id, achievement_id)
        SELECT NEW.agent_id, id FROM achievements WHERE name = 'Speed Demon'
        ON CONFLICT DO NOTHING;
    END IF;

    -- Check Perfect Week achievement
    IF EXISTS (
        SELECT 1 FROM agent_performance
        WHERE agent_id = NEW.agent_id
        AND date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY agent_id
        HAVING COUNT(*) = 7 AND MIN(calls_handled) > 0
    ) THEN
        INSERT INTO agent_achievements (agent_id, achievement_id)
        SELECT NEW.agent_id, id FROM achievements WHERE name = 'Perfect Week'
        ON CONFLICT DO NOTHING;
    END IF;

    -- Check Streak Master achievement
    IF NEW.current_streak >= 30 THEN
        INSERT INTO agent_achievements (agent_id, achievement_id)
        SELECT NEW.agent_id, id FROM achievements WHERE name = 'Streak Master'
        ON CONFLICT DO NOTHING;
    END IF;

    -- Update total points
    SELECT SUM(a.points) INTO NEW.total_points
    FROM agent_achievements aa
    JOIN achievements a ON a.id = aa.achievement_id
    WHERE aa.agent_id = NEW.agent_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievement checks
CREATE TRIGGER check_achievements_trigger
    BEFORE UPDATE ON agent_stats
    FOR EACH ROW
    EXECUTE FUNCTION check_achievements();

-- Create function to update daily performance
CREATE OR REPLACE FUNCTION update_daily_performance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agent_performance (
        agent_id,
        date,
        calls_handled,
        payments_collected,
        accounts_resolved,
        points_earned
    )
    VALUES (
        NEW.agent_id,
        CURRENT_DATE,
        1,
        COALESCE(NEW.payment_amount, 0),
        CASE WHEN NEW.status = 'resolved' THEN 1 ELSE 0 END,
        CASE 
            WHEN NEW.status = 'resolved' THEN 50
            WHEN NEW.payment_amount > 0 THEN 25
            ELSE 10
        END
    )
    ON CONFLICT (agent_id, date) 
    DO UPDATE SET
        calls_handled = agent_performance.calls_handled + 1,
        payments_collected = agent_performance.payments_collected + COALESCE(NEW.payment_amount, 0),
        accounts_resolved = agent_performance.accounts_resolved + 
            CASE WHEN NEW.status = 'resolved' THEN 1 ELSE 0 END,
        points_earned = agent_performance.points_earned + 
            CASE 
                WHEN NEW.status = 'resolved' THEN 50
                WHEN NEW.payment_amount > 0 THEN 25
                ELSE 10
            END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity logs
CREATE TRIGGER update_daily_performance_trigger
    AFTER INSERT ON activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_performance();
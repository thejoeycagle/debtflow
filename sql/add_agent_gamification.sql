-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    points integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Create agent_achievements table for tracking earned achievements
CREATE TABLE IF NOT EXISTS public.agent_achievements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at timestamptz DEFAULT now(),
    UNIQUE(agent_id, achievement_id)
);

-- Create agent_performance table for tracking daily/weekly stats
CREATE TABLE IF NOT EXISTS public.agent_performance (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    date date NOT NULL DEFAULT CURRENT_DATE,
    calls_handled integer DEFAULT 0,
    payments_collected numeric DEFAULT 0,
    accounts_resolved integer DEFAULT 0,
    points_earned integer DEFAULT 0,
    streak_days integer DEFAULT 0,
    UNIQUE(agent_id, date)
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points) VALUES
('First Call', 'Handle your first call', 'phone', 10),
('Speed Demon', 'Handle 10 calls in one day', 'zap', 50),
('Money Maker', 'Collect $10,000 in payments', 'dollar-sign', 100),
('Problem Solver', 'Resolve 5 accounts in one day', 'check-circle', 75),
('Perfect Week', 'Maintain 100% response rate for a week', 'award', 200),
('Top Collector', 'Rank #1 in collections for a month', 'trophy', 500),
('Team Player', 'Help train a new agent', 'users', 150),
('Early Bird', 'First to log in for 5 consecutive days', 'sunrise', 100),
('Streak Master', 'Maintain a 30-day activity streak', 'flame', 300),
('Customer Whisperer', 'Resolve 10 difficult cases', 'heart', 250);

-- Add columns to agent_stats for gamification
ALTER TABLE agent_stats
ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_rank integer DEFAULT 999,
ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;
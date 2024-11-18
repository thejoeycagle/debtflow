import React from 'react';
import { Trophy, Flame, Award, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export default function AgentLeaderboard() {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['agent-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_stats')
        .select(`
          *,
          agent:profiles!agent_stats_agent_id_fkey (
            full_name
          )
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-medium">Top Performers</h3>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {leaderboard.map((agent, index) => (
          <div key={agent.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 flex items-center justify-center">
                {index === 0 ? (
                  <Trophy className="w-6 h-6 text-yellow-400" />
                ) : index === 1 ? (
                  <Award className="w-6 h-6 text-gray-400" />
                ) : index === 2 ? (
                  <Award className="w-6 h-6 text-amber-600" />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium">{agent.agent.full_name}</div>
                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                  <span>{agent.total_points} points</span>
                  {agent.current_streak > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <Flame className="w-3 h-3 text-orange-400 mr-1" />
                        {agent.current_streak} day streak
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {agent.badges?.length > 0 && (
              <div className="flex space-x-1">
                {agent.badges.map((badge: string, i: number) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"
                    title={badge}
                  >
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
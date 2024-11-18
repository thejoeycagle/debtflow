import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AgentAchievementsProps {
  agentId: string;
}

export default function AgentAchievements({ agentId }: AgentAchievementsProps) {
  const { data: achievements = [] } = useQuery({
    queryKey: ['agent-achievements', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('agent_id', agentId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No achievements yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {achievements.map((earned) => (
        <div
          key={earned.id}
          className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-4"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{earned.achievement.name}</h4>
            <p className="text-sm text-gray-400">{earned.achievement.description}</p>
            <div className="flex items-center space-x-2 mt-2 text-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{earned.achievement.points} points</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
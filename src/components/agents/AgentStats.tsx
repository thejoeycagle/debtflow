import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Flame, Target, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AgentStatsProps {
  agentId: string;
}

export default function AgentStats({ agentId }: AgentStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ['agent-stats', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_stats')
        .select('*')
        .eq('agent_id', agentId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: performance } = useQuery({
    queryKey: ['agent-performance', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_performance')
        .select('*')
        .eq('agent_id', agentId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
          <Trophy className="w-4 h-4" />
          <span>Total Points</span>
        </div>
        <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
          <Flame className="w-4 h-4" />
          <span>Current Streak</span>
        </div>
        <div className="text-2xl font-bold">{stats?.current_streak || 0} days</div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
          <Phone className="w-4 h-4" />
          <span>Today's Calls</span>
        </div>
        <div className="text-2xl font-bold">{performance?.calls_handled || 0}</div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
          <Target className="w-4 h-4" />
          <span>Today's Points</span>
        </div>
        <div className="text-2xl font-bold">{performance?.points_earned || 0}</div>
      </div>
    </div>
  );
}
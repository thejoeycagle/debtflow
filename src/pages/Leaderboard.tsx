import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Flame, DollarSign, Phone, Target, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Leaderboard() {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['leaderboard-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          agent_stats(
            total_points,
            current_streak,
            longest_streak,
            badges
          ),
          agent_performance(
            calls_handled,
            payments_collected,
            accounts_resolved,
            points_earned
          )
        `)
        .eq('role', 'collector')
        .order('agent_stats(total_points)', { ascending: false });

      if (error) throw error;

      // Ensure each agent has stats, even if zero
      return data.map(agent => ({
        ...agent,
        agent_stats: agent.agent_stats || {
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          badges: []
        },
        agent_performance: agent.agent_performance || {
          calls_handled: 0,
          payments_collected: 0,
          accounts_resolved: 0,
          points_earned: 0
        }
      }));
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center transform rotate-12">
            <Trophy className="w-6 h-6 text-yellow-900" />
          </div>
        );
      case 1:
        return (
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center transform rotate-12">
            <Medal className="w-6 h-6 text-gray-700" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center transform rotate-12">
            <Medal className="w-6 h-6 text-amber-900" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collection Leaderboard</h1>
          <p className="text-muted-foreground">Real-time agent performance and rankings</p>
        </div>
        <Trophy className="w-8 h-8 text-yellow-400" />
      </div>

      {/* Top 3 Collectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.slice(0, 3).map((agent, index) => (
          <div
            key={agent.id}
            className={`bg-card rounded-lg p-6 border border-border relative ${
              index === 0 ? 'md:transform md:-translate-y-4' : ''
            }`}
          >
            {getMedalIcon(index)}

            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">#{index + 1}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{agent.full_name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{agent.agent_stats.total_points} points</span>
                  {agent.agent_stats.current_streak > 0 && (
                    <>
                      <span>•</span>
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>{agent.agent_stats.current_streak} day streak</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Collections
                </div>
                <div className="text-lg font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(agent.agent_performance.payments_collected)}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Calls
                </div>
                <div className="text-lg font-semibold">
                  {agent.agent_performance.calls_handled}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Collectors */}
      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-medium">All Collectors</h2>
        </div>
        <div className="divide-y divide-border">
          {agents.slice(3).map((agent, index) => (
            <div key={agent.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 4}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{agent.full_name}</div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{agent.agent_stats.total_points} points</span>
                    {agent.agent_stats.current_streak > 0 && (
                      <>
                        <span>•</span>
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>{agent.agent_stats.current_streak} day streak</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Collections</div>
                  <div className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(agent.agent_performance.payments_collected)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Calls</div>
                  <div className="font-medium">
                    {agent.agent_performance.calls_handled}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Today's Points</div>
                  <div className="font-medium">
                    {agent.agent_performance.points_earned}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {agents.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No collectors found. Add some agents to start tracking performance!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
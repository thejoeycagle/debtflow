import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Phone, ArrowUp, ArrowDown, PhoneCall, PhoneMissed, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '../lib/auth-store';
import AgentLeaderboard from '../components/agents/AgentLeaderboard';

export default function Agents() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_integrations!inner(is_active),
          agent_stats!inner(
            calls_taken,
            calls_missed,
            calls_resolved
          )
        `)
        .eq('role', 'collector')
        .order('priority_rank', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ agentId, direction }: { agentId: string; direction: 'up' | 'down' }) => {
      const currentAgent = agents.find(a => a.id === agentId);
      if (!currentAgent) return;

      const currentIndex = agents.findIndex(a => a.id === agentId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= agents.length) return;

      const swapAgent = agents[newIndex];

      const updates = [
        { id: currentAgent.id, priority_rank: swapAgent.priority_rank },
        { id: swapAgent.id, priority_rank: currentAgent.priority_rank }
      ];

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Priority updated');
    }
  });

  if (!user?.id || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-destructive text-lg font-semibold">Unauthorized Access</div>
          <p className="text-muted-foreground">Only administrators can access agent management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Collection Agents</h1>
        <p className="text-muted-foreground">Manage your collection team members and call routing priority</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Call routing priority (top to bottom)
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border">
              {agents.map((agent, index) => (
                <div key={agent.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className={`w-5 h-5 ${agent.user_integrations?.is_active ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <div>
                      <div className="font-medium">{agent.full_name}</div>
                      <div className="text-sm text-muted-foreground">@{agent.username}</div>
                      {agent.phone_number && (
                        <div className="text-sm text-green-500">{agent.phone_number}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    {/* Agent Stats */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Calls Taken</div>
                        <div className="text-lg font-semibold">{agent.agent_stats?.calls_taken || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Calls Missed</div>
                        <div className="text-lg font-semibold">{agent.agent_stats?.calls_missed || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Close Rate</div>
                        <div className="text-lg font-semibold">
                          {agent.agent_stats?.calls_taken ? 
                            `${Math.round((agent.agent_stats.calls_resolved / agent.agent_stats.calls_taken) * 100)}%` 
                            : '0%'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Priority Controls */}
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => updatePriorityMutation.mutate({ agentId: agent.id, direction: 'up' })}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-50"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updatePriorityMutation.mutate({ agentId: agent.id, direction: 'down' })}
                        disabled={index === agents.length - 1}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-50"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard - Takes up 1 column */}
        <div>
          <AgentLeaderboard />
        </div>
      </div>
    </div>
  );
}
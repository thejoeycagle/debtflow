import React, { useState } from 'react';
import { Users, Phone, Trash2, Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import AgentDetailsModal from './AgentDetailsModal';

interface Agent {
  id: string;
  username: string;
  full_name: string;
  role: string;
  phone_number?: string;
}

interface AgentListProps {
  agents: Agent[];
  isLoading: boolean;
}

export default function AgentList({ agents, isLoading }: AgentListProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const queryClient = useQueryClient();

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Agent deleted successfully');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No agents found</p>
        <p className="text-sm text-muted-foreground">Use the quick add form above to create new agents</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div 
              className="flex items-center space-x-4 flex-1 cursor-pointer"
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{agent.full_name}</div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">@{agent.username}</span>
                  {agent.phone_number && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-green-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {agent.phone_number}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedAgent(agent)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md"
                title="View details"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this agent?')) {
                    deleteAgentMutation.mutate(agent.id);
                  }
                }}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md"
                title="Delete agent"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AgentDetailsModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </>
  );
}
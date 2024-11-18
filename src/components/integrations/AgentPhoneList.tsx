import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, PhoneMissed, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { acquirePhoneNumber } from '../../lib/twilio';
import { supabase } from '../../lib/supabase';

interface Agent {
  id: string;
  username: string;
  phone_number: string | null;
}

interface AgentPhoneListProps {
  agents: Agent[];
}

export default function AgentPhoneList({ agents }: AgentPhoneListProps) {
  const queryClient = useQueryClient();
  const [assigningAgent, setAssigningAgent] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const assignPhoneMutation = useMutation({
    mutationFn: async (agent: Agent) => {
      setAssigningAgent(agent.id);
      setError(null);
      try {
        // Get any available phone number
        const phoneNumber = await acquirePhoneNumber(agent.username);
        if (!phoneNumber) {
          throw new Error('Failed to acquire phone number');
        }

        // Update profile with phone number
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone_number: phoneNumber })
          .eq('id', agent.id);

        if (profileError) throw profileError;

        // Create user integration
        const { error: integrationError } = await supabase
          .from('user_integrations')
          .upsert([{
            user_id: agent.id,
            account_sid: 'ACa06f6ac15dcbab6cd11e272f4e774247',
            auth_token: '1df8cc892f0a9bed66a6d77b8f2dff48',
            phone_number: phoneNumber,
            is_active: true
          }]);

        if (integrationError) throw integrationError;

        return { agent, phoneNumber };
      } catch (error: any) {
        console.error('Phone assignment failed:', error);
        throw error;
      } finally {
        setAssigningAgent(null);
      }
    },
    onSuccess: ({ agent, phoneNumber }) => {
      queryClient.invalidateQueries(['agents']);
      toast.success(`Phone number ${phoneNumber} assigned to ${agent.username}`);
      setError(null);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to assign phone number';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  if (agents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No agents found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error Assigning Phone Number</p>
            <p className="text-sm mt-1">{error}</p>
            {error.includes('insufficient Twilio account balance') && (
              <p className="text-sm mt-2">
                Please add funds to your Twilio account to purchase phone numbers.
              </p>
            )}
          </div>
        </div>
      )}

      {agents.map((agent) => (
        <div key={agent.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{agent.username}</div>
              <div className="text-sm text-muted-foreground">
                {agent.phone_number ? (
                  <span className="text-green-500">{agent.phone_number}</span>
                ) : (
                  <span className="text-yellow-500">No phone number assigned</span>
                )}
              </div>
            </div>
          </div>

          {!agent.phone_number && (
            <button
              onClick={() => assignPhoneMutation.mutate(agent)}
              disabled={assigningAgent === agent.id}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {assigningAgent === agent.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <PhoneMissed className="w-4 h-4 mr-1.5" />
                  Assign Number
                </>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
import React, { useState } from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

function generateCredentials() {
  return {
    username: `agent_${Math.random().toString(36).substring(2, 8)}`,
    password: Math.random().toString(36).substring(2, 10) + 
              Math.random().toString(36).substring(2, 4).toUpperCase() + 
              '!@#'[Math.floor(Math.random() * 3)]
  };
}

export default function QuickActions() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: async () => {
      // Generate credentials
      const credentials = generateCredentials();

      // Create agent profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          username: credentials.username,
          full_name: credentials.username,
          role: 'collector',
          temp_password: credentials.password
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      return { credentials };
    },
    onSuccess: ({ credentials }) => {
      queryClient.invalidateQueries(['agents']);
      const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Agent created successfully');
      setTimeout(() => setCopiedText(null), 3000);
    },
    onError: (error: any) => {
      console.error('Failed to create agent:', error);
      toast.error(error.message || 'Failed to create agent');
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-card rounded-lg p-6 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Quick Add Agent</h3>
          </div>
          <button
            onClick={() => createAgentMutation.mutate()}
            disabled={createAgentMutation.isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {createAgentMutation.isLoading ? 'Creating...' : 'Create & Copy'}
          </button>
        </div>

        {copiedText && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Credentials Copied!</span>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <button
                  onClick={() => navigator.clipboard.writeText(copiedText)}
                  className="p-1 hover:text-primary"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {copiedText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { UserPlus, Copy, Check, X, Phone, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { acquirePhoneNumber } from '../../lib/twilio';
import { toast } from 'sonner';

function generateCredentials() {
  const username = `agent_${Math.random().toString(36).substring(2, 8)}`;
  const password = Math.random().toString(36).substring(2, 10) + 
                  Math.random().toString(36).substring(2, 4).toUpperCase() + 
                  '!@#'[Math.floor(Math.random() * 3)];
  return { username, password };
}

export default function QuickAddAgent() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isAssigningPhone, setIsAssigningPhone] = useState(false);
  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: async () => {
      if (!fullName.trim()) {
        throw new Error('Please enter agent name');
      }

      const credentials = generateCredentials();

      // Create agent profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          username: credentials.username,
          full_name: fullName,
          role: 'collector',
          temp_password: credentials.password
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Acquire phone number
      setIsAssigningPhone(true);
      try {
        const phoneNumber = await acquirePhoneNumber(credentials.username);
        
        if (phoneNumber) {
          // Update profile with phone number
          await supabase
            .from('profiles')
            .update({ phone_number: phoneNumber })
            .eq('id', profile.id);

          // Create user integration
          const { error: integrationError } = await supabase
            .from('user_integrations')
            .insert([{
              user_id: profile.id,
              account_sid: 'ACa06f6ac15dcbab6cd11e272f4e774247',
              auth_token: '1df8cc892f0a9bed66a6d77b8f2dff48',
              phone_number: phoneNumber,
              is_active: true
            }]);

          if (integrationError) {
            console.error('Failed to create integration:', integrationError);
            // Don't throw, just log the error
          }

          return { credentials, fullName, phoneNumber, profile };
        }
      } catch (error) {
        console.error('Failed to acquire phone number:', error);
        // Continue without phone number, but notify user
        toast.error('Failed to assign phone number. You can try again later.');
      } finally {
        setIsAssigningPhone(false);
      }

      return { credentials, fullName, profile };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['agents']);
      const text = `Agent: ${data.fullName}\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}${data.phoneNumber ? `\nPhone: ${data.phoneNumber}` : ''}`;
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Agent created successfully');
      setFullName('');
      setIsFormOpen(false);
      setTimeout(() => setCopiedText(null), 30000);
    },
    onError: (error: any) => {
      console.error('Failed to create agent:', error);
      toast.error(error.message || 'Failed to create agent');
    }
  });

  const isLoading = createAgentMutation.isLoading || isAssigningPhone;

  return (
    <div className="bg-card rounded-lg p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <UserPlus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Quick Add Agent</h3>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
          >
            Add New Agent
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground mb-1">
              Agent Full Name
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter agent's full name"
              />
              <button
                onClick={() => createAgentMutation.mutate()}
                disabled={isLoading || !fullName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm inline-flex items-center"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isAssigningPhone ? 'Assigning Phone...' : isLoading ? 'Creating...' : 'Create & Copy'}
              </button>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setFullName('');
                }}
                className="p-2 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
      )}
    </div>
  );
}
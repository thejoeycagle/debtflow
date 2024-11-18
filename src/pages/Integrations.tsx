import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, TestTube, Users, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth-store';
import AgentPhoneList from '../components/integrations/AgentPhoneList';

interface TwilioConfig {
  account_sid: string;
  auth_token: string;
  twiml_app_sid: string;
}

const TWILIO_DEFAULTS = {
  account_sid: 'ACa06f6ac15dcbab6cd11e272f4e774247',
  auth_token: '1df8cc892f0a9bed66a6d77b8f2dff48',
  twiml_app_sid: 'AP936b25312c4d651739880d6bf0df7044'
};

export default function Integrations() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isTesting, setIsTesting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Fetch current config
  const { data: config, isLoading } = useQuery({
    queryKey: ['twilio-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('account_sid, auth_token, twiml_app_sid')
        .single();

      if (error) throw error;
      return data || TWILIO_DEFAULTS;
    }
  });

  // Fetch agents
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, phone_number')
        .eq('role', 'collector');

      if (error) throw error;
      return data;
    }
  });

  // Save config mutation
  const saveMutation = useMutation({
    mutationFn: async (config: TwilioConfig) => {
      const { error } = await supabase
        .from('admin_settings')
        .upsert([{
          id: '00000000-0000-0000-0000-000000000000',
          ...config
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['twilio-config']);
      toast.success('Configuration saved');
      setShowConfig(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save configuration');
    }
  });

  // Test connection
  const testConnection = async () => {
    if (!config) return;

    setIsTesting(true);
    try {
      const credentials = btoa(`${config.account_sid}:${config.auth_token}`);
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.account_sid}.json`,
        {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      if (response.ok) {
        toast.success('Twilio connection successful');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      toast.error('Connection failed: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  if (!user?.id || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-destructive text-lg font-semibold">Unauthorized Access</div>
          <p className="text-muted-foreground">Only administrators can access integrations</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground">Manage your phone and communication tools</p>
        </div>
        <Phone className="w-8 h-8 text-muted-foreground" />
      </div>

      {/* Twilio Configuration */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Phone className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium">Twilio Configuration</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={testConnection}
              disabled={isTesting}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Account SID</label>
            <div className="mt-1 font-mono text-sm bg-muted/50 p-2 rounded">
              {config?.account_sid}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Auth Token</label>
            <div className="mt-1 font-mono text-sm bg-muted/50 p-2 rounded">
              {config?.auth_token}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">TwiML App SID</label>
            <div className="mt-1 font-mono text-sm bg-muted/50 p-2 rounded">
              {config?.twiml_app_sid}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Phone Numbers */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium">Agent Phone Numbers</h3>
          </div>
        </div>

        <AgentPhoneList agents={agents} />
      </div>
    </div>
  );
}
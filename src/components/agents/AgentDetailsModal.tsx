import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Phone, Settings, Mic, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Switch } from '../ui/Switch';
import { acquirePhoneNumber } from '../../lib/twilio';

interface Agent {
  id: string;
  username: string;
  full_name: string;
  role: string;
  phone_number?: string;
}

interface AgentDetailsModalProps {
  agent: Agent | null;
  onClose: () => void;
}

interface VoiceSettings {
  voice_enabled: boolean;
  auto_answer: boolean;
  ringtone_enabled: boolean;
  microphone_enabled: boolean;
  speaker_enabled: boolean;
  call_timeout: number;
}

export default function AgentDetailsModal({ agent, onClose }: AgentDetailsModalProps) {
  const queryClient = useQueryClient();

  const { data: integration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: ['agent-integration', agent?.id],
    queryFn: async () => {
      if (!agent?.id) return null;

      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', agent.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!agent?.id
  });

  const assignPhoneMutation = useMutation({
    mutationFn: async () => {
      if (!agent?.id) throw new Error('No agent selected');

      const phoneNumber = await acquirePhoneNumber(agent.username);
      if (!phoneNumber) throw new Error('Failed to acquire phone number');

      // Update profile with phone number
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber })
        .eq('id', agent.id);

      if (profileError) throw profileError;

      // Create user integration
      const { error: integrationError } = await supabase
        .from('user_integrations')
        .insert([{
          user_id: agent.id,
          account_sid: 'ACa06f6ac15dcbab6cd11e272f4e774247',
          auth_token: '1df8cc892f0a9bed66a6d77b8f2dff48',
          phone_number: phoneNumber,
          is_active: false
        }]);

      if (integrationError) throw integrationError;

      return phoneNumber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      queryClient.invalidateQueries(['agent-integration', agent?.id]);
      toast.success('Phone number assigned successfully');
    }
  });

  const updateVoiceSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<VoiceSettings>) => {
      if (!agent?.id) throw new Error('No agent selected');

      const { error } = await supabase
        .from('user_integrations')
        .update(settings)
        .eq('user_id', agent.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-integration', agent?.id]);
      toast.success('Voice settings updated');
    }
  });

  if (!agent) return null;

  const hasPhoneNumber = !!agent.phone_number;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card shadow-lg border-l border-border">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold">{agent.full_name}</h2>
              <p className="text-sm text-muted-foreground">@{agent.username}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Phone Integration */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone Integration
              </h3>

              {isLoadingIntegration ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : !hasPhoneNumber ? (
                <div className="bg-card rounded-lg p-4 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">No phone number assigned</p>
                  <button
                    onClick={() => assignPhoneMutation.mutate()}
                    disabled={assignPhoneMutation.isLoading}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
                  >
                    {assignPhoneMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Assign Phone Number
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-card rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <p className="text-sm text-green-500">{agent.phone_number}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${integration?.is_active ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Device ID</label>
                    <p className="text-sm text-muted-foreground">{integration?.device_id || 'Not set'}</p>
                  </div>

                  {integration?.last_error && (
                    <div className="bg-destructive/10 text-destructive rounded-md p-2 text-sm">
                      {integration.last_error}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Voice Settings */}
            {hasPhoneNumber && (
              <section className="space-y-4">
                <h3 className="text-sm font-medium flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Voice Settings
                </h3>

                <div className="bg-card rounded-lg p-4 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Voice Enabled</label>
                        <p className="text-xs text-muted-foreground">Allow agent to make/receive calls</p>
                      </div>
                      <Switch
                        checked={integration?.voice_enabled ?? true}
                        onCheckedChange={(checked) => 
                          updateVoiceSettingsMutation.mutate({ voice_enabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Auto Answer</label>
                        <p className="text-xs text-muted-foreground">Automatically answer incoming calls</p>
                      </div>
                      <Switch
                        checked={integration?.auto_answer ?? false}
                        onCheckedChange={(checked) =>
                          updateVoiceSettingsMutation.mutate({ auto_answer: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Ringtone</label>
                        <p className="text-xs text-muted-foreground">Play sound for incoming calls</p>
                      </div>
                      <Switch
                        checked={integration?.ringtone_enabled ?? true}
                        onCheckedChange={(checked) =>
                          updateVoiceSettingsMutation.mutate({ ringtone_enabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Call Timeout</label>
                        <p className="text-xs text-muted-foreground">Seconds to ring before voicemail</p>
                      </div>
                      <select
                        value={integration?.call_timeout ?? 30}
                        onChange={(e) =>
                          updateVoiceSettingsMutation.mutate({ 
                            call_timeout: parseInt(e.target.value) 
                          })
                        }
                        className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        <option value="15">15s</option>
                        <option value="30">30s</option>
                        <option value="45">45s</option>
                        <option value="60">60s</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Audio Devices</label>
                        <p className="text-xs text-muted-foreground">Microphone and speaker settings</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => 
                            updateVoiceSettingsMutation.mutate({
                              microphone_enabled: !integration?.microphone_enabled
                            })
                          }
                          className={`p-2 rounded-md ${
                            integration?.microphone_enabled 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateVoiceSettingsMutation.mutate({
                              speaker_enabled: !integration?.speaker_enabled
                            })
                          }
                          className={`p-2 rounded-md ${
                            integration?.speaker_enabled
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
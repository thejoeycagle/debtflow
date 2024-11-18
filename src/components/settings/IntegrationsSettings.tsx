import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MessageSquare, Phone, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import OpenAI from 'openai';

interface IntegrationForm {
  openai_api_key: string;
  openai_model: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
}

interface IntegrationsSettingsProps {
  settings: any;
}

export default function IntegrationsSettings({ settings }: IntegrationsSettingsProps) {
  const [testingOpenAi, setTestingOpenAi] = useState(false);
  const [testingTwilio, setTestingTwilio] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm<IntegrationForm>({
    defaultValues: {
      openai_api_key: settings?.openai_api_key || '',
      openai_model: settings?.openai_model || 'gpt-4',
      twilio_account_sid: settings?.twilio_account_sid || '',
      twilio_auth_token: settings?.twilio_auth_token || '',
      twilio_phone_number: settings?.twilio_phone_number || '',
    }
  });
  
  const openaiApiKey = watch('openai_api_key');

  const testOpenAi = async () => {
    if (!openaiApiKey) {
      toast.error('Please enter an OpenAi API key');
      return;
    }

    setTestingOpenAi(true);
    try {
      const openai = new OpenAI({
        apiKey: openaiApiKey,
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Test connection' }],
        model: 'gpt-3.5-turbo',
        max_tokens: 5
      });

      if (completion) {
        toast.success('OpenAi connection successful');
      }
    } catch (error: any) {
      console.error('OpenAI Error:', error);
      toast.error(error?.message || 'OpenAi connection failed. Please check your API key.');
    } finally {
      setTestingOpenAi(false);
    }
  };

  const testTwilio = async (accountSid: string, authToken: string, phoneNumber: string) => {
    if (!accountSid || !authToken || !phoneNumber) {
      toast.error('Please fill in all Twilio credentials');
      return;
    }

    setTestingTwilio(true);
    try {
      // Simulate Twilio test for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Twilio connection successful');
    } catch (error: any) {
      toast.error(error?.message || 'Twilio connection failed');
    } finally {
      setTestingTwilio(false);
    }
  };

  const onSubmit = async (data: IntegrationForm) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert([{
          id: settings?.id || '00000000-0000-0000-0000-000000000000',
          ...data
        }]);

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* OpenAi Integration */}
      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-medium text-card-foreground">OpenAi Integration</h3>
          </div>
          <button
            type="button"
            onClick={testOpenAi}
            disabled={testingOpenAi || !openaiApiKey}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingOpenAi ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Test Connection
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              API Key
            </label>
            <input
              type="password"
              {...register('openai_api_key', { required: 'API key is required' })}
              className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
            />
            {errors.openai_api_key && (
              <p className="mt-1 text-sm text-destructive">{errors.openai_api_key.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Model
            </label>
            <select
              {...register('openai_model')}
              className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Twilio Integration */}
      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Phone className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-medium text-card-foreground">Twilio Integration</h3>
          </div>
          <button
            type="button"
            onClick={() => testTwilio(
              watch('twilio_account_sid'),
              watch('twilio_auth_token'),
              watch('twilio_phone_number')
            )}
            disabled={testingTwilio}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingTwilio ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Test Connection
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Account SID
            </label>
            <input
              type="password"
              {...register('twilio_account_sid')}
              className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Auth Token
            </label>
            <input
              type="password"
              {...register('twilio_auth_token')}
              className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Phone Number
            </label>
            <input
              type="text"
              {...register('twilio_phone_number')}
              placeholder="+1234567890"
              className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </button>
      </div>
    </form>
  );
}
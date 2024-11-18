import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();

  const { isLoading, error, data } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const { data: settings, error: settingsError } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (settingsError) throw settingsError;
      return settings;
    },
    retry: false
  });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    if (error.message === 'Unauthorized') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-destructive text-lg font-semibold">Unauthorized Access</div>
          <p className="text-muted-foreground">Only administrators can access settings</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-destructive text-lg font-semibold">Failed to load settings</div>
        <p className="text-muted-foreground">Please try again later or contact support</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your application settings
          </p>
        </div>
        <SettingsIcon className="w-8 h-8 text-muted-foreground" />
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <p className="text-sm text-muted-foreground">
              General settings coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Notification settings coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <p className="text-sm text-muted-foreground">
              Security settings coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
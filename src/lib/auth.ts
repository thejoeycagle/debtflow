import { supabase } from './supabase';

export async function signInUser(username: string, password: string) {
  try {
    // First check profiles table for credentials
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('temp_password', password)
      .single();

    if (profileError || !profile) {
      console.error('Profile lookup error:', profileError);
      throw new Error('Invalid username or password');
    }

    // Always ensure collector has integration record
    if (profile.role === 'collector') {
      const { error: integrationError } = await supabase
        .from('user_integrations')
        .upsert([{
          user_id: profile.id,
          account_sid: 'ACa06f6ac15dcbab6cd11e272f4e774247',
          auth_token: '1df8cc892f0a9bed66a6d77b8f2dff48',
          phone_number: profile.phone_number,
          voice_enabled: true,
          is_active: false
        }], {
          onConflict: 'user_id'
        });

      if (integrationError) {
        console.error('Failed to ensure integration:', integrationError);
      }
    }

    return {
      id: profile.id,
      username: profile.username,
      full_name: profile.full_name,
      role: profile.role,
      phone_number: profile.phone_number
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
}
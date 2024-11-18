// @ts-check
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://upxxcnnmodkuskktueiz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweHhjbm5tb2RrdXNra3R1ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTU1MzEsImV4cCI6MjA0NzMzMTUzMX0.zr7ttrB4VJZdcBW8Y5F9zGIBNAdfuiyDvqbRqci2mA0'
);

async function main() {
  try {
    // First, create the admin user through auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@debtflow.ai',
      password: 'admin123!',
      options: {
        data: {
          full_name: 'Admin User',
          role: 'admin'
        }
      }
    });

    if (authError && authError.message !== 'User already registered') {
      throw authError;
    }

    // Get the user ID either from the new signup or existing user
    let userId;
    if (authData?.user) {
      userId = authData.user.id;
    } else {
      // If user exists, get their ID
      const { data: existingAuth } = await supabase.auth.signInWithPassword({
        email: 'admin@debtflow.ai',
        password: 'admin123!'
      });
      userId = existingAuth?.user?.id;
    }

    if (!userId) {
      throw new Error('Could not get user ID');
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: userId,
            email: 'admin@debtflow.ai',
            full_name: 'Admin User',
            role: 'admin'
          }
        ]);

      if (profileError) {
        throw profileError;
      }
      console.log('Admin profile created successfully');
    } else {
      // Update existing profile to ensure role is admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
      console.log('Admin profile updated successfully');
    }

    // Create default admin settings if they don't exist
    const { error: settingsError } = await supabase
      .from('admin_settings')
      .upsert([
        {
          id: '00000000-0000-0000-0000-000000000000',
          openai_model: 'gpt-4'
        }
      ]);

    if (settingsError) {
      throw settingsError;
    }

    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

main();
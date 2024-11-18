import { supabase } from './supabase';

export async function setupAdmin() {
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

    // Create or update admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([{
        id: userId,
        email: 'admin@debtflow.ai',
        full_name: 'Admin User',
        role: 'admin'
      }]);

    if (profileError) {
      throw profileError;
    }

    console.log('Admin setup completed successfully');
  } catch (error: any) {
    console.error('Admin setup failed:', error.message);
  }
}
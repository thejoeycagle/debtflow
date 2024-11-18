import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function createTwilioToken(accountSid: string, authToken: string, userId: string) {
  try {
    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      jti: crypto.randomUUID(),
      iss: accountSid,
      sub: accountSid,
      exp: now + 3600,
      grants: {
        identity: userId,
        voice: {
          outgoing: {
            application_sid: 'AP936b25312c4d651739880d6bf0df7044'
          },
          incoming: {
            allow: true
          }
        }
      }
    };

    // Create JWT header
    const header = {
      alg: "HS256",
      typ: "JWT",
      cty: "twilio-fpa;v=1"
    };

    // Create JWT
    const token = await create(header, payload, authToken);
    return token;
  } catch (error) {
    console.error('Token creation error:', error);
    throw new Error(`Failed to create token: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      throw new Error('No user ID provided');
    }

    console.log('Processing token request for user:', userId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Fetching user integration settings...');

    const { data: integration, error: integrationError } = await supabaseClient
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!integration || integrationError) {
      console.error('Failed to fetch integration settings:', integrationError);
      throw new Error(`Failed to fetch integration settings: ${integrationError?.message || 'No integration found'}`);
    }

    if (!integration.account_sid || !integration.auth_token) {
      throw new Error('Missing required fields: account_sid or auth_token');
    }

    console.log('Integration found:', {
      accountSid: integration.account_sid,
      hasAuthToken: !!integration.auth_token,
      phoneNumber: integration.phone_number,
    });

    const token = await createTwilioToken(
      integration.account_sid,
      integration.auth_token,
      userId
    );

    if (!token) {
      throw new Error('Failed to generate token');
    }

    console.log('Token generated successfully');

    await supabaseClient
      .from('user_integrations')
      .update({ 
        last_connected_at: new Date().toISOString(),
        last_error: null,
        is_active: true
      })
      .eq('user_id', userId);

    return new Response(
      JSON.stringify({ token }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Token generation failed:', error);

    try {
      const { userId } = await req.json();
      if (userId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        await supabaseClient
          .from('user_integrations')
          .update({ 
            last_error: error.message,
            last_connected_at: new Date().toISOString(),
            is_active: false
          })
          .eq('user_id', userId);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check Edge Function logs for more details'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
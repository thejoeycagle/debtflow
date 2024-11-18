import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import twilio from 'https://esm.sh/twilio@4.22.0';

const ACCOUNT_SID = 'ACa06f6ac15dcbab6cd11e272f4e774247';
const AUTH_TOKEN = '1df8cc892f0a9bed66a6d77b8f2dff48';
const TWIML_APP_SID = 'AP936b25312c4d651739880d6bf0df7044';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid token');
    }

    // Create Twilio capability token
    const capability = new twilio.jwt.ClientCapability({
      accountSid: ACCOUNT_SID,
      authToken: AUTH_TOKEN,
    });

    // Allow incoming calls
    capability.addScope(
      new twilio.jwt.ClientCapability.IncomingClientScope(user.id)
    );

    // Allow outgoing calls
    capability.addScope(
      new twilio.jwt.ClientCapability.OutgoingClientScope({
        applicationSid: TWIML_APP_SID,
        clientName: user.id,
      })
    );

    // Generate token
    const token = capability.toJwt();

    return new Response(
      JSON.stringify({ token }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const eventType = formData.get('EventType');
    const from = formData.get('From');
    const to = formData.get('To');
    const callSid = formData.get('CallSid');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Handle different event types
    switch (eventType) {
      case 'voicemail-recorded': {
        const recordingUrl = formData.get('RecordingUrl');
        const duration = parseInt(formData.get('RecordingDuration') || '0', 10);
        const transcription = formData.get('TranscriptionText');

        // Get user ID from phone number
        const { data: user } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('phone_number', to)
          .single();

        if (user) {
          // Store voicemail in database
          await supabaseClient.from('voicemails').insert({
            user_id: user.id,
            from_number: from,
            duration,
            recording_url: recordingUrl,
            transcription,
            is_new: true,
          });
        }
        break;
      }

      case 'initiated': {
        // Find available agents ordered by priority
        const { data: availableAgents, error: agentError } = await supabaseClient
          .from('profiles')
          .select(`
            id,
            user_integrations!inner(is_active, voice_enabled)
          `)
          .eq('role', 'collector')
          .eq('user_integrations.is_active', true)
          .eq('user_integrations.voice_enabled', true)
          .order('priority_rank', { ascending: true })
          .limit(1);

        if (agentError) {
          console.error('Error finding available agents:', agentError);
          throw agentError;
        }

        let twimlResponse;

        if (availableAgents && availableAgents.length > 0) {
          // Route to highest priority available agent
          twimlResponse = `
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
              <Dial timeout="30">
                <Client>${availableAgents[0].id}</Client>
              </Dial>
              <Redirect method="POST">/twilio-webhook-voicemail</Redirect>
            </Response>`;

          // Log the call routing
          await supabaseClient
            .from('activity_logs')
            .insert({
              action: 'call_routed',
              details: {
                from_number: from,
                to_agent: availableAgents[0].id,
                call_sid: callSid
              }
            });
        } else {
          // No available agents, go straight to voicemail
          twimlResponse = `
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
              <Redirect method="POST">/twilio-webhook-voicemail</Redirect>
            </Response>`;

          // Log that no agents were available
          await supabaseClient
            .from('activity_logs')
            .insert({
              action: 'call_to_voicemail',
              details: {
                from_number: from,
                reason: 'no_available_agents',
                call_sid: callSid
              }
            });
        }

        return new Response(twimlResponse, {
          headers: {
            'Content-Type': 'text/xml',
          },
        });
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
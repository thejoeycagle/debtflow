import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Generate TwiML response as XML for voicemail recording
  const twimlResponse = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Please leave a message after the tone. Press any key when finished.</Say>
      <Record 
        action="/twilio-webhook" 
        transcribe="true" 
        transcribeCallback="/twilio-webhook" 
        maxLength="300" 
        timeout="10" 
        finishOnKey="1234567890*#"
      />
    </Response>`;

  return new Response(twimlResponse, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
});
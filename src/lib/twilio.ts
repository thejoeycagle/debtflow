import { supabase } from './supabase';

// Hardcoded Twilio credentials for simplicity
const TWILIO_CONFIG = {
  account_sid: 'ACa06f6ac15dcbab6cd11e272f4e774247',
  auth_token: '1df8cc892f0a9bed66a6d77b8f2dff48'
};

export async function acquirePhoneNumber(agentName: string) {
  try {
    // Get agent profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', agentName)
      .single();

    if (profileError || !profile) {
      throw new Error('Agent profile not found');
    }

    // Create basic auth header
    const credentials = window.btoa(`${TWILIO_CONFIG.account_sid}:${TWILIO_CONFIG.auth_token}`);

    // Search for any available number
    const searchResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.account_sid}/AvailablePhoneNumbers/US/Local.json?Limit=1`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      throw new Error(error.message || 'Failed to search for numbers');
    }

    const searchData = await searchResponse.json();
    if (!searchData.available_phone_numbers?.[0]?.phone_number) {
      throw new Error('No available phone numbers found');
    }

    const phoneNumber = searchData.available_phone_numbers[0].phone_number;

    // Purchase the number
    const purchaseResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.account_sid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          PhoneNumber: phoneNumber,
          FriendlyName: `Agent - ${agentName}`
        })
      }
    );

    if (!purchaseResponse.ok) {
      const error = await purchaseResponse.json();
      throw new Error(error.message || 'Failed to purchase number');
    }

    const purchaseData = await purchaseResponse.json();

    // Create user integration record
    const { error: integrationError } = await supabase
      .from('user_integrations')
      .upsert([{
        user_id: profile.id,
        account_sid: TWILIO_CONFIG.account_sid,
        auth_token: TWILIO_CONFIG.auth_token,
        phone_number: purchaseData.phone_number
      }]);

    if (integrationError) {
      console.error('Failed to create integration record:', integrationError);
    }

    // Update profile with phone number
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ phone_number: purchaseData.phone_number })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
    }

    return purchaseData.phone_number;

  } catch (error: any) {
    console.error('Phone number acquisition failed:', error);
    throw error;
  }
}
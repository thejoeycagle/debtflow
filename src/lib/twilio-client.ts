import { Device } from '@twilio/voice-sdk';
import { supabase } from './supabase';

let device: Device | null = null;

export async function initializeTwilioDevice(userId: string) {
  try {
    // First check if browser supports required features
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Your browser does not support voice calls');
    }

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error('Microphone permission error:', err);
      throw new Error('Microphone access denied. Please allow microphone access to make calls.');
    }

    // Get capability token from Supabase Edge Function
    const { data: tokenResponse, error: tokenError } = await supabase.functions.invoke('get-twilio-token', {
      body: { userId }
    });

    if (tokenError || !tokenResponse?.token) {
      console.error('Token error:', tokenError || 'No token received');
      throw new Error('Failed to get Twilio access token');
    }

    // Destroy existing device if any
    destroyDevice();

    // Initialize new device with token
    device = new Device(tokenResponse.token, {
      codecPreferences: ['opus', 'pcmu'],
      enableRingingState: true,
      closeProtection: true
    });

    // Wait for device to be ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Device initialization timed out'));
      }, 10000);

      if (!device) {
        clearTimeout(timeout);
        reject(new Error('Device creation failed'));
        return;
      }

      device.on('ready', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      device.on('error', (err) => {
        clearTimeout(timeout);
        console.error('Device error:', err);
        reject(new Error(err.message || 'Device initialization failed'));
      });
    });

    // Update integration status
    const { error: updateError } = await supabase
      .from('user_integrations')
      .update({
        is_active: true,
        last_connected_at: new Date().toISOString(),
        last_error: null,
        device_id: device.name || userId
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update integration status:', updateError);
    }

    return device;

  } catch (error: any) {
    destroyDevice();
    const errorMessage = error.message || 'Unknown initialization error';
    console.error('Twilio device initialization error:', {
      message: errorMessage,
      originalError: error,
      userId
    });

    // Store error in database
    try {
      await supabase
        .from('user_integrations')
        .update({
          is_active: false,
          last_error: errorMessage,
          last_connected_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (err) {
      console.error('Failed to store error:', err);
    }

    throw error;
  }
}

export function getDevice() {
  return device;
}

export function destroyDevice() {
  if (device) {
    try {
      device.destroy();
    } catch (error) {
      console.error('Error destroying device:', error);
    }
    device = null;
  }
}
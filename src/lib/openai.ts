import OpenAI from 'openai';
import { supabase } from './supabase';

let openaiInstance: OpenAI | null = null;

export async function getOpenAIInstance() {
  if (!openaiInstance) {
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('openai_api_key')
      .single();

    if (!settings?.openai_api_key) {
      throw new Error('OpenAI API key not configured');
    }

    openaiInstance = new OpenAI({
      apiKey: settings.openai_api_key,
      dangerouslyAllowBrowser: true // Only for development
    });
  }

  return openaiInstance;
}
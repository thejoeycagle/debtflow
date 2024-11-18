import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface AiInsight {
  type: 'productivity' | 'revenue' | 'coaching';
  message: string;
}

export default function WelcomeBanner() {
  const { user } = useAuthStore();
  const [currentInsight, setCurrentInsight] = useState(0);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('openai_api_key')
        .single();

      if (!settings?.openai_api_key) {
        return [
          {
            type: 'productivity',
            message: 'Configure OpenAi API key in settings to receive personalized Ai insights.'
          }
        ];
      }

      // Simulated Ai insights for now
      return [
        {
          type: 'productivity',
          message: 'Focus on high-priority accounts during peak response hours (10 AM - 2 PM).'
        },
        {
          type: 'revenue',
          message: 'Your collection rate is 15% above average. Consider increasing targets by 10%.'
        },
        {
          type: 'coaching',
          message: 'Try the "3-touch" approach: email, call, then personalized letter for best results.'
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (insights && insights.length > 1) {
      const timer = setInterval(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [insights]);

  const insight = insights?.[currentInsight];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.full_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's your Ai-powered insights for today
          </p>
        </div>
        <Brain className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading Ai insights...</span>
          </div>
        ) : insight ? (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Insight
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {insights && insights.length > 1 && (
          <div className="mt-4 flex justify-center space-x-2">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentInsight(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  currentInsight === index
                    ? 'bg-indigo-500 dark:bg-indigo-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`View insight ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
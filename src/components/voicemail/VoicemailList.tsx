import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Play, Trash2, Download, VoicemailIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Voicemail {
  id: string;
  from_number: string;
  duration: number;
  recording_url: string;
  transcription: string | null;
  created_at: string;
  is_new: boolean;
}

export default function VoicemailList() {
  const queryClient = useQueryClient();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState<string | null>(null);

  const { data: voicemails = [], isLoading } = useQuery({
    queryKey: ['voicemails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voicemails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Voicemail[];
    }
  });

  const deleteVoicemailMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voicemails')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['voicemails']);
      toast.success('Voicemail deleted');
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voicemails')
        .update({ is_new: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['voicemails']);
    }
  });

  const handlePlay = (voicemail: Voicemail) => {
    if (audioRef.current) {
      if (playing === voicemail.id) {
        audioRef.current.pause();
        setPlaying(null);
      } else {
        audioRef.current.src = voicemail.recording_url;
        audioRef.current.play();
        setPlaying(voicemail.id);
        if (voicemail.is_new) {
          markAsReadMutation.mutate(voicemail.id);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (voicemails.length === 0) {
    return (
      <div className="text-center py-12">
        <VoicemailIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No voicemails found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />

      {voicemails.map((voicemail) => (
        <div
          key={voicemail.id}
          className={`bg-card rounded-lg p-4 ${
            voicemail.is_new ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{voicemail.from_number}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(voicemail.created_at), 'MMM d, yyyy h:mm a')}
                {' · '}
                {Math.round(voicemail.duration)}s
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePlay(voicemail)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <Play className={`w-5 h-5 ${playing === voicemail.id ? 'text-primary' : ''}`} />
              </button>
              <a
                href={voicemail.recording_url}
                download
                className="p-2 hover:bg-muted rounded-full"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this voicemail?')) {
                    deleteVoicemailMutation.mutate(voicemail.id);
                  }
                }}
                className="p-2 hover:bg-muted rounded-full text-destructive"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          {voicemail.transcription && (
            <div className="mt-2 text-sm text-muted-foreground">
              {voicemail.transcription}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
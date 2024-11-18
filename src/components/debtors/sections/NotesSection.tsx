import React, { useState } from 'react';
import { FileText, Plus, Send, Loader2, Pin } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Note {
  id: string;
  debtor_id: string;
  content: string;
  created_at: string;
  created_by: string;
  pinned: boolean;
  creator?: {
    full_name: string;
  };
}

interface NotesSectionProps {
  debtor: any;
}

export default function NotesSection({ debtor }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['debtor-notes', debtor.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select(`
            id,
            content,
            created_at,
            created_by,
            pinned,
            creator:profiles!notes_created_by_fkey (
              full_name
            )
          `)
          .eq('debtor_id', debtor.id)
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Note[];
      } catch (err) {
        console.error('Error fetching notes:', err);
        throw err;
      }
    },
    retry: 1
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notes')
        .insert([{
          debtor_id: debtor.id,
          content,
          created_by: userData.user.id,
          pinned: false
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['debtor-notes', debtor.id]);
      setNewNote('');
      setIsAdding(false);
      toast.success('Note added successfully');
    },
    onError: (error: any) => {
      console.error('Failed to add note:', error);
      toast.error(error.message || 'Failed to add note');
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('notes')
        .update({ pinned })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['debtor-notes', debtor.id]);
    },
    onError: (error: any) => {
      toast.error('Failed to update note');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addNoteMutation.mutate(newNote.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (error) {
    return (
      <section className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-800/50">
        <div className="text-center text-red-400 py-4">
          Failed to load notes. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-800/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-semibold">Notes</h2>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 rounded-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Note
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800/50 rounded-lg p-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your note..."
              className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 resize-none"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addNoteMutation.isLoading || !newNote.trim()}
                className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                {addNoteMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Add Note
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No notes added yet</div>
        ) : (
          <div 
            className="space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2" 
            style={{ 
              maxHeight: 'calc(100vh - 400px)',
              minHeight: '300px',
              scrollBehavior: 'smooth'
            }}
          >
            {notes.map((note) => (
              <div 
                key={note.id} 
                className={`bg-gray-800/50 rounded-lg p-4 space-y-2 relative ${
                  note.pinned ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>{note.creator?.full_name || 'Unknown User'}</span>
                    <button
                      onClick={() => togglePinMutation.mutate({ 
                        id: note.id, 
                        pinned: !note.pinned 
                      })}
                      className={`p-1 rounded-full hover:bg-gray-700 ${
                        note.pinned ? 'text-indigo-400' : 'text-gray-500'
                      }`}
                      title={note.pinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                  </div>
                  <span>{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <p className="text-gray-200 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Trash2, Loader2, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ImportRecord {
  id: string;
  filename: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  created_at: string;
  created_by: string;
}

export default function ImportHistory() {
  const { data: imports, isLoading, refetch } = useQuery({
    queryKey: ['import-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ImportRecord[];
    }
  });

  const handleCleanup = async (importId: string) => {
    if (!confirm('This will delete all records from this import. Are you sure?')) {
      return;
    }

    try {
      // First, get the import record to know which records to delete
      const { data: importRecord, error: fetchError } = await supabase
        .from('import_history')
        .select('*')
        .eq('id', importId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the debtors associated with this import
      const { error: deleteError } = await supabase
        .from('debtors')
        .delete()
        .eq('import_id', importId);

      if (deleteError) throw deleteError;

      // Delete the import history record
      const { error: historyError } = await supabase
        .from('import_history')
        .delete()
        .eq('id', importId);

      if (historyError) throw historyError;

      toast.success('Successfully cleaned up import');
      refetch();
    } catch (err: any) {
      console.error('Cleanup failed:', err);
      toast.error('Failed to clean up import: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!imports?.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No import history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recent Imports</h3>
      <div className="space-y-3">
        {imports.map((record) => (
          <div
            key={record.id}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <FileSpreadsheet className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {record.filename}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                <div className="mt-1 flex items-center space-x-4 text-xs">
                  <span className="text-green-600 dark:text-green-400">
                    {record.successful_records.toLocaleString()} successful
                  </span>
                  {record.failed_records > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {record.failed_records.toLocaleString()} failed
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleCleanup(record.id)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Clean up this import"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
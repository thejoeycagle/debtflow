import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { parse, isValid } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import ImportDropzone from './import/ImportDropzone';
import ImportHistory from './import/ImportHistory';

const DATE_FORMATS = [
  'yyyy-MM-dd',
  'MM/dd/yyyy',
  'M/d/yyyy',
  'MM-dd-yyyy',
  'dd/MM/yyyy',
  'yyyy/MM/dd',
];

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  for (const format of DATE_FORMATS) {
    const parsedDate = parse(dateStr, format, new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }
  return null;
}

function cleanSSN(ssn: string): string {
  return ssn ? ssn.replace(/[^0-9]/g, '') : '';
}

function cleanNumber(num: string): number {
  if (!num) return 0;
  const cleaned = num.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export default function ImportTool() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0 });
  const [error, setError] = useState<string | null>(null);

  const processData = async (data: any[], filename: string) => {
    try {
      // Create import history record
      const { data: importRecord, error: importError } = await supabase
        .from('import_history')
        .insert([{
          filename,
          total_records: data.length,
          successful_records: 0,
          failed_records: 0
        }])
        .select()
        .single();

      if (importError) {
        console.error('Import history creation failed:', importError);
        throw new Error('Failed to create import record. Please try again.');
      }

      const processed = data.map(row => ({
        import_id: importRecord.id,
        full_name: row.full_name || [(row.first_name || ''), (row.last_name || '')].join(' ').trim(),
        first_name: row.first_name || row.full_name?.split(' ')[0] || '',
        last_name: row.last_name || row.full_name?.split(' ').slice(1).join(' ') || '',
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        zipcode: row.zipcode || '',
        dob: parseDate(row.dob)?.toISOString().split('T')[0] || null,
        ssn: cleanSSN(row.ssn),
        creditor_name: row.creditor_name || '',
        date_chargedoff: parseDate(row.date_chargedoff)?.toISOString().split('T')[0] || null,
        date_opened: parseDate(row.date_opened)?.toISOString().split('T')[0] || null,
        original_creditor_number: row.original_creditor_number || '',
        account_number: row.account_number || '',
        total_balance: cleanNumber(row.total_balance),
        status: 'new'
      }));

      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < processed.length; i += batchSize) {
        batches.push(processed.slice(i, i + batchSize));
      }

      setProgress({ current: 0, total: processed.length, failed: 0 });
      let successfulRecords = 0;
      let failedRecords = 0;

      for (const batch of batches) {
        try {
          const { error: insertError } = await supabase
            .from('debtors')
            .insert(batch);

          if (insertError) {
            failedRecords += batch.length;
            setProgress(prev => ({
              ...prev,
              failed: prev.failed + batch.length
            }));
            console.error('Batch insert error:', insertError);
          } else {
            successfulRecords += batch.length;
          }
        } catch (err) {
          failedRecords += batch.length;
          console.error('Batch processing error:', err);
        }

        setProgress(prev => ({
          ...prev,
          current: Math.min(prev.current + batch.length, prev.total)
        }));
      }

      // Update import history record
      const { error: updateError } = await supabase
        .from('import_history')
        .update({
          successful_records: successfulRecords,
          failed_records: failedRecords
        })
        .eq('id', importRecord.id);

      if (updateError) {
        console.error('Failed to update import history:', updateError);
      }

      return { successful: successfulRecords, failed: failedRecords };
    } catch (err: any) {
      console.error('Processing error:', err);
      throw new Error(err.message || 'Failed to process and import records');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length !== 1) {
      setError('Please upload only one CSV file');
      return;
    }

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const result = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        });
      });

      const parsed = result as Papa.ParseResult<any>;
      const { successful, failed } = await processData(parsed.data, file.name);
      
      if (failed > 0) {
        toast.warning(`Import completed with ${successful.toLocaleString()} successful and ${failed.toLocaleString()} failed records`);
      } else {
        toast.success(`Successfully imported ${successful.toLocaleString()} records`);
      }
    } catch (err: any) {
      console.error('Import failed:', err);
      setError(err.message);
      toast.error('Import failed: ' + err.message);
    } finally {
      setImporting(false);
      setProgress({ current: 0, total: 0, failed: 0 });
    }
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Debtors</h2>
        <ImportDropzone
          onDrop={onDrop}
          importing={importing}
          progress={progress}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <p className="ml-3 text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Import Features:</h3>
          <ul className="space-y-3">
            {[
              'Optimized for large datasets (200k+ records)',
              'Concurrent batch processing',
              'Automatic field mapping',
              'Smart date format detection',
              'Progress tracking with error reporting',
              'Import history tracking',
            ].map((feature) => (
              <li key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ImportHistory />
    </div>
  );
}
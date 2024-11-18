import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';

interface ImportDropzoneProps {
  onDrop: (files: File[]) => void;
  importing: boolean;
  progress: {
    current: number;
    total: number;
    failed: number;
  };
}

export default function ImportDropzone({ onDrop, importing, progress }: ImportDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    disabled: importing,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center
        ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700'}
        ${importing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-500'}
      `}
    >
      <input {...getInputProps()} />
      
      {importing ? (
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Importing data...</p>
            {progress.total > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {progress.current.toLocaleString()} of {progress.total.toLocaleString()} records processed
                {progress.failed > 0 && ` (${progress.failed.toLocaleString()} failed)`}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Drop your CSV file here, or click to select
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Large files will be processed in batches
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
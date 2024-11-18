import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  isLoading: boolean;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'pending', label: 'Pending', color: 'bg-purple-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' }
];

export default function StatusSelector({ currentStatus, onStatusChange, isLoading }: StatusSelectorProps) {
  const currentOption = STATUS_OPTIONS.find(option => option.value === currentStatus) || STATUS_OPTIONS[0];

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        disabled={isLoading}
        className={`
          appearance-none
          pl-3 pr-10 py-2
          text-sm font-medium
          rounded-lg
          border border-gray-700
          bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-${currentOption.color}
          transition-colors
          disabled:opacity-50
          ${currentOption.color.replace('bg-', 'text-').replace('500', '400')}
        `}
      >
        {STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <Check className={`w-4 h-4 ${currentOption.color.replace('bg-', 'text-').replace('500', '400')}`} />
        )}
      </div>
    </div>
  );
}
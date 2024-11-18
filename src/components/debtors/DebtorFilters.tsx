import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FiltersProps {
  filters: {
    minBalance: string;
    maxBalance: string;
    state: string;
    creditor: string;
    status: string;
    searchTerm: string;
  };
  setFilters: (filters: any) => void;
  onClear: () => void;
}

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' }
];

export default function DebtorFilters({ filters, setFilters, onClear }: FiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minBalance: '',
      maxBalance: '',
      state: '',
      creditor: '',
      status: '',
      searchTerm: ''
    });
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-medium text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 rounded-md"
          >
            <X className="w-4 h-4 mr-1.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-6">
        {/* Balance Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-indigo-300">
            Balance Range
          </label>
          <div className="flex space-x-2">
            <div className="relative rounded-md flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="minBalance"
                placeholder="Min"
                value={filters.minBalance}
                onChange={handleChange}
                className="block w-full rounded-md bg-gray-900/50 border border-gray-800 text-white pl-7 pr-3 py-2 
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors
                         placeholder-gray-500 hover:border-gray-700"
              />
            </div>
            <div className="relative rounded-md flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="maxBalance"
                placeholder="Max"
                value={filters.maxBalance}
                onChange={handleChange}
                className="block w-full rounded-md bg-gray-900/50 border border-gray-800 text-white pl-7 pr-3 py-2 
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors
                         placeholder-gray-500 hover:border-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Creditor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-indigo-300">
            Creditor
          </label>
          <div className="relative">
            <input
              type="text"
              name="creditor"
              value={filters.creditor}
              onChange={handleChange}
              placeholder="Search by creditor name"
              className="block w-full rounded-md bg-gray-900/50 border border-gray-800 text-white px-4 py-2 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors
                       placeholder-gray-500 hover:border-gray-700"
            />
          </div>
        </div>

        {/* State */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-indigo-300">
            State
          </label>
          <div className="relative">
            <select
              name="state"
              value={filters.state}
              onChange={handleChange}
              className="block w-full rounded-md bg-gray-900/50 border border-gray-800 text-white px-4 py-2 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors
                       hover:border-gray-700 appearance-none"
            >
              <option value="">All States</option>
              {STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-indigo-300">
            Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="block w-full rounded-md bg-gray-900/50 border border-gray-800 text-white px-4 py-2 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors
                       hover:border-gray-700 appearance-none"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {filters.minBalance && (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                Min: ${filters.minBalance}
                <button
                  onClick={() => setFilters((prev: any) => ({ ...prev, minBalance: '' }))}
                  className="ml-2 hover:text-indigo-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxBalance && (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                Max: ${filters.maxBalance}
                <button
                  onClick={() => setFilters((prev: any) => ({ ...prev, maxBalance: '' }))}
                  className="ml-2 hover:text-indigo-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.creditor && (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                Creditor: {filters.creditor}
                <button
                  onClick={() => setFilters((prev: any) => ({ ...prev, creditor: '' }))}
                  className="ml-2 hover:text-indigo-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.state && (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                State: {filters.state}
                <button
                  onClick={() => setFilters((prev: any) => ({ ...prev, state: '' }))}
                  className="ml-2 hover:text-indigo-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                Status: {filters.status}
                <button
                  onClick={() => setFilters((prev: any) => ({ ...prev, status: '' }))}
                  className="ml-2 hover:text-indigo-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DebtorHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  currentIndex: number;
  totalDebtors: number;
  onPrevious: () => void;
  onNext: () => void;
  children?: React.ReactNode;
}

export default function DebtorHeader({
  showFilters,
  setShowFilters,
  currentIndex,
  totalDebtors,
  onPrevious,
  onNext,
  children
}: DebtorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-gray-400 hover:text-white"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </button>
        {children}
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="p-1 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="text-sm font-medium text-gray-300">
          Account {currentIndex + 1} of {totalDebtors}
        </span>
        <button
          onClick={onNext}
          disabled={currentIndex === totalDebtors - 1}
          className="p-1 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
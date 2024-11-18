import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DebtorCard from '../components/debtors/DebtorCard';
import DebtorFilters from '../components/debtors/DebtorFilters';
import DebtorHeader from '../components/debtors/DebtorHeader';
import DebtorSearch from '../components/debtors/DebtorSearch';

export default function Debtors() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    creditor: '',
    minBalance: '',
    maxBalance: '',
    state: '',
    limit: 50,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: debtors = [], isLoading, refetch } = useQuery({
    queryKey: ['debtors', filters, selectedDebtorId],
    queryFn: async () => {
      let query = supabase
        .from('debtors')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedDebtorId) {
        query = query.eq('id', selectedDebtorId);
      } else {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.creditor) {
          query = query.ilike('creditor_name', `%${filters.creditor}%`);
        }
        if (filters.minBalance) {
          query = query.gte('total_balance', parseFloat(filters.minBalance));
        }
        if (filters.maxBalance) {
          query = query.lte('total_balance', parseFloat(filters.maxBalance));
        }
        if (filters.state) {
          query = query.eq('state', filters.state);
        }
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isLoaded || !!selectedDebtorId,
  });

  const handleLoadAccounts = () => {
    setIsLoaded(true);
    refetch();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < debtors.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDebtorSelect = (debtorId: string) => {
    setSelectedDebtorId(debtorId);
    setCurrentIndex(0);
    refetch();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <DebtorHeader 
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        currentIndex={currentIndex}
        totalDebtors={debtors.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      >
        <DebtorSearch onResultSelect={handleDebtorSelect} />
      </DebtorHeader>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {showFilters && (
            <div className="w-80 border-r border-gray-800 bg-gray-900 overflow-y-auto">
              <DebtorFilters 
                filters={filters} 
                setFilters={setFilters}
                onClear={() => setSelectedDebtorId(null)} 
              />
            </div>
          )}

          <div className={`flex-1 overflow-y-auto bg-gray-900 ${showFilters ? '' : 'w-full'}`}>
            {!isLoaded && !selectedDebtorId ? (
              <div className="flex justify-center p-4">
                <button
                  onClick={handleLoadAccounts}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-2" />
                      Load Accounts
                    </>
                  )}
                </button>
              </div>
            ) : debtors.length > 0 ? (
              <div className={`h-full ${showFilters ? '' : 'container mx-auto max-w-7xl px-4'}`}>
                <DebtorCard
                  key={debtors[currentIndex].id}
                  debtor={debtors[currentIndex]}
                  isActive={true}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                  No debtors found matching your criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
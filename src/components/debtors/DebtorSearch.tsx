import React, { useState, useEffect } from 'react';
import { Search, Phone, AtSign, User, Loader2, DollarSign } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface SearchResult {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone_numbers?: string[];
  total_balance: number;
  status: string;
  match_type: 'name' | 'phone' | 'account';
  account_number?: string;
}

interface DebtorSearchProps {
  onResultSelect: (debtorId: string) => void;
}

export default function DebtorSearch({ onResultSelect }: DebtorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Format phone number for search
  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Determine search type
  const getSearchType = (term: string) => {
    const phoneRegex = /^[\d\-+() ]+$/;
    if (phoneRegex.test(term)) return 'phone';
    return 'text';
  };

  useEffect(() => {
    const searchDebtors = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchType = getSearchType(debouncedSearch);
        let combinedResults: SearchResult[] = [];

        // Phone number search
        if (searchType === 'phone') {
          const formattedPhone = formatPhoneNumber(debouncedSearch);
          const { data: phoneData, error: phoneError } = await supabase
            .from('phone_numbers')
            .select('debtor_id, number')
            .ilike('number', `%${formattedPhone}%`);

          if (phoneError) throw phoneError;

          if (phoneData && phoneData.length > 0) {
            const debtorIds = phoneData.map(p => p.debtor_id);
            const { data: debtorData, error: debtorError } = await supabase
              .from('debtors')
              .select('id, full_name, first_name, last_name, total_balance, status, account_number')
              .in('id', debtorIds);

            if (debtorError) throw debtorError;

            combinedResults.push(
              ...(debtorData?.map(debtor => ({
                ...debtor,
                phone_numbers: phoneData
                  .filter(p => p.debtor_id === debtor.id)
                  .map(p => p.number),
                match_type: 'phone' as const
              })) || [])
            );
          }
        }

        // General search (name, account number)
        const { data: generalData, error: generalError } = await supabase
          .from('debtors')
          .select('id, full_name, first_name, last_name, total_balance, status, account_number')
          .or(
            `full_name.ilike.%${debouncedSearch}%,` +
            `first_name.ilike.%${debouncedSearch}%,` +
            `last_name.ilike.%${debouncedSearch}%,` +
            `account_number.ilike.%${debouncedSearch}%`
          )
          .limit(10);

        if (generalError) throw generalError;

        if (generalData) {
          combinedResults.push(
            ...generalData.map(debtor => ({
              ...debtor,
              match_type: debtor.account_number?.includes(debouncedSearch) ? 'account' as const : 'name' as const
            }))
          );
        }

        // Remove duplicates and sort by relevance
        const uniqueResults = Array.from(
          new Map(combinedResults.map(item => [item.id, item])).values()
        );

        setResults(uniqueResults);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    searchDebtors();
  }, [debouncedSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onResultSelect(results[selectedIndex].id);
          setSearchTerm('');
          setResults([]);
        }
        break;
      case 'Escape':
        setResults([]);
        setSelectedIndex(-1);
        break;
    }
  };

  const getMatchIcon = (result: SearchResult) => {
    switch (result.match_type) {
      case 'phone':
        return <Phone className="w-4 h-4 text-blue-400" />;
      case 'account':
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default:
        return <User className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors",
          isSearching ? "text-primary" : "text-muted-foreground"
        )} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, phone, or account number..."
          className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Results dropdown */}
      {(results.length > 0 || isSearching) && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg overflow-hidden">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          ) : (
            <ul className="max-h-[calc(100vh-200px)] overflow-auto">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  onClick={() => {
                    onResultSelect(result.id);
                    setSearchTerm('');
                    setResults([]);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "p-3 hover:bg-muted cursor-pointer border-b last:border-0",
                    selectedIndex === index && "bg-muted"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {getMatchIcon(result)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.full_name}</div>
                      <div className="text-sm text-muted-foreground space-x-2">
                        {result.phone_numbers?.map((phone, i) => (
                          <span key={i} className="inline-flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {phone}
                          </span>
                        ))}
                        {result.account_number && (
                          <span className="inline-flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {result.account_number}
                          </span>
                        )}
                        <span className="inline-flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatCurrency(result.total_balance)}
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      result.status === 'new' && "bg-blue-100 text-blue-800",
                      result.status === 'in_progress' && "bg-yellow-100 text-yellow-800",
                      result.status === 'pending' && "bg-purple-100 text-purple-800",
                      result.status === 'resolved' && "bg-green-100 text-green-800"
                    )}>
                      {result.status.replace('_', ' ')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import PersonalDetails from './sections/PersonalDetails';
import AddressSection from './sections/AddressSection';
import PhoneNumbers from './sections/PhoneNumbers';
import NotesSection from './sections/NotesSection';
import AccountDetails from './sections/AccountDetails';
import PaymentsSection from './sections/PaymentsSection';
import StatusSelector from './StatusSelector';
import { format } from 'date-fns';

interface DebtorCardProps {
  debtor: any;
  isActive?: boolean;
}

export default function DebtorCard({ debtor, isActive }: DebtorCardProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('debtors')
        .update({ status })
        .eq('id', debtor.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['debtors']);
      toast.success('Status updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update status');
      console.error('Status update error:', error);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-800/50">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {debtor.first_name} {debtor.last_name}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Last Updated: {format(new Date(debtor.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-800"></div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Account Status</div>
                <StatusSelector
                  currentStatus={debtor.status}
                  onStatusChange={(status) => updateStatusMutation.mutate(status)}
                  isLoading={updateStatusMutation.isLoading}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Total Balance</div>
              <div className="text-2xl font-bold text-green-400">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(debtor.total_balance)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-800/50">
            <div className="grid grid-cols-2 divide-x divide-gray-800">
              <PersonalDetails debtor={debtor} />
              <AddressSection debtor={debtor} />
            </div>
          </div>
          <PhoneNumbers debtorId={debtor.id} />
          <NotesSection debtor={debtor} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AccountDetails debtor={debtor} />
          <PaymentsSection debtor={debtor} />
        </div>
      </div>
    </div>
  );
}
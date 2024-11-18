import React from 'react';
import { format } from 'date-fns';
import { CreditCard, Calendar, Building, Hash } from 'lucide-react';

interface AccountDetailsProps {
  debtor: any;
}

export default function AccountDetails({ debtor }: AccountDetailsProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-800/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <CreditCard className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-semibold">Account Details</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <Hash className="w-4 h-4 mr-1.5" />
            Original Creditor #
          </label>
          <div className="mt-1 font-mono bg-gray-800/50 px-3 py-1.5 rounded">
            {debtor.original_creditor_number || 'N/A'}
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <Building className="w-4 h-4 mr-1.5" />
            Creditor Name
          </label>
          <div className="mt-1 text-lg font-medium">
            {debtor.creditor_name || 'N/A'}
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <Calendar className="w-4 h-4 mr-1.5" />
            Date Opened
          </label>
          <div className="mt-1 font-mono bg-gray-800/50 px-3 py-1.5 rounded">
            {debtor.date_opened ? format(new Date(debtor.date_opened), 'MM/dd/yyyy') : 'N/A'}
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <Calendar className="w-4 h-4 mr-1.5" />
            Date Charged Off
          </label>
          <div className="mt-1 font-mono bg-gray-800/50 px-3 py-1.5 rounded">
            {debtor.date_chargedoff ? format(new Date(debtor.date_chargedoff), 'MM/dd/yyyy') : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
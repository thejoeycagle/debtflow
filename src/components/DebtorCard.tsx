import React from 'react';
import { Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { Debtor } from '../types';

interface DebtorCardProps {
  debtor: Debtor;
  onClick: (debtor: Debtor) => void;
}

export default function DebtorCard({ debtor, onClick }: DebtorCardProps) {
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
  };

  return (
    <div
      onClick={() => onClick(debtor)}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{debtor.full_name}</h3>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Mail className="h-4 w-4 mr-1" />
            {debtor.email}
          </div>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Phone className="h-4 w-4 mr-1" />
            {debtor.phone}
          </div>
        </div>
        <span
          className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
            statusColors[debtor.status]
          }\`}
        >
          {debtor.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center text-gray-900">
          <DollarSign className="h-5 w-5 text-gray-400" />
          <span className="text-xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(debtor.total_debt)}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Last Contact: {new Date(debtor.last_contact).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
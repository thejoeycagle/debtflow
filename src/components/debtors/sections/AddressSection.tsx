import React from 'react';
import { MapPin, Building2, MapPinned } from 'lucide-react';

interface AddressSectionProps {
  debtor: any;
}

export default function AddressSection({ debtor }: AddressSectionProps) {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <MapPin className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-semibold">Address</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <Building2 className="w-4 h-4 mr-1.5" />
            Street Address
          </label>
          <div className="mt-1 text-lg">
            {debtor.address || 'N/A'}
          </div>
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <MapPinned className="w-4 h-4 mr-1.5" />
            City, State ZIP
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-lg">{debtor.city || 'N/A'}</span>
            <span className="text-gray-500">&bull;</span>
            <span className="font-mono bg-gray-800/50 px-2 py-0.5 rounded">
              {debtor.state || 'N/A'}
            </span>
            <span className="text-gray-500">&bull;</span>
            <span className="font-mono bg-gray-800/50 px-2 py-0.5 rounded">
              {debtor.zipcode || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
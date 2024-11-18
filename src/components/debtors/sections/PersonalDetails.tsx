import React from 'react';
import { User, Calendar, Hash } from 'lucide-react';

interface PersonalDetailsProps {
  debtor: any;
}

export default function PersonalDetails({ debtor }: PersonalDetailsProps) {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-semibold">Personal Details</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Full Name</label>
          <div className="mt-1 text-lg font-medium">
            {debtor.first_name} {debtor.last_name}
          </div>
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <Calendar className="w-4 h-4 mr-1.5" />
            Date of Birth
          </label>
          <div className="mt-1 font-mono bg-gray-800/50 px-3 py-1.5 rounded inline-block">
            {debtor.dob || 'N/A'}
          </div>
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-400">
            <Hash className="w-4 h-4 mr-1.5" />
            SSN
          </label>
          <div className="mt-1 font-mono bg-gray-800/50 px-3 py-1.5 rounded inline-block">
            {debtor.ssn || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
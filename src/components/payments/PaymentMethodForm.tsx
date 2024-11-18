import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface PaymentMethodFormProps {
  method: 'check' | 'card';
  onComplete: (details: any) => void;
  onBack: () => void;
}

export default function PaymentMethodForm({ method, onComplete, onBack }: PaymentMethodFormProps) {
  const [details, setDetails] = useState({
    card_number: '',
    card_exp_month: '',
    card_exp_year: '',
    card_cvv: '',
    card_zip: '',
    routing_number: '',
    account_number: '',
    account_type: 'checking'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let processedDetails = {};

    if (method === 'card') {
      processedDetails = {
        card_last4: details.card_number.slice(-4),
        card_brand: 'VISA', // This would normally be determined by the payment processor
        card_exp_month: details.card_exp_month,
        card_exp_year: details.card_exp_year,
        card_zip: details.card_zip
      };
    } else {
      processedDetails = {
        routing_number: details.routing_number,
        account_last4: details.account_number.slice(-4),
        account_type: details.account_type
      };
    }

    onComplete(processedDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {method === 'card' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
            <input
              type="text"
              value={details.card_number}
              onChange={(e) => setDetails({ ...details, card_number: e.target.value.replace(/\D/g, '') })}
              maxLength={16}
              className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Exp Month</label>
              <input
                type="text"
                value={details.card_exp_month}
                onChange={(e) => setDetails({ ...details, card_exp_month: e.target.value.replace(/\D/g, '') })}
                maxLength={2}
                placeholder="MM"
                className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Exp Year</label>
              <input
                type="text"
                value={details.card_exp_year}
                onChange={(e) => setDetails({ ...details, card_exp_year: e.target.value.replace(/\D/g, '') })}
                maxLength={2}
                placeholder="YY"
                className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
              <input
                type="text"
                value={details.card_cvv}
                onChange={(e) => setDetails({ ...details, card_cvv: e.target.value.replace(/\D/g, '') })}
                maxLength={4}
                className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Billing ZIP</label>
              <input
                type="text"
                value={details.card_zip}
                onChange={(e) => setDetails({ ...details, card_zip: e.target.value.replace(/\D/g, '') })}
                maxLength={5}
                className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Routing Number</label>
            <input
              type="text"
              value={details.routing_number}
              onChange={(e) => setDetails({ ...details, routing_number: e.target.value.replace(/\D/g, '') })}
              maxLength={9}
              className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
            <input
              type="text"
              value={details.account_number}
              onChange={(e) => setDetails({ ...details, account_number: e.target.value.replace(/\D/g, '') })}
              className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
            <select
              value={details.account_type}
              onChange={(e) => setDetails({ ...details, account_type: e.target.value })}
              className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        </>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
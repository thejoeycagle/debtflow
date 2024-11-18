import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface PaymentScheduleFormProps {
  paymentType: 'one_time' | 'multi_part' | 'payment_plan';
  totalAmount: string;
  setTotalAmount: (value: string) => void;
  frequency: 'weekly' | 'bi_weekly' | 'monthly';
  setFrequency: (value: 'weekly' | 'bi_weekly' | 'monthly') => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  numberOfPayments: string;
  setNumberOfPayments: (value: string) => void;
  onScheduleGenerate: () => void;
}

export default function PaymentScheduleForm({
  paymentType,
  totalAmount,
  setTotalAmount,
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  numberOfPayments,
  setNumberOfPayments,
  onScheduleGenerate
}: PaymentScheduleFormProps) {
  useEffect(() => {
    if (totalAmount && startDate) {
      onScheduleGenerate();
    }
  }, [totalAmount, startDate, frequency, numberOfPayments, paymentType]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setTotalAmount(value);
    }
  };

  const handlePaymentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNumberOfPayments(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Total Amount</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">$</span>
          </div>
          <input
            type="text"
            value={totalAmount}
            onChange={handleAmountChange}
            className="block w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
        <div className="relative">
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            min={new Date().toISOString().split('T')[0]}
            className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {paymentType !== 'one_time' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Frequency</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'weekly', label: 'Weekly' },
                { id: 'bi_weekly', label: 'Bi-Weekly' },
                { id: 'monthly', label: 'Monthly' }
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id as any)}
                  className={`p-3 rounded-lg border text-center ${
                    frequency === freq.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of Payments</label>
            <input
              type="text"
              value={numberOfPayments}
              onChange={handlePaymentsChange}
              className="block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter number of payments"
            />
          </div>
        </>
      )}
    </div>
  );
}
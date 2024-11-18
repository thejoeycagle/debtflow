import React from 'react';
import { format } from 'date-fns';

interface PaymentSchedule {
  amount: number;
  date: Date;
}

interface PaymentSummaryProps {
  schedule: PaymentSchedule[];
  paymentDetails?: any;
  paymentMethod?: 'check' | 'card' | 'bank';
}

export default function PaymentSummary({ schedule, paymentDetails, paymentMethod }: PaymentSummaryProps) {
  const totalAmount = schedule.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-4 bg-gray-800/50 rounded-lg p-4">
      <div>
        <h3 className="text-lg font-medium mb-4">Payment Schedule Summary</h3>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {schedule.map((payment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">#{index + 1}</span>
                <span>{format(payment.date, 'MMM d, yyyy')}</span>
              </div>
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(payment.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
          <span className="text-gray-400">Total Amount:</span>
          <span className="text-xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(totalAmount)}
          </span>
        </div>
      </div>

      {paymentDetails && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-medium mb-4">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Customer Name:</span>
              <span>{paymentDetails.customer_name}</span>
            </div>
            {paymentMethod === 'card' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Card:</span>
                  <span>
                    {paymentDetails.card_brand} •••• {paymentDetails.card_last4}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires:</span>
                  <span>{paymentDetails.card_exp_month}/{paymentDetails.card_exp_year}</span>
                </div>
              </>
            )}
            {(paymentMethod === 'check' || paymentMethod === 'bank') && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account:</span>
                  <span>
                    {paymentDetails.account_type} •••• {paymentDetails.account_last4}
                  </span>
                </div>
                {paymentDetails.routing_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Routing:</span>
                    <span>{paymentDetails.routing_number}</span>
                  </div>
                )}
                {paymentDetails.check_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Check Number:</span>
                    <span>{paymentDetails.check_number}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
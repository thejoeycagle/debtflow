import React, { useState } from 'react';
import { Plus, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import PaymentModal from '../../payments/PaymentModal';

interface PaymentsSectionProps {
  debtor: any;
}

export default function PaymentsSection({ debtor }: PaymentsSectionProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', debtor.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('debtor_id', debtor.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatPaymentMethod = (payment: any) => {
    switch (payment.payment_method) {
      case 'card':
        return `${payment.card_brand} •••• ${showSensitiveData[payment.id] ? payment.card_last4 : '****'}`;
      case 'bank':
        return `${payment.account_type} •••• ${showSensitiveData[payment.id] ? payment.account_last4 : '****'}`;
      case 'check':
        return `Check #${payment.check_number}`;
      default:
        return payment.payment_method;
    }
  };

  const toggleSensitiveData = (paymentId: string) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [paymentId]: !prev[paymentId]
    }));
  };

  return (
    <section className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-800/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-semibold">Payments</h2>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 rounded-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Payment(s)
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No payments recorded</div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-gray-800/50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(payment.amount)}
                    </span>
                    <span className={`text-sm ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSensitiveData(payment.id)}
                    className="p-1 text-gray-400 hover:text-gray-300"
                    title={showSensitiveData[payment.id] ? "Hide details" : "Show details"}
                  >
                    {showSensitiveData[payment.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Customer Name: </span>
                    <span>{payment.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date: </span>
                    <span>{format(new Date(payment.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment Method: </span>
                    <span>{formatPaymentMethod(payment)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Processed: </span>
                    <span>
                      {payment.processed_at 
                        ? format(new Date(payment.processed_at), 'MMM d, yyyy h:mm a')
                        : 'Pending'
                      }
                    </span>
                  </div>
                </div>

                {payment.failure_reason && (
                  <div className="mt-2 text-sm text-red-400">
                    Failure Reason: {payment.failure_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal
          debtor={debtor}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </section>
  );
}
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import PaymentMethodForm from './PaymentMethodForm';
import PaymentScheduleForm from './PaymentScheduleForm';
import PaymentSummary from './PaymentSummary';

interface PaymentModalProps {
  debtor: any;
  onClose: () => void;
}

export default function PaymentModal({ debtor, onClose }: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [paymentType, setPaymentType] = useState<'one_time' | 'multi_part' | 'payment_plan'>('one_time');
  const [paymentMethod, setPaymentMethod] = useState<'check' | 'card' | 'bank' | null>(null);
  const [totalAmount, setTotalAmount] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'bi_weekly' | 'monthly'>('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [numberOfPayments, setNumberOfPayments] = useState('');
  const [paymentSchedule, setPaymentSchedule] = useState<Array<{ amount: number; date: Date }>>([]);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const queryClient = useQueryClient();

  const schedulePaymentsMutation = useMutation({
    mutationFn: async () => {
      const payments = paymentSchedule.map(payment => ({
        debtor_id: debtor.id,
        amount: payment.amount,
        date: payment.date.toISOString().split('T')[0],
        payment_method: paymentMethod,
        status: 'pending',
        ...paymentDetails
      }));

      const { error } = await supabase
        .from('payments')
        .insert(payments);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payments', debtor.id]);
      toast.success('Payments scheduled successfully');
      onClose();
    },
    onError: (error: any) => {
      console.error('Failed to schedule payments:', error);
      toast.error(error.message || 'Failed to schedule payments');
    }
  });

  const generateSchedule = () => {
    if (!totalAmount || !startDate) return;

    const amount = parseFloat(totalAmount);
    if (isNaN(amount)) return;

    if (paymentType === 'one_time') {
      setPaymentSchedule([{ amount, date: startDate }]);
      return;
    }

    const numPayments = parseInt(numberOfPayments);
    if (isNaN(numPayments) || numPayments < 1) return;

    const paymentAmount = amount / numPayments;
    const schedule = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < numPayments; i++) {
      schedule.push({
        amount: Number(paymentAmount.toFixed(2)),
        date: new Date(currentDate)
      });

      switch (frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'bi_weekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    setPaymentSchedule(schedule);
  };

  const handleSubmit = () => {
    if (!paymentSchedule.length || !paymentDetails) return;
    schedulePaymentsMutation.mutate();
  };

  const modalContentStyles = {
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgb(55 65 81) transparent',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 150px)',
  } as const;

  const modalContentClasses = `
    flex-1 overflow-y-auto p-6
    scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700
    hover:scrollbar-thumb-gray-600
  `;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0B1120] rounded-lg shadow-xl w-[95vw] max-w-6xl h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-white">Schedule Payment(s)</h1>
            <div className="text-sm text-gray-400">
              Account: {debtor.account_number} • Balance: ${debtor.total_balance}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className={modalContentClasses} style={modalContentStyles}>
          <div className="max-w-5xl mx-auto space-y-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Payment Type</h2>
                <div className="grid grid-cols-3 gap-6">
                  <button
                    onClick={() => {
                      setPaymentType('one_time');
                      setStep(2);
                    }}
                    className={`p-6 rounded-lg border text-center hover:border-indigo-500 ${
                      paymentType === 'one_time' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700'
                    }`}
                  >
                    <h3 className="text-lg font-medium mb-2">One-Time Settlement</h3>
                    <p className="text-sm text-gray-400">Single payment to settle the account</p>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentType('multi_part');
                      setStep(2);
                    }}
                    className={`p-6 rounded-lg border text-center hover:border-indigo-500 ${
                      paymentType === 'multi_part' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700'
                    }`}
                  >
                    <h3 className="text-lg font-medium mb-2">Multi-Part Settlement</h3>
                    <p className="text-sm text-gray-400">Split settlement into multiple payments</p>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentType('payment_plan');
                      setStep(2);
                    }}
                    className={`p-6 rounded-lg border text-center hover:border-indigo-500 ${
                      paymentType === 'payment_plan' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700'
                    }`}
                  >
                    <h3 className="text-lg font-medium mb-2">Payment Plan</h3>
                    <p className="text-sm text-gray-400">Regular payments over time</p>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => {
                      setPaymentMethod('check');
                      setStep(3);
                    }}
                    className={`p-6 rounded-lg border text-center hover:border-indigo-500 ${
                      paymentMethod === 'check' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700'
                    }`}
                  >
                    <h3 className="text-lg font-medium mb-2">Check</h3>
                    <p className="text-sm text-gray-400">Pay by check or bank account</p>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod('card');
                      setStep(3);
                    }}
                    className={`p-6 rounded-lg border text-center hover:border-indigo-500 ${
                      paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700'
                    }`}
                  >
                    <h3 className="text-lg font-medium mb-2">Credit Card</h3>
                    <p className="text-sm text-gray-400">Pay by credit or debit card</p>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && paymentMethod && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">Payment Schedule</h2>
                  <PaymentScheduleForm
                    paymentType={paymentType}
                    totalAmount={totalAmount}
                    setTotalAmount={setTotalAmount}
                    frequency={frequency}
                    setFrequency={setFrequency}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    numberOfPayments={numberOfPayments}
                    setNumberOfPayments={setNumberOfPayments}
                    onScheduleGenerate={generateSchedule}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
                  <PaymentMethodForm
                    method={paymentMethod}
                    onComplete={(details) => {
                      setPaymentDetails(details);
                      setStep(4);
                    }}
                    onBack={() => setStep(2)}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Review & Confirm</h2>
                <PaymentSummary
                  schedule={paymentSchedule}
                  paymentDetails={paymentDetails}
                  paymentMethod={paymentMethod}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={schedulePaymentsMutation.isLoading}
                    className="flex items-center px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Confirm Payments
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
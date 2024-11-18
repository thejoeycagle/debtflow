import React, { useState } from 'react';
import { Phone, Plus, X, Edit2, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface PhoneNumbersProps {
  debtorId: string;
}

interface PhoneNumber {
  id: string;
  number: string;
  status: 'good' | 'bad' | 'unknown';
  label: 'direct' | 'relative';
  contact_name: string | null;
}

interface EditingState {
  id: string | null;
  contact_name: string;
}

export default function PhoneNumbers({ debtorId }: PhoneNumbersProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newLabel, setNewLabel] = useState<'direct' | 'relative'>('direct');
  const [newContactName, setNewContactName] = useState('');
  const [editing, setEditing] = useState<EditingState>({ id: null, contact_name: '' });
  const queryClient = useQueryClient();

  const { data: phoneNumbers = [], isLoading } = useQuery({
    queryKey: ['phone-numbers', debtorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('debtor_id', debtorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PhoneNumber[];
    }
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async (data: { id: string; status?: string; contact_name?: string }) => {
      const { error } = await supabase
        .from('phone_numbers')
        .update(data)
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['phone-numbers', debtorId]);
      setEditing({ id: null, contact_name: '' });
      toast.success('Phone number updated');
    }
  });

  const addPhoneMutation = useMutation({
    mutationFn: async (data: { number: string; label: 'direct' | 'relative'; contact_name?: string }) => {
      const { error } = await supabase
        .from('phone_numbers')
        .insert([{
          debtor_id: debtorId,
          number: data.number,
          status: 'unknown',
          label: data.label,
          contact_name: data.contact_name || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['phone-numbers', debtorId]);
      setNewNumber('');
      setNewLabel('direct');
      setNewContactName('');
      setIsAdding(false);
      toast.success('Phone number added');
    }
  });

  const deletePhoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('phone_numbers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['phone-numbers', debtorId]);
      toast.success('Phone number removed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;
    
    addPhoneMutation.mutate({
      number: newNumber.trim(),
      label: newLabel,
      contact_name: newContactName.trim() || undefined
    });
  };

  const handleStatusChange = (id: string, status: 'good' | 'bad' | 'unknown') => {
    updatePhoneMutation.mutate({ id, status });
  };

  const handleContactNameEdit = (phone: PhoneNumber) => {
    setEditing({ id: phone.id, contact_name: phone.contact_name || '' });
  };

  const handleContactNameSave = (id: string) => {
    updatePhoneMutation.mutate({ 
      id, 
      contact_name: editing.contact_name.trim() || null 
    });
  };

  const handleContactNameKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleContactNameSave(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400';
      case 'bad':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <section className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-800/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Phone className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-semibold">Phone Numbers</h2>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 rounded-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Number
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800/50 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Label</label>
                <select
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value as 'direct' | 'relative')}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  <option value="direct">Direct</option>
                  <option value="relative">Relative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addPhoneMutation.isLoading || !newNumber.trim()}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                Add Number
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading...</div>
        ) : phoneNumbers.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No phone numbers added</div>
        ) : (
          <div className="space-y-2">
            {phoneNumbers.map((phone) => (
              <div
                key={phone.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{phone.number}</span>
                    <button
                      onClick={() => {
                        const nextStatus = {
                          unknown: 'good',
                          good: 'bad',
                          bad: 'unknown'
                        }[phone.status] as 'good' | 'bad' | 'unknown';
                        handleStatusChange(phone.id, nextStatus);
                      }}
                      className={`text-sm capitalize px-2 py-0.5 rounded-full ${getStatusColor(phone.status)} hover:opacity-80`}
                    >
                      {phone.status}
                    </button>
                    <span className="text-sm text-gray-400 capitalize">({phone.label})</span>
                    {editing.id === phone.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editing.contact_name}
                          onChange={(e) => setEditing(prev => ({ ...prev, contact_name: e.target.value }))}
                          onKeyDown={(e) => handleContactNameKeyDown(e, phone.id)}
                          className="bg-gray-700/50 border border-gray-600 rounded px-2 py-0.5 text-sm text-white w-40"
                          placeholder="Enter contact name"
                          autoFocus
                        />
                        <button
                          onClick={() => handleContactNameSave(phone.id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {phone.contact_name ? (
                          <span className="text-gray-300">{phone.contact_name}</span>
                        ) : null}
                        <button
                          onClick={() => handleContactNameEdit(phone)}
                          className="text-gray-400 hover:text-gray-300"
                          title={phone.contact_name ? "Edit contact name" : "Add contact name"}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this number?')) {
                      deletePhoneMutation.mutate(phone.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
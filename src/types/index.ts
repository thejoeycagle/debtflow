export interface Debtor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  total_debt: number;
  status: 'new' | 'in_progress' | 'pending' | 'resolved';
  last_contact: string;
  notes: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'agent';
}
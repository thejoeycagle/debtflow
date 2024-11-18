import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'collector';
  phone_number?: string;
}

interface AuthState {
  user: User | null;
  savedCredentials: { username: string; password: string } | null;
  setUser: (user: User | null) => void;
  setSavedCredentials: (credentials: { username: string; password: string } | null) => void;
  clearState: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      savedCredentials: null,
      setUser: (user) => set({ user }),
      setSavedCredentials: (credentials) => set({ savedCredentials: credentials }),
      clearState: () => set({ user: null }),
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        savedCredentials: state.savedCredentials,
      }),
    }
  )
);
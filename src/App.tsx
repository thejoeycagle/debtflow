import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Debtors from './pages/Debtors';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import Agents from './pages/Agents';
import Leaderboard from './pages/Leaderboard';
import GamificationSettings from './pages/GamificationSettings';
import { useAuthStore } from './lib/auth-store';

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/debtors" replace />;
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="debtors" element={<Debtors />} />
            <Route path="integrations" element={<AdminRoute><Integrations /></AdminRoute>} />
            <Route path="agents" element={<AdminRoute><Agents /></AdminRoute>} />
            <Route path="gamification" element={<AdminRoute><GamificationSettings /></AdminRoute>} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
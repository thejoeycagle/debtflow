import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Users, Phone, Trophy, Star, LogOut } from 'lucide-react';
import { useAuthStore } from '../lib/auth-store';
import SoftPhone from './softphone/SoftPhone';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearState } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';

  const handleLogout = () => {
    clearState();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Building2, show: isAdmin },
    { name: 'Debtors', href: '/debtors', icon: Users, show: true },
    { name: 'Agents', href: '/agents', icon: Users, show: isAdmin },
    { name: 'Integrations', href: '/integrations', icon: Phone, show: isAdmin },
    { name: 'Gamification', href: '/gamification', icon: Trophy, show: isAdmin },
    { name: 'Leaderboard', href: '/leaderboard', icon: Star, show: true },
  ].filter(item => item.show);

  const currentPage = navigation.find(item => item.href === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} hidden md:flex md:flex-col transition-all duration-300`}>
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r border-border bg-card">
            <div className="flex items-center flex-shrink-0 px-4">
              {!sidebarCollapsed && (
                <>
                  <Building2 className="w-8 h-8 text-primary" />
                  <span className="ml-2 text-xl font-semibold text-foreground">DebtFlow AI</span>
                </>
              )}
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={`${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {!sidebarCollapsed && item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-border p-4">
              <div className="flex items-center">
                {!sidebarCollapsed && (
                  <div>
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name}`}
                      alt=""
                    />
                  </div>
                )}
                <div className={`${sidebarCollapsed ? 'hidden' : 'ml-3'}`}>
                  <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-foreground">
                  {currentPage?.name || 'Dashboard'}
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Show SoftPhone for collectors */}
      {isCollector && <SoftPhone />}
    </div>
  );
}
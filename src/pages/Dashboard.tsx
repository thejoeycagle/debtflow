import React from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import ImportTool from '../components/ImportTool';
import WelcomeBanner from '../components/WelcomeBanner';
import QuickActions from '../components/QuickActions';
import { useAuthStore } from '../lib/auth-store';

export default function Dashboard() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const stats = [
    {
      name: 'Total Debtors',
      value: '2,651',
      icon: Users,
      change: '+5.4%',
      changeType: 'increase',
    },
    {
      name: 'Collection Rate',
      value: '68.5%',
      icon: TrendingUp,
      change: '+2.1%',
      changeType: 'increase',
    },
    {
      name: 'At Risk',
      value: '245',
      icon: AlertCircle,
      change: '-3.2%',
      changeType: 'decrease',
    },
    {
      name: 'Resolved Cases',
      value: '1,423',
      icon: CheckCircle2,
      change: '+12.3%',
      changeType: 'increase',
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <WelcomeBanner />

      {/* Quick Actions for Admin */}
      {isAdmin && <QuickActions />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="relative bg-card pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className="absolute bg-primary rounded-md p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-muted-foreground truncate">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-foreground">
                  {item.value}
                </p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.changeType === 'increase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {item.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Import Tool for Admin */}
      {isAdmin && (
        <div className="mt-8">
          <ImportTool />
        </div>
      )}
    </div>
  );
}
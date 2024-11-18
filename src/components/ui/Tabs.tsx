import React from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
}

export function Tabs({ defaultValue, className = '', children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className={className} data-state={activeTab}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children }: TabsListProps) {
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800/50 p-1 text-gray-500 dark:text-gray-400">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, activeTab, setActiveTab }: TabsTriggerProps) {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium 
        ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none 
        disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-800
        ${isActive 
          ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800/50 dark:hover:text-gray-100'
        }
      `}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children, activeTab }: TabsContentProps) {
  if (value !== activeTab) return null;

  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:ring-offset-gray-950 
        dark:focus-visible:ring-gray-800 ${className}`}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
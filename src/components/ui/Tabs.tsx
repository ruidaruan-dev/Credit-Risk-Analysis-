import React, { useState } from 'react';
import clsx from 'clsx';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <div className="w-full">
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={clsx(
              'px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2',
              activeTab === item.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {activeItem && activeItem.content}
      </div>
    </div>
  );
};

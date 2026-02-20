import React from 'react';

type SidebarTab = 'profile' | 'levels' | 'lesson' | 'settings';

type MobileBottomNavProps = {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: Array<{ key: SidebarTab; label: string; icon: React.ReactNode }> = [
    {
      key: 'levels',
      label: 'Library',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H11v15H5.5A2.5 2.5 0 0 0 3 21.5z" />
          <path d="M21 6.5A2.5 2.5 0 0 0 18.5 4H13v15h5.5a2.5 2.5 0 0 1 2.5 2.5z" />
        </svg>
      ),
    },
    {
      key: 'lesson',
      label: 'Lesson',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 9.5v5l4-2.5z" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-4 gap-1 px-2 pb-2 pt-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            aria-label={tab.label}
            title={tab.label}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-all ${
              activeTab === tab.key
                ? 'bg-transparent text-brand'
                : 'bg-transparent text-gray-500'
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-soft text-brand shadow-none'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={`text-xs font-bold leading-none ${
                activeTab === tab.key ? 'text-brand' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};


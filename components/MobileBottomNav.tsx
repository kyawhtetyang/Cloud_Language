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
      label: 'Road Map',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M4 7h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6zM4 14h6"
          />
        </svg>
      ),
    },
    {
      key: 'lesson',
      label: 'Lesson',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M6 4h12v14H8a2 2 0 0 1-2-2V4Zm0 12h12M9 8h6"
          />
        </svg>
      ),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M19 12a7 7 0 0 0-.06-.94l2.01-1.57-1.6-2.77-2.38.96a7 7 0 0 0-1.63-.95l-.36-2.49h-3.2l-.36 2.49a7 7 0 0 0-1.63.95l-2.38-.96-1.6 2.77 2.01 1.57A7 7 0 0 0 5 12c0 .32.02.63.06.94l-2.01 1.57 1.6 2.77 2.38-.96c.5.41 1.05.73 1.63.95l.36 2.49h3.2l.36-2.49c.58-.22 1.13-.54 1.63-.95l2.38.96 1.6-2.77-2.01-1.57c.04-.31.06-.62.06-.94Z" />
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
                ? 'bg-[#ecf9df] text-[#2f7d01]'
                : 'bg-transparent text-gray-500'
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                activeTab === tab.key ? 'bg-[#58cc02] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[10px] font-bold leading-none ${
                activeTab === tab.key ? 'text-[#2f7d01]' : 'text-gray-500'
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

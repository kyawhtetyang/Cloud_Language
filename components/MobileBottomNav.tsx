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
      key: 'lesson',
      label: 'Lesson',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5A1.5 1.5 0 0 1 18.5 21H7a3 3 0 0 1-3-3V5.5Zm3 11.5c-.552 0-1 .448-1 1s.448 1 1 1h11V5H6.5A.5.5 0 0 0 6 5.5V17h1Z"
          />
        </svg>
      ),
    },
    {
      key: 'levels',
      label: 'Road Map',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 6a3 3 0 0 1 3-3h3v6H3V6Zm0 12v-6h6v9H6a3 3 0 0 1-3-3Zm9 3v-9h9v6a3 3 0 0 1-3 3h-6Zm0-18h6a3 3 0 0 1 3 3v3h-9V3Z"
          />
        </svg>
      ),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.32-.02-.63-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.08 7.08 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.89 2h-3.78a.5.5 0 0 0-.49.42l-.36 2.54c-.58.22-1.13.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.72 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.05.31-.07.62-.07.94 0 .31.02.63.07.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.41 1.05.72 1.63.94l.36 2.54c.04.24.25.42.49.42h3.78c.24 0 .45-.18.49-.42l.36-2.54c.58-.22 1.13-.53 1.63-.94l2.39.96c.22.09.48 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
          />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-gray-100">
      <div className="grid grid-cols-4 gap-1 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            aria-label={tab.label}
            title={tab.label}
            className={`flex items-center justify-center py-3 rounded-xl transition-all ${
              activeTab === tab.key
                ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
                : 'bg-white text-gray-500 border-2 border-gray-200'
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    </nav>
  );
};


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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-gray-100">
      <div className="grid grid-cols-4 gap-1 p-2">
        <button
          onClick={() => onTabChange('lesson')}
          className={`py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all ${
            activeTab === 'lesson'
              ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
              : 'bg-white text-gray-500 border-2 border-gray-200'
          }`}
        >
          Lesson
        </button>
        <button
          onClick={() => onTabChange('levels')}
          className={`py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all ${
            activeTab === 'levels'
              ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
              : 'bg-white text-gray-500 border-2 border-gray-200'
          }`}
        >
          Road Map
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all ${
            activeTab === 'settings'
              ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
              : 'bg-white text-gray-500 border-2 border-gray-200'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => onTabChange('profile')}
          className={`py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all ${
            activeTab === 'profile'
              ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
              : 'bg-white text-gray-500 border-2 border-gray-200'
          }`}
        >
          Profile
        </button>
      </div>
    </nav>
  );
};


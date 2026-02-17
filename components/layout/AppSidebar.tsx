import React from 'react';
import { SidebarTab } from '../../config/appConfig';

type AppSidebarProps = {
  isSidebarOpen: boolean;
  sidebarTab: SidebarTab;
  onClose: () => void;
  onSelectTab: (tab: SidebarTab) => void;
  onReload: () => void;
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isSidebarOpen,
  sidebarTab,
  onClose,
  onSelectTab,
  onReload,
}) => {
  const navClass = (active: boolean) =>
    `w-full px-3 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
      active
        ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
        : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-white border-r-2 border-[#dbe8cb] p-5 z-40 transform transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={onReload}
            className="flex items-center gap-2 text-lg font-extrabold text-[#3c3c3c] uppercase tracking-wide hover:opacity-80 transition-opacity"
            aria-label="Reload page"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#58cc02] shadow-[0_2px_0_0_#46a302]">
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <circle cx="8" cy="11" r="4" fill="white" />
                <circle cx="16" cy="11" r="4" fill="white" />
                <circle cx="8" cy="11" r="1.2" fill="#3c3c3c" />
                <circle cx="16" cy="11" r="1.2" fill="#3c3c3c" />
                <path d="M10.2 15h3.6l-1.8 2.2z" fill="#f59e0b" />
                <path d="M6.4 7.8l1.8-2 1.4 2z" fill="white" />
                <path d="M14.4 7.8l1.4-2 1.8 2z" fill="white" />
              </svg>
            </span>
            Duolingo
          </button>
          <button className="md:hidden text-gray-500 font-bold text-xl" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <button
            onClick={() => onSelectTab('lesson')}
            className={navClass(sidebarTab === 'lesson')}
          >
            Lesson
          </button>
          <button
            onClick={() => onSelectTab('levels')}
            className={navClass(sidebarTab === 'levels')}
          >
            Road Map
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={navClass(sidebarTab === 'settings')}
          >
            Settings
          </button>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => onSelectTab('profile')}
            className={`w-full px-3 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'profile'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
        </div>
      </div>
    </aside>
  );
};

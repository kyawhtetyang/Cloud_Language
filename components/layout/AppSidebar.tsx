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
        ? 'btn-selected'
        : 'btn-unselected'
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-white border-r-2 border-brand-border p-5 z-40 transform transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={onReload}
            className="flex items-center gap-2 text-lg font-extrabold text-ink uppercase tracking-wide hover:opacity-80 transition-opacity"
            aria-label="Reload page"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 btn-selected">
              <span className="text-sm font-extrabold leading-none">U</span>
            </span>
            Duolingo
          </button>
          <button className="md:hidden text-gray-500 font-bold text-xl" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <button
            onClick={() => onSelectTab('levels')}
            className={navClass(sidebarTab === 'levels')}
          >
            Library
          </button>
          <button
            onClick={() => onSelectTab('lesson')}
            className={navClass(sidebarTab === 'lesson')}
          >
            Lesson
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
                ? 'btn-selected'
                : 'btn-unselected'
            }`}
          >
            Profile
          </button>
        </div>
      </div>
    </aside>
  );
};




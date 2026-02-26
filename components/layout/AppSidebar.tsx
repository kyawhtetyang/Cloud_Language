import React from 'react';
import { SidebarTab } from '../../config/appConfig';
import { NAV_TAB_META } from '../nav/navConfig';

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
        ? 'btn-nav-selected'
        : 'btn-unselected text-[var(--text-secondary)]'
    }`;

  const renderNavButton = (tab: SidebarTab) => {
    const { label, Icon } = NAV_TAB_META[tab];
    const isActive = sidebarTab === tab;
    return (
      <button
        onClick={() => onSelectTab(tab)}
        className={navClass(isActive)}
      >
        <span className="flex items-center gap-2">
          <Icon isActive={isActive} className="h-4 w-4 shrink-0" />
          <span>{label}</span>
        </span>
      </button>
    );
  };

  const profileMeta = NAV_TAB_META.profile;
  const isProfileActive = sidebarTab === 'profile';
  const ProfileIcon = profileMeta.Icon;

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 border-r-2 border-brand-border bg-[var(--surface-default)] p-5 z-40 transform transition-transform md:translate-x-0 ${
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
          <button className="md:hidden text-[var(--text-secondary)] font-bold text-xl" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          {renderNavButton('levels')}
          {renderNavButton('lesson')}
          {renderNavButton('settings')}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => onSelectTab('profile')}
            className={`w-full px-3 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              isProfileActive
                ? 'btn-nav-selected'
                : 'btn-unselected text-[var(--text-secondary)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <ProfileIcon isActive={isProfileActive} className="h-4 w-4 shrink-0" />
              <span>{profileMeta.label}</span>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

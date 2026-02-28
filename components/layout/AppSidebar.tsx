import React from 'react';
import { SidebarTab } from '../../config/appConfig';
import { NAV_ICON_UI, NAV_LAYOUT_UI, NAV_TAB_META } from '../nav/navConfig';
import { BUTTON_UI, getSidebarNavButtonClass } from '../../config/buttonUi';
import { AppTextPack } from '../../config/appI18n';

type AppSidebarProps = {
  navText: AppTextPack['navigation'];
  isSidebarOpen: boolean;
  sidebarTab: SidebarTab;
  onClose: () => void;
  onSelectTab: (tab: SidebarTab) => void;
  onReload: () => void;
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  navText,
  isSidebarOpen,
  sidebarTab,
  onClose,
  onSelectTab,
  onReload,
}) => {
  const labelByTab: Record<SidebarTab, string> = {
    feed: navText.feedLabel,
    library: navText.libraryLabel,
    lesson: navText.lessonLabel,
    profile: navText.profileLabel,
    settings: navText.settingsLabel,
  };

  const renderNavButton = (tab: SidebarTab) => {
    const { Icon } = NAV_TAB_META[tab];
    const isActive = sidebarTab === tab;
    return (
      <button
        onClick={() => onSelectTab(tab)}
        className={getSidebarNavButtonClass(isActive)}
      >
        <span className={NAV_LAYOUT_UI.sidebarItemContentClass}>
          <Icon isActive={isActive} className={NAV_ICON_UI.sidebarSizeClass} />
          <span className={NAV_LAYOUT_UI.sidebarLabelClass}>{labelByTab[tab]}</span>
        </span>
      </button>
    );
  };

  const profileMeta = NAV_TAB_META.profile;
  const isProfileActive = sidebarTab === 'profile' || sidebarTab === 'settings';
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
            aria-label={navText.reloadPageAriaLabel}
          >
            <span className={BUTTON_UI.sidebarBrandIcon}>
              <span className="text-sm font-extrabold leading-none">U</span>
            </span>
            Duolingo
          </button>
          <button className={BUTTON_UI.sidebarCloseButton} onClick={onClose} aria-label={navText.closeAriaLabel}>
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          {renderNavButton('library')}
          {renderNavButton('lesson')}
          {renderNavButton('feed')}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => onSelectTab('profile')}
            className={getSidebarNavButtonClass(isProfileActive, true)}
          >
            <span className={NAV_LAYOUT_UI.sidebarItemContentClass}>
              <ProfileIcon isActive={isProfileActive} className={NAV_ICON_UI.sidebarSizeClass} />
              <span className={NAV_LAYOUT_UI.sidebarLabelClass}>{labelByTab.profile}</span>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

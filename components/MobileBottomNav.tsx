import React from 'react';
import { SidebarTab } from '../config/appConfig';
import { NAV_TAB_META, NAV_TABS } from './nav/navConfig';
import {
  getMobileNavButtonClass,
  getMobileNavIconWrapClass,
  getMobileNavLabelClass,
} from '../config/buttonUi';
import { AppTextPack } from '../config/appI18n';

type MobileBottomNavProps = {
  navText: AppTextPack['navigation'];
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isVisible?: boolean;
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  navText,
  activeTab,
  onTabChange,
  isVisible = true,
}) => {
  const labelByTab: Record<SidebarTab, string> = {
    library: navText.libraryLabel,
    lesson: navText.lessonLabel,
    profile: navText.profileLabel,
    settings: navText.settingsLabel,
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--surface-default)] backdrop-blur transition-all duration-200 ease-out md:hidden ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div
        className="grid gap-1 px-2 pb-2 pt-1.5"
        style={{ gridTemplateColumns: `repeat(${NAV_TABS.length}, minmax(0, 1fr))` }}
      >
        {NAV_TABS.map((tab) => {
          const { Icon } = NAV_TAB_META[tab];
          const label = labelByTab[tab];
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              aria-label={label}
              title={label}
              className={getMobileNavButtonClass(isActive)}
            >
              <span className={getMobileNavIconWrapClass(isActive)}>
                <Icon isActive={isActive} className="h-5 w-5" />
              </span>
              <span className={getMobileNavLabelClass(isActive)}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

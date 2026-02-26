import React from 'react';
import { SidebarTab } from '../config/appConfig';
import { NAV_TAB_META, NAV_TABS } from './nav/navConfig';

type MobileBottomNavProps = {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isVisible?: boolean;
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  isVisible = true,
}) => {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--surface-default)] backdrop-blur transition-all duration-200 ease-out md:hidden ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="grid grid-cols-4 gap-1 px-2 pb-2 pt-1.5">
        {NAV_TABS.map((tab) => {
          const { label, Icon } = NAV_TAB_META[tab];
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              aria-label={label}
              title={label}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-all ${
                isActive
                  ? 'bg-transparent text-brand'
                  : 'bg-transparent text-[var(--text-secondary)]'
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  isActive
                    ? 'bg-transparent text-brand shadow-none'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <Icon isActive={isActive} className="h-5 w-5" />
              </span>
              <span
                className={`text-xs font-bold leading-none ${
                  isActive ? 'text-brand' : 'text-[var(--text-secondary)]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

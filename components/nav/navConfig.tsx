import React from 'react';
import { SidebarTab } from '../../config/appConfig';

export type NavIconProps = {
  className?: string;
  isActive?: boolean;
};

type NavTabMeta = {
  label: string;
  Icon: React.FC<NavIconProps>;
};

const LibraryIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isActive && (
      <>
        <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H11v15H5.5A2.5 2.5 0 0 0 3 21.5z" fill="currentColor" stroke="none" />
        <path d="M21 6.5A2.5 2.5 0 0 0 18.5 4H13v15h5.5a2.5 2.5 0 0 1 2.5 2.5z" fill="currentColor" stroke="none" />
      </>
    )}
    <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H11v15H5.5A2.5 2.5 0 0 0 3 21.5z" />
    <path d="M21 6.5A2.5 2.5 0 0 0 18.5 4H13v15h5.5a2.5 2.5 0 0 1 2.5 2.5z" />
  </svg>
);

const LessonIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isActive && <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" />}
    <circle cx="12" cy="12" r="9" />
    <path d="M10 9.5v5l4-2.5z" fill={isActive ? '#fff' : 'currentColor'} stroke="none" />
  </svg>
);

const SettingsIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isActive && (
      <>
        <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="3.2" fill="#fff" stroke="none" />
      </>
    )}
    <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

const ProfileIcon: React.FC<NavIconProps> = ({ className, isActive = false }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isActive && (
      <>
        <circle cx="12" cy="8" r="4" fill="currentColor" stroke="none" />
        <path d="M5 20a7 7 0 0 1 14 0v1H5z" fill="currentColor" stroke="none" />
      </>
    )}
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" />
  </svg>
);

export const NAV_TABS: readonly SidebarTab[] = ['levels', 'lesson', 'settings', 'profile'] as const;

export const NAV_TAB_META: Record<SidebarTab, NavTabMeta> = {
  levels: {
    label: 'Library',
    Icon: LibraryIcon,
  },
  lesson: {
    label: 'Lesson',
    Icon: LessonIcon,
  },
  settings: {
    label: 'Settings',
    Icon: SettingsIcon,
  },
  profile: {
    label: 'Profile',
    Icon: ProfileIcon,
  },
};


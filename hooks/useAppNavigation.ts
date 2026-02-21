import { useEffect, useState } from 'react';
import { PROFILE_NAME_KEY, RELOAD_TO_LESSON_KEY, SidebarTab } from '../config/appConfig';

type UseAppNavigationResult = {
  isSidebarOpen: boolean;
  sidebarTab: SidebarTab;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarTab: React.Dispatch<React.SetStateAction<SidebarTab>>;
  closeSidebar: () => void;
  selectTab: (tab: SidebarTab) => void;
  reloadApp: () => void;
};

export function useAppNavigation(): UseAppNavigationResult {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>(() => {
    try {
      if (sessionStorage.getItem(RELOAD_TO_LESSON_KEY) === 'true') {
        sessionStorage.removeItem(RELOAD_TO_LESSON_KEY);
        return 'lesson';
      }
      if (localStorage.getItem(PROFILE_NAME_KEY)?.trim()) {
        return 'lesson';
      }
    } catch {
      // Ignore sessionStorage failures and use default.
    }
    return 'profile';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sidebarTab]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const selectTab = (tab: SidebarTab) => {
    setSidebarTab(tab);
    setIsSidebarOpen(false);
  };

  const reloadApp = () => {
    try {
      sessionStorage.setItem(RELOAD_TO_LESSON_KEY, 'true');
    } catch {
      // Ignore sessionStorage failures and proceed.
    }
    window.location.reload();
  };

  return {
    isSidebarOpen,
    sidebarTab,
    setIsSidebarOpen,
    setSidebarTab,
    closeSidebar,
    selectTab,
    reloadApp,
  };
}



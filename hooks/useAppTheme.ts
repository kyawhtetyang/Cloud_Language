import { useEffect } from 'react';
import { AppTheme } from '../config/appConfig';

export function useAppTheme(appTheme: AppTheme): void {
  useEffect(() => {
    const resolveTheme = (): AppTheme => {
      if (appTheme !== 'system') return appTheme;
      return 'apple_notes';
    };

    const applyTheme = () => {
      const resolvedTheme = resolveTheme();
      document.documentElement.setAttribute('data-app-theme', resolvedTheme);
    };

    applyTheme();
    if (appTheme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [appTheme]);
}


import React from 'react';
import { AppMode } from '../../config/appConfig';
import { LibraryView } from '../views/LibraryView';
import { LessonView } from '../views/LessonView';
import { ProfileView } from '../views/ProfileView';
import { SettingsView } from '../views/SettingsView';
import { CompletedView } from '../views/AppStateViews';
import { AppTextPack } from '../../config/appI18n';

type AppMainContentProps = {
  isProfileView: boolean;
  isLibraryView: boolean;
  isSettingsView: boolean;
  mode: AppMode;
  profileViewProps: React.ComponentProps<typeof ProfileView>;
  libraryViewProps: React.ComponentProps<typeof LibraryView>;
  settingsViewProps: React.ComponentProps<typeof SettingsView>;
  lessonViewProps: React.ComponentProps<typeof LessonView>;
  appStateText: AppTextPack['appState'];
  onCompletedRestart: () => void;
};

export const AppMainContent: React.FC<AppMainContentProps> = ({
  isProfileView,
  isLibraryView,
  isSettingsView,
  mode,
  profileViewProps,
  libraryViewProps,
  settingsViewProps,
  lessonViewProps,
  appStateText,
  onCompletedRestart,
}) => {
  const isMobileSheetViewport = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 767px)').matches;
  const isLessonSheetMode = !isProfileView
    && !isLibraryView
    && !isSettingsView
    && mode !== 'completed'
    && Boolean(libraryViewProps.selectedAlbumKey)
    && isMobileSheetViewport;

  return (
    <main className="relative flex-1 flex items-start justify-center p-4 pt-6 md:p-6 md:pt-8">
      {isProfileView ? (
        <ProfileView {...profileViewProps} />
      ) : isLibraryView ? (
        <LibraryView {...libraryViewProps} />
      ) : isSettingsView ? (
        <SettingsView {...settingsViewProps} />
      ) : mode === 'completed' ? (
        <CompletedView onRestart={onCompletedRestart} appStateText={appStateText} />
      ) : isLessonSheetMode ? (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto px-4 pb-4 pt-6 md:px-6 md:pb-6 md:pt-8">
            <div className="mx-auto w-full max-w-3xl">
              <LibraryView {...libraryViewProps} />
            </div>
          </div>
          <div className="absolute inset-0 z-20 overflow-y-auto px-4 pb-0 pt-3 md:px-6 md:pb-0 md:pt-6">
            <div className="mx-auto w-full max-w-3xl">
              <LessonView {...lessonViewProps} sheetMode />
            </div>
          </div>
        </div>
      ) : (
        <LessonView {...lessonViewProps} />
      )}
    </main>
  );
};

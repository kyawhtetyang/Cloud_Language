import React from 'react';
import { AppMode } from '../../config/appConfig';
import { FeedView } from '../views/FeedView';
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
  isFeedView: boolean;
  mode: AppMode;
  profileViewProps: React.ComponentProps<typeof ProfileView>;
  libraryViewProps: React.ComponentProps<typeof LibraryView>;
  settingsViewProps: React.ComponentProps<typeof SettingsView>;
  lessonViewProps: React.ComponentProps<typeof LessonView>;
  feedViewProps: React.ComponentProps<typeof FeedView>;
  appStateText: AppTextPack['appState'];
  onCompletedRestart: () => void;
};

export const AppMainContent: React.FC<AppMainContentProps> = ({
  isProfileView,
  isLibraryView,
  isSettingsView,
  isFeedView,
  mode,
  profileViewProps,
  libraryViewProps,
  settingsViewProps,
  lessonViewProps,
  feedViewProps,
  appStateText,
  onCompletedRestart,
}) => (
  <main className="flex-1 flex items-start justify-center p-4 pt-6 md:p-6 md:pt-8">
    {isProfileView ? (
      <ProfileView {...profileViewProps} />
    ) : isLibraryView ? (
      <LibraryView {...libraryViewProps} />
    ) : isSettingsView ? (
      <SettingsView {...settingsViewProps} />
    ) : isFeedView ? (
      <LessonView {...lessonViewProps} />
    ) : mode === 'completed' ? (
      <CompletedView onRestart={onCompletedRestart} appStateText={appStateText} />
    ) : (
      <LessonView {...lessonViewProps} />
    )}
  </main>
);

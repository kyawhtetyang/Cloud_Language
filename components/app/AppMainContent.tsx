import React from 'react';
import { AppMode } from '../../config/appConfig';
import { LevelsView } from '../views/LevelsView';
import { LessonView } from '../views/LessonView';
import { MatchReviewView } from '../views/MatchReviewView';
import { ProfileView } from '../views/ProfileView';
import { ResultView } from '../views/ResultView';
import { SettingsView } from '../views/SettingsView';
import { CompletedView } from '../views/AppStateViews';

type AppMainContentProps = {
  isProfileView: boolean;
  isLevelsView: boolean;
  isSettingsView: boolean;
  mode: AppMode;
  profileViewProps: React.ComponentProps<typeof ProfileView>;
  levelsViewProps: React.ComponentProps<typeof LevelsView>;
  settingsViewProps: React.ComponentProps<typeof SettingsView>;
  matchReviewViewProps: React.ComponentProps<typeof MatchReviewView>;
  resultViewProps: React.ComponentProps<typeof ResultView> | null;
  lessonViewProps: React.ComponentProps<typeof LessonView>;
  onCompletedRestart: () => void;
};

export const AppMainContent: React.FC<AppMainContentProps> = ({
  isProfileView,
  isLevelsView,
  isSettingsView,
  mode,
  profileViewProps,
  levelsViewProps,
  settingsViewProps,
  matchReviewViewProps,
  resultViewProps,
  lessonViewProps,
  onCompletedRestart,
}) => (
  <main className="flex-1 flex items-start justify-center p-4 pt-6 md:p-6 md:pt-8">
    {isProfileView ? (
      <ProfileView {...profileViewProps} />
    ) : isLevelsView ? (
      <LevelsView {...levelsViewProps} />
    ) : isSettingsView ? (
      <SettingsView {...settingsViewProps} />
    ) : mode === 'quiz' ? (
      <MatchReviewView {...matchReviewViewProps} />
    ) : mode === 'result' && resultViewProps ? (
      <ResultView {...resultViewProps} />
    ) : mode === 'completed' ? (
      <CompletedView onRestart={onCompletedRestart} />
    ) : (
      <LessonView {...lessonViewProps} />
    )}
  </main>
);


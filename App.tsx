import React, { useRef, useState } from 'react';
import { useProfileProgress } from './hooks/useProfileProgress';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppPreferences } from './hooks/useAppPreferences';
import { useLessonUnitState } from './hooks/useLessonUnitState';
import { useLessonBatchGroups } from './hooks/useLessonBatchGroups';
import { useAppContentState } from './hooks/useAppContentState';
import { useCourseNavigationState } from './hooks/useCourseNavigationState';
import { useAppProfileSettingsSync } from './hooks/useAppProfileSettingsSync';
import { useAppTheme } from './hooks/useAppTheme';
import { useLessonHighlights } from './hooks/useLessonHighlights';
import { useTrackPlayback } from './hooks/useTrackPlayback';
import { useAppActions } from './hooks/useAppActions';
import { useAppLifecycle } from './hooks/useAppLifecycle';
import { useAppViewProps } from './hooks/useAppViewProps';
import { useUnitLeaveGuards } from './hooks/useUnitLeaveGuards';
import { RepeatMode, useUnitNavigation } from './hooks/useUnitNavigation';
import { AppDialogs } from './components/app/AppDialogs';
import { AppMainContent } from './components/app/AppMainContent';
import { AppBottomBars } from './components/app/AppBottomBars';
import {
  AppMode,
  DEFAULT_PROGRESS_INDEX,
  SidebarTab,
  DefaultLanguage,
  DEFAULT_STREAK,
  DEFAULT_UNLOCKED_LEVEL,
  getLessonUnitId,
  getPlayableLessonText,
  PROFILE_NAME_KEY,
  toProfileStorageId,
} from './config/appConfig';
import { AppSidebar } from './components/layout/AppSidebar';
import {
  LessonsUnavailableView,
  LoadingView,
  WelcomeView,
} from './components/views/AppStateViews';
import { getAppText } from './config/appI18n';

const App: React.FC = () => {
  const lastLibraryTabTapAtRef = useRef(0);
  const {
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    setProfileName,
    setProfileInput,
    applyProfileName,
  } = useProfileProgress(PROFILE_NAME_KEY);
  const [currentIndex, setCurrentIndex] = useState(DEFAULT_PROGRESS_INDEX);
  const [mode, setMode] = useState<AppMode>('learn');
  const [unlockedLevel, setUnlockedLevel] = useState(DEFAULT_UNLOCKED_LEVEL);
  const [streak, setStreak] = useState(DEFAULT_STREAK);
  const {
    isSidebarOpen,
    sidebarTab,
    setIsSidebarOpen,
    setSidebarTab,
    closeSidebar,
    selectTab,
    reloadApp,
  } = useAppNavigation();
  const profileStorageId = profileName ? toProfileStorageId(profileName) : '';
  const {
    isPronunciationEnabled,
    setIsPronunciationEnabled,
    learnLanguage,
    setLearnLanguage,
    defaultLanguage,
    setDefaultLanguage,
    isEnglishUiLocked,
    setIsEnglishUiLocked,
    textScalePercent,
    setTextScalePercent,
    isBoldTextEnabled,
    setIsBoldTextEnabled,
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    setIsRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    setIsReviewQuestionsRemoved,
    appTheme,
    setAppTheme,
    voiceProvider,
    setVoiceProvider,
    hasHydratedSettings,
  } = useAppPreferences(profileStorageId);
  const effectiveDefaultLanguage: DefaultLanguage = isEnglishUiLocked ? 'english' : defaultLanguage;
  const [learnStep, setLearnStep] = useState(0);
  const [completedUnitKeys, setCompletedUnitKeys] = useState<Set<string>>(new Set());
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [pendingAutoPlayUnitKey, setPendingAutoPlayUnitKey] = useState<string | null>(null);

  const [librarySelectedAlbumKey, setLibrarySelectedAlbumKey] = useState<string | null>(null);
  const [randomOrderVersion, setRandomOrderVersion] = useState(0);
  const {
    apiBaseUrl,
    lessons,
    loading,
    errorMessage,
    downloadedUnitKeys,
    downloadUnitPack,
    removeUnitPack,
    isUnitDownloading,
    totalLevels,
    englishReferenceByKey,
    leaveCompletedUnitModalTitle,
    leaveCompletedUnitConfirmMessage,
    leaveCompletedUnitCancelLabel,
    leaveCompletedUnitConfirmLabel,
  } = useAppContentState({
    learnLanguage,
    defaultLanguage: effectiveDefaultLanguage,
  });
  const { highlightPhrasesByLessonKey, saveHighlightSelection, clearHighlightSelection } = useLessonHighlights(
    profileStorageId,
    learnLanguage,
  );
  const { markHydrationStale } = useAppProfileSettingsSync({
    apiBaseUrl,
    lessons,
    profileName,
    profileStorageId,
    mode,
    currentIndex,
    unlockedLevel,
    streak,
    totalLevels,
    hasHydratedSettings,
    learnLanguage,
    defaultLanguage,
    isEnglishUiLocked,
    isPronunciationEnabled,
    textScalePercent,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    voiceProvider,
    setCurrentIndex,
    setUnlockedLevel,
    setStreak,
    setLearnLanguage,
    setDefaultLanguage,
    setIsEnglishUiLocked,
    setIsPronunciationEnabled,
    setTextScalePercent,
    setIsBoldTextEnabled,
    setIsAutoScrollEnabled,
    setIsRandomLessonOrderEnabled,
    setIsReviewQuestionsRemoved,
    setAppTheme,
    setVoiceProvider,
  });
  const {
    currentLevel,
    currentUnit,
    currentCourseCode,
    orderedUnitIndexes,
    sectionStart,
    sectionEnd,
    sectionTotal,
    currentBatchEntries,
  } = useLessonUnitState({
    lessons,
    mode,
    currentIndex,
    learnStep,
    isRandomLessonOrderEnabled,
    randomOrderVersion,
  });
  const {
    currentStageCode,
    currentStageRange,
    orderedCourseUnitStartIndexes,
    playableCourseUnitKeys,
  } = useCourseNavigationState({
    lessons,
    currentIndex,
    currentLevel,
    sectionStart,
  });
  const lessonBatchGroups = useLessonBatchGroups({
    lessons,
    orderedUnitIndexes,
    sectionTotal,
  });
  const {
    isReading,
    activeSpeakingLessonIndex,
    isTrackPlaybackRef,
    lastPlayAnchorLessonIndexRef,
    unitPlaybackStartedAtRef,
    setTrackPlaybackEnabled,
    stopActivePlayback,
    interruptPlaybackImmediately,
    playEntriesSequentially,
    playSingleEntry,
    resetUnitPlaybackAnchor,
  } = useTrackPlayback({
    mode,
    learnLanguage,
    voiceProvider,
  });

  useAppTheme(appTheme);

  const {
    isNextDisabled,
    continueTrackPlaybackIfNeeded,
    handleNext,
    handlePrevious,
    navigateToLibraryUnit,
  } = useUnitNavigation({
    mode,
    repeatMode,
    lessons,
    totalLevels,
    sectionStart,
    sectionEnd,
    currentStageCode,
    currentStageRange,
    orderedUnitIndexes,
    orderedCourseUnitStartIndexes,
    playableCourseUnitKeys,
    activeSpeakingLessonIndex,
    isTrackPlaybackRef,
    lastPlayAnchorLessonIndexRef,
    unitPlaybackStartedAtRef,
    stopActivePlayback,
    setTrackPlaybackEnabled,
    resetUnitPlaybackAnchor,
    setMode,
    setCurrentIndex,
    setLearnStep,
    setUnlockedLevel,
    setPendingAutoPlayUnitKey,
    setRandomOrderVersion,
    setLibrarySelectedAlbumKey,
    setSidebarTab,
    setIsSidebarOpen,
  });

  const {
    getCurrentUnitSpeakEntries,
    handlePlaySingleLesson,
    handleReadCurrentBatch,
    handleLogoutConfirm,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAppActions({
    mode,
    lessons,
    orderedUnitIndexes,
    isReading,
    activeSpeakingLessonIndex,
    lastPlayAnchorLessonIndexRef,
    unitPlaybackStartedAtRef,
    continueTrackPlaybackIfNeeded,
    stopActivePlayback,
    playEntriesSequentially,
    playSingleEntry,
    setTrackPlaybackEnabled,
    interruptPlaybackImmediately,
    resetUnitPlaybackAnchor,
    setIsLogoutModalOpen,
    setProfileName,
    setProfileInput,
    setMode,
    setCurrentIndex,
    setLearnStep,
    setCompletedUnitKeys,
    setLibrarySelectedAlbumKey,
    setPendingAutoPlayUnitKey,
    setRepeatMode,
    setSidebarTab,
    setIsSidebarOpen,
    setRandomOrderVersion,
    setIsRandomLessonOrderEnabled,
    currentLevel,
    currentUnit,
  });
  const {
    learnStepCount,
    isMobileBottomBarsVisible,
    handleApplyProfileName,
    handleSelectLessonStep,
    handleReadLibraryAlbum,
    handleRestartCourse,
  } = useAppLifecycle({
    defaultLanguage: effectiveDefaultLanguage,
    mode,
    sidebarTab,
    currentLevel,
    currentUnit,
    sectionStart,
    sectionTotal,
    lessons,
    totalLevels,
    orderedUnitIndexes,
    pendingAutoPlayUnitKey,
    isReading,
    activeSpeakingLessonIndex,
    continueTrackPlaybackIfNeeded,
    getCurrentUnitSpeakEntries,
    playEntriesSequentially,
    stopActivePlayback,
    setTrackPlaybackEnabled,
    resetUnitPlaybackAnchor,
    applyProfileName,
    markHydrationStale,
    setMode,
    setSidebarTab,
    setIsSidebarOpen,
    setRandomOrderVersion,
    setPendingAutoPlayUnitKey,
    setCurrentIndex,
    setLearnStep,
    setUnlockedLevel,
    setLibrarySelectedAlbumKey,
  });

  const {
    isLeaveCompletedUnitModalOpen,
    goToLibraryUnit,
    handleLeaveCompletedUnitCancel,
    handleLeaveCompletedUnitConfirm,
  } = useUnitLeaveGuards({
    mode,
    currentLevel,
    currentUnit,
    learnStep,
    learnStepCount,
    completedUnitKeys,
    navigateToLibraryUnit,
    setSidebarTab,
    setIsSidebarOpen,
  });
  const appText = getAppText(effectiveDefaultLanguage);
  const welcomeText = getAppText(effectiveDefaultLanguage).welcome;

  if (loading) {
    return <LoadingView label={appText.appState.loadingLessonsLabel} />;
  }

  if (errorMessage || lessons.length === 0) {
    return (
      <LessonsUnavailableView
        appStateText={appText.appState}
        errorMessage={errorMessage}
        apiBaseUrl={apiBaseUrl}
      />
    );
  }

  if (!profileName) {
    return (
      <WelcomeView
        welcomeText={welcomeText}
        profileInput={profileInput}
        profileError={profileError}
        hasProfileWhitespace={hasProfileWhitespace}
        isProfileInputValid={isProfileInputValid}
        onProfileInputChange={setProfileInput}
        onApplyProfileName={handleApplyProfileName}
      />
    );
  }

  const handleMobileTabChange = (tab: SidebarTab) => {
    if (tab === 'library' && sidebarTab === 'library') {
      const now = Date.now();
      const isDoubleTap = (now - lastLibraryTabTapAtRef.current) <= 450;
      lastLibraryTabTapAtRef.current = now;
      if (isDoubleTap) {
        setLibrarySelectedAlbumKey(null);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }
    lastLibraryTabTapAtRef.current = 0;
    const isLessonRevisionSwitch = (
      (sidebarTab === 'lesson' && tab === 'feed')
      || (sidebarTab === 'feed' && tab === 'lesson')
    );
    if (isLessonRevisionSwitch) {
      setTrackPlaybackEnabled(false);
      resetUnitPlaybackAnchor();
      if (isReading || activeSpeakingLessonIndex !== null) {
        void stopActivePlayback();
      }
    }
    selectTab(tab);
  };

  const handleReadForActiveTab = async () => {
    const isRevisionTab = sidebarTab === 'feed' && mode === 'learn';
    if (!isRevisionTab) {
      await handleReadCurrentBatch();
      return;
    }

    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
      return;
    }

    setTrackPlaybackEnabled(false);
    const revisionEntries = currentBatchEntries
      .slice(0, 3)
      .map(({ lesson, lessonIndex }) => {
        const speakTextValue = getPlayableLessonText(lesson);
        if (!speakTextValue) return null;
        return {
          text: speakTextValue,
          unitId: getLessonUnitId(lesson),
          audioUrl: lesson.audioPath,
          lessonIndex,
        };
      })
      .filter((entry): entry is {
        text: string;
        unitId: number;
        audioUrl: string | undefined;
        lessonIndex: number;
      } => entry !== null);

    if (revisionEntries.length === 0) return;
    await playEntriesSequentially(revisionEntries);
  };

  const {
    isLibraryView,
    isProfileView,
    isFeedView,
    isSettingsView,
    showLessonActions,
    showLibraryMiniPlayer,
    leaveCompletedUnitModalProps,
    logoutModalProps,
    profileViewProps,
    libraryViewProps,
    settingsViewProps,
    lessonViewProps,
    feedViewProps,
    lessonActionFooterProps,
    libraryMiniPlayerProps,
    mobileBottomNavProps,
    appStateText,
  } = useAppViewProps({
    defaultLanguage: effectiveDefaultLanguage,
    selectedDefaultLanguage: defaultLanguage,
    currentIndex,
    lessons,
    currentLevel,
    currentUnit,
    mode,
    completedUnitKeys,
    sidebarTab,
    isLeaveCompletedUnitModalOpen,
    leaveCompletedUnitModalTitle,
    leaveCompletedUnitConfirmMessage,
    leaveCompletedUnitCancelLabel,
    leaveCompletedUnitConfirmLabel,
    handleLeaveCompletedUnitCancel,
    handleLeaveCompletedUnitConfirm,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    handleLogoutConfirm,
    profileName,
    profileStorageId,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    currentCourseCode,
    setProfileInput,
    handleApplyProfileName,
    setSidebarTab,
    setIsSidebarOpen,
    learnLanguage,
    goToLibraryUnit,
    handleReadLibraryAlbum,
    librarySelectedAlbumKey,
    setLibrarySelectedAlbumKey,
    downloadedUnitKeys,
    downloadUnitPack,
    removeUnitPack,
    isUnitDownloading,
    isPronunciationEnabled,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    textScalePercent,
    appTheme,
    voiceProvider,
    setDefaultLanguage,
    isEnglishUiLocked,
    setIsEnglishUiLocked,
    setLearnLanguage,
    setIsPronunciationEnabled,
    setIsBoldTextEnabled,
    setIsAutoScrollEnabled,
    setTextScalePercent,
    setAppTheme,
    setVoiceProvider,
    learnStepCount,
    currentBatchEntries,
    lessonBatchGroups,
    learnStep,
    isReading,
    handleSelectLessonStep,
    englishReferenceByKey,
    activeSpeakingLessonIndex,
    handlePlaySingleLesson,
    stopActivePlayback,
    highlightPhrasesByLessonKey,
    saveHighlightSelection,
    clearHighlightSelection,
    repeatMode,
    isNextDisabled,
    sectionEnd,
    currentStageRange,
    orderedUnitIndexes,
    isRandomLessonOrderEnabled,
    isMobileBottomBarsVisible,
    handleToggleShuffle,
    handleToggleRepeat,
    handlePrevious,
    handleReadCurrentBatch: handleReadForActiveTab,
    handleNext,
    selectTab: handleMobileTabChange,
  });
  const mobileBottomPaddingClass = isFeedView ? 'pb-0' : (showLibraryMiniPlayer ? 'pb-56' : 'pb-36');
  const desktopBottomPaddingClass = isFeedView ? 'md:pb-0' : 'md:pb-32';

  return (
    <div className="min-h-screen bg-app-radial md:flex">
      <AppDialogs
        leaveCompletedUnitModalProps={leaveCompletedUnitModalProps}
        logoutModalProps={logoutModalProps}
        isSidebarOpen={isSidebarOpen}
        closeSidebarAriaLabel={appText.navigation.closeAriaLabel}
        onDismissSidebarOverlay={() => setIsSidebarOpen(false)}
      />

      <AppSidebar
        navText={appText.navigation}
        isSidebarOpen={isSidebarOpen}
        sidebarTab={sidebarTab}
        onClose={closeSidebar}
        onSelectTab={handleMobileTabChange}
        onReload={reloadApp}
      />

      <div className={`flex-1 flex flex-col min-h-screen ${mobileBottomPaddingClass} md:ml-72 ${desktopBottomPaddingClass}`}>
        <AppMainContent
          isProfileView={isProfileView}
          isLibraryView={isLibraryView}
          isFeedView={isFeedView}
          isSettingsView={isSettingsView}
          mode={mode}
          profileViewProps={profileViewProps}
          libraryViewProps={libraryViewProps}
          settingsViewProps={settingsViewProps}
          lessonViewProps={lessonViewProps}
          feedViewProps={feedViewProps}
          appStateText={appStateText}
          onCompletedRestart={handleRestartCourse}
        />

        <AppBottomBars
          showLessonActions={showLessonActions}
          showLibraryMiniPlayer={showLibraryMiniPlayer}
          lessonActionFooterProps={lessonActionFooterProps}
          libraryMiniPlayerProps={libraryMiniPlayerProps}
          mobileBottomNavProps={mobileBottomNavProps}
        />
      </div>
    </div>
  );
};

export default App;

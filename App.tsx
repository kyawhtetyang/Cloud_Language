import React, { useEffect, useRef, useState } from 'react';
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
import { useReviewEventLogger } from './hooks/useReviewEventLogger';
import { useTrackPlayback } from './hooks/useTrackPlayback';
import { useAppActions } from './hooks/useAppActions';
import { useAppLifecycle } from './hooks/useAppLifecycle';
import { useAppViewProps } from './hooks/useAppViewProps';
import { useUnitLeaveGuards } from './hooks/useUnitLeaveGuards';
import { RepeatMode, useUnitNavigation } from './hooks/useUnitNavigation';
import { useAppInteractionHandlers } from './hooks/useAppInteractionHandlers';
import { AppDialogs } from './components/app/AppDialogs';
import { AppMainContent } from './components/app/AppMainContent';
import { AppBottomBars } from './components/app/AppBottomBars';
import {
  AppMode,
  coerceLessonLineVisibility,
  coerceFrameworkForLearnLanguage,
  DEFAULT_LIBRARY_VIEW_MODE,
  DEFAULT_PROGRESS_INDEX,
  DEFAULT_STREAK,
  DEFAULT_UNLOCKED_LEVEL,
  LibraryViewMode,
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
    isLearningLanguageVisible,
    setIsLearningLanguageVisible,
    isTranslationVisible,
    setIsTranslationVisible,
    learnLanguage,
    setLearnLanguage,
    defaultLanguage,
    setDefaultLanguage,
    uiLockLanguage,
    setUiLockLanguage,
    courseFramework,
    setCourseFramework,
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
  const effectiveUiLanguage = uiLockLanguage === 'off' ? defaultLanguage : uiLockLanguage;
  const [learnStep, setLearnStep] = useState(0);
  const [completedUnitKeys, setCompletedUnitKeys] = useState<Set<string>>(new Set());
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [pendingAutoPlayUnitKey, setPendingAutoPlayUnitKey] = useState<string | null>(null);
  const [isChatComposerFocused, setIsChatComposerFocused] = useState(false);

  const [librarySelectedAlbumKey, setLibrarySelectedAlbumKey] = useState<string | null>(null);
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>(DEFAULT_LIBRARY_VIEW_MODE);
  const [bookmarkedUnitKeys, setBookmarkedUnitKeys] = useState<Set<string>>(new Set());
  const [bookmarkedAlbumKeys, setBookmarkedAlbumKeys] = useState<Set<string>>(new Set());
  const [randomOrderVersion, setRandomOrderVersion] = useState(0);

  useEffect(() => {
    setBookmarkedUnitKeys(new Set());
    setBookmarkedAlbumKeys(new Set());
  }, [profileStorageId]);

  useEffect(() => {
    if (sidebarTab !== 'feed' && isChatComposerFocused) {
      setIsChatComposerFocused(false);
    }
  }, [sidebarTab, isChatComposerFocused]);

  useEffect(() => {
    const normalizedFramework = coerceFrameworkForLearnLanguage(courseFramework, learnLanguage);
    if (normalizedFramework !== courseFramework) {
      setCourseFramework(normalizedFramework);
    }
  }, [courseFramework, learnLanguage, setCourseFramework]);

  useEffect(() => {
    const normalized = coerceLessonLineVisibility(isPronunciationEnabled, isLearningLanguageVisible);
    if (normalized.isPronunciationEnabled !== isPronunciationEnabled) {
      setIsPronunciationEnabled(normalized.isPronunciationEnabled);
    }
    if (normalized.isLearningLanguageVisible !== isLearningLanguageVisible) {
      setIsLearningLanguageVisible(normalized.isLearningLanguageVisible);
    }
  }, [
    isPronunciationEnabled,
    isLearningLanguageVisible,
    setIsPronunciationEnabled,
    setIsLearningLanguageVisible,
  ]);

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
    courseFramework,
    defaultLanguage: effectiveUiLanguage,
  });
  const { logReviewEvent } = useReviewEventLogger({
    apiBaseUrl,
    profileName,
    learnLanguage,
  });
  const { highlightPhrasesByLessonKey, saveHighlightSelection, clearHighlightSelection } = useLessonHighlights({
    apiBaseUrl,
    profileName,
    profileStorageId,
    learnLanguage,
    logReviewEvent,
  });
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
    uiLockLanguage,
    courseFramework,
    isPronunciationEnabled,
    isLearningLanguageVisible,
    isTranslationVisible,
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
    setUiLockLanguage,
    setCourseFramework,
    setIsPronunciationEnabled,
    setIsLearningLanguageVisible,
    setIsTranslationVisible,
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
    learnLanguage,
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
    learnLanguage,
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
    logReviewEvent,
  });
  const {
    learnStepCount,
    isMobileBottomBarsVisible,
    handleApplyProfileName,
    handleSelectLessonStep,
    handleReadLibraryAlbum,
    handleRestartCourse,
  } = useAppLifecycle({
    defaultLanguage: effectiveUiLanguage,
    learnLanguage,
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
  const appText = getAppText(effectiveUiLanguage);
  const welcomeText = getAppText(effectiveUiLanguage).welcome;
  const {
    handleMobileTabChange,
    handleOpenProfileAlbumLibrary,
    handleToggleUnitBookmark,
    handleToggleAlbumBookmark,
    handleLearnLanguageChangeWithStop,
    handleVoiceProviderChangeWithStop,
    handleCourseFrameworkChangeWithStop,
    handleReadForActiveTab,
  } = useAppInteractionHandlers({
    lastLibraryTabTapAtRef,
    sidebarTab,
    mode,
    isReading,
    activeSpeakingLessonIndex,
    setLibraryViewMode,
    setLibrarySelectedAlbumKey,
    setSidebarTab,
    setIsSidebarOpen,
    setBookmarkedUnitKeys,
    setBookmarkedAlbumKeys,
    setTrackPlaybackEnabled,
    resetUnitPlaybackAnchor,
    stopActivePlayback,
    selectTab,
    learnLanguage,
    setLearnLanguage,
    voiceProvider,
    setVoiceProvider,
    courseFramework,
    setCourseFramework,
    handleReadCurrentBatch,
    currentBatchEntries,
    playEntriesSequentially,
  });

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
    chatViewProps,
    lessonViewProps,
    lessonActionFooterProps,
    libraryMiniPlayerProps,
    mobileBottomNavProps,
    appStateText,
  } = useAppViewProps({
    defaultLanguage: effectiveUiLanguage,
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
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    currentCourseCode,
    setProfileInput,
    handleApplyProfileName,
    handleOpenProfileAlbumLibrary,
    setSidebarTab,
    setIsSidebarOpen,
    learnLanguage,
    courseFramework,
    goToLibraryUnit,
    handleReadLibraryAlbum,
    librarySelectedAlbumKey,
    libraryViewMode,
    setLibrarySelectedAlbumKey,
    downloadedUnitKeys,
    bookmarkedUnitKeys,
    bookmarkedAlbumKeys,
    downloadUnitPack,
    removeUnitPack,
    isUnitDownloading,
    onToggleUnitBookmark: handleToggleUnitBookmark,
    onToggleAlbumBookmark: handleToggleAlbumBookmark,
    isPronunciationEnabled,
    isLearningLanguageVisible,
    isTranslationVisible,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    textScalePercent,
    appTheme,
    voiceProvider,
    setDefaultLanguage,
    uiLockLanguage,
    setUiLockLanguage,
    setLearnLanguage: handleLearnLanguageChangeWithStop,
    setCourseFramework: handleCourseFrameworkChangeWithStop,
    setIsPronunciationEnabled,
    setIsLearningLanguageVisible,
    setIsTranslationVisible,
    setIsBoldTextEnabled,
    setIsAutoScrollEnabled,
    setTextScalePercent,
    setAppTheme,
    setVoiceProvider: handleVoiceProviderChangeWithStop,
    learnStepCount,
    currentBatchEntries,
    lessonBatchGroups,
    learnStep,
    isReading,
    handleSelectLessonStep,
    englishReferenceByKey,
    activeSpeakingLessonIndex,
    handlePlaySingleLesson,
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
    isChatComposerFocused,
    handleToggleShuffle,
    handleToggleRepeat,
    handlePrevious,
    handleReadCurrentBatch: handleReadForActiveTab,
    handleNext,
    selectTab: handleMobileTabChange,
    setIsChatComposerFocused,
  });
  const mobileBottomPaddingClass = showLibraryMiniPlayer ? 'pb-56' : 'pb-36';
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
          chatViewProps={chatViewProps}
          lessonViewProps={lessonViewProps}
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

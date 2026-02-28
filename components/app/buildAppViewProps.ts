import {
  AppMode,
  AppTheme,
  buildStageUnitsFromLessons,
  DefaultLanguage,
  getLessonOrderIndex,
  getLessonUnitId,
  LibraryViewMode,
  LearnLanguage,
  SidebarTab,
  VoiceProvider,
} from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { localizeLibraryTopic } from '../../config/libraryI18n';
import { LessonData } from '../../types';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type BuildAppViewPropsArgs = {
  defaultLanguage: DefaultLanguage;
  selectedDefaultLanguage: DefaultLanguage;
  currentIndex: number;
  lessons: LessonData[];
  currentLevel: number;
  currentUnit: number;
  mode: AppMode;
  completedUnitKeys: Set<string>;
  sidebarTab: SidebarTab;
  isLeaveCompletedUnitModalOpen: boolean;
  leaveCompletedUnitModalTitle: string;
  leaveCompletedUnitConfirmMessage: string;
  leaveCompletedUnitCancelLabel: string;
  leaveCompletedUnitConfirmLabel: string;
  onLeaveCompletedUnitCancel: () => void;
  onLeaveCompletedUnitConfirm: () => void;
  isLogoutModalOpen: boolean;
  onCloseLogoutModal: () => void;
  onConfirmLogoutModal: () => void;
  profileName: string;
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  currentCourseCode: string;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
  onOpenCurrentCourse: () => void;
  onOpenDownloadedLessons: () => void;
  onOpenSettings: () => void;
  onRequestLogout: () => void;
  learnLanguage: LearnLanguage;
  onSelectUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onReadAlbum: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  selectedAlbumKey: string | null;
  libraryViewMode: LibraryViewMode;
  onSelectedAlbumKeyChange: (key: string | null) => void;
  downloadedUnitKeys: Set<string>;
  onDownloadUnit: (level: number, unit: number) => void;
  onRemoveUnitDownload: (level: number, unit: number) => void;
  isUnitDownloading: (level: number, unit: number) => boolean;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  textScalePercent: number;
  appTheme: AppTheme;
  voiceProvider: VoiceProvider;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  isEnglishUiLocked: boolean;
  onToggleEnglishUiLock: () => void;
  onLearnLanguageChange: (value: LearnLanguage) => void;
  onTogglePronunciation: () => void;
  onToggleBoldText: () => void;
  onToggleAutoScroll: () => void;
  onDecreaseTextSize: () => void;
  onIncreaseTextSize: () => void;
  onAppThemeChange: (value: AppTheme) => void;
  onVoiceProviderChange: (value: VoiceProvider) => void;
  onBackToProfile: () => void;
  learnStepCount: number;
  currentBatchEntries: LessonEntry[];
  lessonBatchGroups: LessonEntry[][];
  learnStep: number;
  isReading: boolean;
  onSelectLessonStep: (step: number) => void | Promise<void>;
  englishReferenceByKey: Map<string, string>;
  activeSpeakingLessonIndex: number | null;
  onPlayLesson: (lesson: LessonData, lessonIndex: number) => void;
  savedHighlightPhrasesByLessonKey: Map<string, string[]>;
  onSaveLessonHighlight: (lesson: LessonData, selectedText: string) => boolean;
  onClearLessonHighlight: (lesson: LessonData) => boolean;
  repeatMode: 'off' | 'all' | 'one';
  isNextDisabled: boolean;
  sectionEnd: number;
  currentStageRange: { start: number; end: number };
  orderedUnitIndexes: number[];
  isRandomLessonOrderEnabled: boolean;
  isMobileBottomBarsVisible: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPrevious: () => void;
  onReadCurrentBatch: () => void;
  onNext: () => void;
  onMobileTabChange: (tab: SidebarTab) => void;
};

export function buildAppViewProps({
  defaultLanguage,
  selectedDefaultLanguage,
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
  onLeaveCompletedUnitCancel,
  onLeaveCompletedUnitConfirm,
  isLogoutModalOpen,
  onCloseLogoutModal,
  onConfirmLogoutModal,
  profileName,
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  currentCourseCode,
  onProfileInputChange,
  onApplyProfileName,
  onOpenCurrentCourse,
  onOpenDownloadedLessons,
  onOpenSettings,
  onRequestLogout,
  learnLanguage,
  onSelectUnit,
  onReadAlbum,
  selectedAlbumKey,
  libraryViewMode,
  onSelectedAlbumKeyChange,
  downloadedUnitKeys,
  onDownloadUnit,
  onRemoveUnitDownload,
  isUnitDownloading,
  isPronunciationEnabled,
  isBoldTextEnabled,
  isAutoScrollEnabled,
  textScalePercent,
  appTheme,
  voiceProvider,
  onDefaultLanguageChange,
  isEnglishUiLocked,
  onToggleEnglishUiLock,
  onLearnLanguageChange,
  onTogglePronunciation,
  onToggleBoldText,
  onToggleAutoScroll,
  onDecreaseTextSize,
  onIncreaseTextSize,
  onAppThemeChange,
  onVoiceProviderChange,
  onBackToProfile,
  learnStepCount,
  currentBatchEntries,
  lessonBatchGroups,
  learnStep,
  isReading,
  onSelectLessonStep,
  englishReferenceByKey,
  activeSpeakingLessonIndex,
  onPlayLesson,
  savedHighlightPhrasesByLessonKey,
  onSaveLessonHighlight,
  onClearLessonHighlight,
  repeatMode,
  isNextDisabled,
  sectionEnd,
  currentStageRange,
  orderedUnitIndexes,
  isRandomLessonOrderEnabled,
  isMobileBottomBarsVisible,
  onToggleShuffle,
  onToggleRepeat,
  onPrevious,
  onReadCurrentBatch,
  onNext,
  onMobileTabChange,
}: BuildAppViewPropsArgs) {
  const appText = getAppText(defaultLanguage);
  const totalLessonsCount = lessons.length;
  const completedLessonsCount = Math.min(currentIndex + 1, totalLessonsCount);
  const overallProgressPercent = totalLessonsCount > 0
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
    : 0;
  const activeUnitKey = `${currentLevel}:${currentUnit}`;
  const stageUnits = buildStageUnitsFromLessons(lessons).sort((a, b) => a.level - b.level || a.unit - b.unit);
  const completedLibraryKeys =
    mode === 'completed'
      ? new Set(stageUnits.map((item) => `${item.level}:${item.unit}`))
      : completedUnitKeys;
  const isLibraryView = sidebarTab === 'library';
  const isProfileView = sidebarTab === 'profile';
  const isLessonView = sidebarTab === 'lesson';
  const isFeedView = sidebarTab === 'feed' && mode === 'learn';
  const isSettingsView = sidebarTab === 'settings';
  const showLessonActions = isLessonView || isFeedView;
  const activeOrCurrentLesson = (
    typeof activeSpeakingLessonIndex === 'number'
      ? lessons[activeSpeakingLessonIndex]
      : null
  ) || currentBatchEntries[0]?.lesson || lessons[currentIndex] || null;
  const showLibraryMiniPlayer = isLibraryView && Boolean(activeOrCurrentLesson);
  const activeOrCurrentUnitCode = activeOrCurrentLesson
    ? `${Math.max(1, getLessonOrderIndex(activeOrCurrentLesson))}.${Math.max(1, getLessonUnitId(activeOrCurrentLesson))}`
    : '';
  const miniPlayerTrackTitle = (activeOrCurrentLesson?.english || '').trim();
  const miniPlayerTrackMeta = activeOrCurrentLesson
    ? `${activeOrCurrentUnitCode} · ${localizeLibraryTopic(activeOrCurrentLesson.topic, defaultLanguage)}`
    : '';
  const downloadedLessonsCount = lessons.reduce((count, lesson) => {
    const unitKey = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
    return downloadedUnitKeys.has(unitKey) ? count + 1 : count;
  }, 0);
  const isReadDisabled = mode !== 'learn' || orderedUnitIndexes.length === 0;
  const isPreviousDisabled = mode !== 'learn' || isNextDisabled;
  const computedIsNextDisabled = isNextDisabled || (mode === 'learn' && repeatMode === 'off' && sectionEnd >= currentStageRange.end);
  const revisionBatchEntries = isFeedView ? currentBatchEntries.slice(0, 3) : currentBatchEntries;
  const lessonViewBatchGroups = isFeedView ? undefined : lessonBatchGroups;

  return {
    isLibraryView,
    isProfileView,
    isFeedView,
    isSettingsView,
    showLessonActions,
    showLibraryMiniPlayer,
    leaveCompletedUnitModalProps: {
      isOpen: isLeaveCompletedUnitModalOpen,
      title: leaveCompletedUnitModalTitle,
      message: leaveCompletedUnitConfirmMessage,
      cancelLabel: leaveCompletedUnitCancelLabel,
      confirmLabel: leaveCompletedUnitConfirmLabel,
      closeAriaLabel: appText.navigation.closeAriaLabel,
      onCancel: onLeaveCompletedUnitCancel,
      onConfirm: onLeaveCompletedUnitConfirm,
    },
    logoutModalProps: {
      isOpen: isLogoutModalOpen,
      title: appText.logoutModal.title,
      message: appText.logoutModal.message,
      cancelLabel: appText.logoutModal.cancelLabel,
      confirmLabel: appText.logoutModal.confirmLabel,
      closeAriaLabel: appText.navigation.closeAriaLabel,
      onCancel: onCloseLogoutModal,
      onConfirm: onConfirmLogoutModal,
    },
    profileViewProps: {
      profileName,
      progressPercent: overallProgressPercent,
      progressLabel: `${completedLessonsCount}/${totalLessonsCount}`,
      profileText: appText.profile,
      profileInput,
      profileError,
      hasProfileWhitespace,
      isProfileInputValid,
      currentCourseCode: currentCourseCode || appText.profile.courseNotAvailableLabel,
      downloadedLessonsCount,
      onProfileInputChange,
      onApplyProfileName,
      onOpenCurrentCourse,
      onOpenDownloadedLessons,
      onOpenSettings,
      onRequestLogout,
    },
    libraryViewProps: {
      lessons,
      defaultLanguage,
      learnLanguage,
      onSelectUnit,
      onReadAlbum,
      selectedAlbumKey,
      viewMode: libraryViewMode,
      onSelectedAlbumKeyChange,
      completedUnitKeys: completedLibraryKeys,
      activeUnitKey,
      downloadedUnitKeys,
      onDownloadUnit,
      onRemoveUnitDownload,
      isUnitDownloading,
    },
    settingsViewProps: {
      settingsText: appText.settings,
      defaultLanguage: selectedDefaultLanguage,
      learnLanguage,
      isEnglishUiLocked,
      isPronunciationEnabled,
      isBoldTextEnabled,
      isAutoScrollEnabled,
      textScalePercent,
      canDecreaseTextSize: textScalePercent > 90,
      canIncreaseTextSize: textScalePercent < 120,
      appTheme,
      voiceProvider,
      onDefaultLanguageChange,
      onToggleEnglishUiLock,
      onLearnLanguageChange,
      onTogglePronunciation,
      onToggleBoldText,
      onToggleAutoScroll,
      onDecreaseTextSize,
      onIncreaseTextSize,
      onAppThemeChange,
      onVoiceProviderChange,
      onBackToProfile,
    },
    lessonViewProps: {
      onBackToLibrary: () => onMobileTabChange('library'),
      progressLabel: `${Math.min(learnStepCount, learnStep + 1)}/${learnStepCount}`,
      currentIndex,
      currentBatchEntries: revisionBatchEntries,
      allBatchGroups: lessonViewBatchGroups,
      isRevisionView: isFeedView,
      currentStep: learnStep,
      isReading,
      onSelectStep: onSelectLessonStep,
      englishReferenceByKey,
      defaultLanguage,
      translationLanguage: selectedDefaultLanguage,
      isPronunciationEnabled,
      isBoldTextEnabled,
      isAutoScrollEnabled,
      textScalePercent,
      learnLanguage,
      activeSpeakingLessonIndex,
      onPlayLesson,
      savedHighlightPhrasesByLessonKey,
      onSaveLessonHighlight,
      onClearLessonHighlight,
    },
    lessonActionFooterProps: {
      lessonText: appText.lesson,
      mode,
      isNextDisabled: computedIsNextDisabled,
      isPreviousDisabled,
      isReadDisabled,
      isReading,
      isShuffleEnabled: isRandomLessonOrderEnabled,
      repeatMode,
      isVisible: isMobileBottomBarsVisible,
      onToggleShuffle,
      onToggleRepeat,
      onPrevious,
      onRead: onReadCurrentBatch,
      onNext,
    },
    libraryMiniPlayerProps: {
      lessonText: appText.lesson,
      trackTitle: miniPlayerTrackTitle,
      trackMeta: miniPlayerTrackMeta,
      isPlaying: isReading,
      isVisible: isMobileBottomBarsVisible,
      isPreviousDisabled,
      isPlayDisabled: isReadDisabled,
      isNextDisabled: computedIsNextDisabled,
      onPrevious,
      onPlay: onReadCurrentBatch,
      onNext,
      onOpenPlayer: () => onMobileTabChange('lesson'),
    },
    mobileBottomNavProps: {
      navText: appText.navigation,
      activeTab: sidebarTab === 'settings' ? 'profile' : sidebarTab,
      isVisible: isMobileBottomBarsVisible,
      onTabChange: onMobileTabChange,
    },
    appStateText: appText.appState,
  };
}

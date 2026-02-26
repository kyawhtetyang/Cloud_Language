import { AppMode, AppTheme, buildStageUnitsFromLessons, DefaultLanguage, LearnLanguage, SidebarTab, VoiceProvider } from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { LessonData } from '../../types';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type BuildAppViewPropsArgs = {
  defaultLanguage: DefaultLanguage;
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
  onOpenSettings: () => void;
  onRequestLogout: () => void;
  learnLanguage: LearnLanguage;
  onSelectUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onReadAlbum: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  selectedAlbumKey: string | null;
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
  onOpenSettings,
  onRequestLogout,
  learnLanguage,
  onSelectUnit,
  onReadAlbum,
  selectedAlbumKey,
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
  const isSettingsView = sidebarTab === 'settings';
  const showLessonActions = isLessonView || isLibraryView;

  return {
    isLibraryView,
    isProfileView,
    isSettingsView,
    showLessonActions,
    leaveCompletedUnitModalProps: {
      isOpen: isLeaveCompletedUnitModalOpen,
      title: leaveCompletedUnitModalTitle,
      message: leaveCompletedUnitConfirmMessage,
      cancelLabel: leaveCompletedUnitCancelLabel,
      confirmLabel: leaveCompletedUnitConfirmLabel,
      onCancel: onLeaveCompletedUnitCancel,
      onConfirm: onLeaveCompletedUnitConfirm,
    },
    logoutModalProps: {
      isOpen: isLogoutModalOpen,
      title: appText.logoutModal.title,
      message: appText.logoutModal.message,
      cancelLabel: appText.logoutModal.cancelLabel,
      confirmLabel: appText.logoutModal.confirmLabel,
      onCancel: onCloseLogoutModal,
      onConfirm: onConfirmLogoutModal,
    },
    profileViewProps: {
      profileName,
      progressPercent: overallProgressPercent,
      progressLabel: `${completedLessonsCount}/${totalLessonsCount}`,
      profileInput,
      profileError,
      hasProfileWhitespace,
      isProfileInputValid,
      currentCourseCode,
      onProfileInputChange,
      onApplyProfileName,
      onOpenCurrentCourse,
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
      onSelectedAlbumKeyChange,
      completedUnitKeys: completedLibraryKeys,
      activeUnitKey,
      downloadedUnitKeys,
      onDownloadUnit,
      onRemoveUnitDownload,
      isUnitDownloading,
    },
    settingsViewProps: {
      defaultLanguage,
      learnLanguage,
      isPronunciationEnabled,
      isBoldTextEnabled,
      isAutoScrollEnabled,
      textScalePercent,
      canDecreaseTextSize: textScalePercent > 90,
      canIncreaseTextSize: textScalePercent < 120,
      appTheme,
      voiceProvider,
      onDefaultLanguageChange,
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
      currentBatchEntries,
      allBatchGroups: lessonBatchGroups,
      currentStep: learnStep,
      isReading,
      onSelectStep: onSelectLessonStep,
      englishReferenceByKey,
      defaultLanguage,
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
      mode,
      isNextDisabled: isNextDisabled || (mode === 'learn' && repeatMode === 'off' && sectionEnd >= currentStageRange.end),
      isPreviousDisabled: mode !== 'learn' || isNextDisabled,
      isReadDisabled: mode !== 'learn' || orderedUnitIndexes.length === 0,
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
    mobileBottomNavProps: {
      activeTab: sidebarTab === 'settings' ? 'profile' : sidebarTab,
      isVisible: isMobileBottomBarsVisible,
      onTabChange: onMobileTabChange,
    },
  };
}

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

type ProfileAlbumCard = {
  key: string;
  title: string;
  meta: string;
  coverUrl: string | null;
  totalUnitCount: number;
  downloadedUnitCount: number;
  onOpen: () => void;
};

type ProfileAlbumAccumulator = {
  key: string;
  label: string;
  levelScheme?: string;
  levelCode?: string;
  levelOrder?: number;
  units: Set<string>;
  unitEntries: Array<{ level: number; unit: number }>;
  downloadedUnitsCount: number;
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

function buildCollectionKey(levelScheme: string | undefined, levelCode: string | undefined, collectionLabel: string): string {
  const normalizedSource = (levelCode || collectionLabel).toLowerCase().replace(/\s+/g, '-');
  return `${levelScheme || 'custom'}-${normalizedSource}`;
}

function getProfileAlbumCoverUrl(collectionLabel: string): string | null {
  const hskMatch = collectionLabel.match(/hsk[\s_]*([1-6])/i);
  if (hskMatch) return `/api/lesson-cover/hsk${hskMatch[1]}`;
  return null;
}

function formatUnitCode(level: number, unit: number): string {
  return `${Math.max(1, level)}.${Math.max(1, unit)}`;
}

function formatAlbumRange(unitEntries: Array<{ level: number; unit: number }>): string {
  if (unitEntries.length === 0) return '';
  const sorted = [...unitEntries].sort((a, b) => (a.level - b.level) || (a.unit - b.unit));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.level === last.level && first.unit === last.unit) {
    return formatUnitCode(first.level, first.unit);
  }
  return `${formatUnitCode(first.level, first.unit)}-${formatUnitCode(last.level, last.unit)}`;
}

function buildProfileAlbumCards({
  lessons,
  downloadedUnitKeys,
  collectionFallbackPrefix,
  unitSingularLabel,
  unitPluralLabel,
  onOpenAlbumLesson,
}: {
  lessons: LessonData[];
  downloadedUnitKeys: Set<string>;
  collectionFallbackPrefix: string;
  unitSingularLabel: string;
  unitPluralLabel: string;
  onOpenAlbumLesson: (albumKey: string, level: number, unit: number) => void;
}): ProfileAlbumCard[] {
  const byCollection = new Map<string, ProfileAlbumAccumulator>();

  for (const lesson of lessons) {
    const level = getLessonOrderIndex(lesson);
    const unit = getLessonUnitId(lesson);
    const collectionLabel = (lesson.collectionLabel || '').trim() || `${collectionFallbackPrefix} ${level}`;
    const levelScheme = String(lesson.levelScheme || '').trim().toLowerCase() || undefined;
    const levelCode = String(lesson.levelCode || '').trim().toUpperCase() || undefined;
    const levelOrder = typeof lesson.levelOrder === 'number' ? lesson.levelOrder : undefined;
    const collectionKey = buildCollectionKey(levelScheme, levelCode, collectionLabel);
    const unitKey = `${level}:${unit}`;

    if (!byCollection.has(collectionKey)) {
      byCollection.set(collectionKey, {
        key: collectionKey,
        label: collectionLabel,
        levelScheme,
        levelCode,
        levelOrder,
        units: new Set<string>(),
        unitEntries: [],
        downloadedUnitsCount: 0,
      });
    }

    const collection = byCollection.get(collectionKey)!;
    if (!collection.units.has(unitKey)) {
      collection.units.add(unitKey);
      collection.unitEntries.push({ level, unit });
      if (downloadedUnitKeys.has(unitKey)) {
        collection.downloadedUnitsCount += 1;
      }
    }
  }

  const schemePriority = (scheme: string | undefined): number => {
    if (scheme === 'cefr') return 10;
    if (scheme === 'hsk') return 20;
    if (scheme === 'jlpt') return 30;
    return 40;
  };

  return Array.from(byCollection.values())
    .sort((a, b) => {
      const priorityDiff = schemePriority(a.levelScheme) - schemePriority(b.levelScheme);
      if (priorityDiff !== 0) return priorityDiff;

      const orderA = typeof a.levelOrder === 'number' ? a.levelOrder : Number.POSITIVE_INFINITY;
      const orderB = typeof b.levelOrder === 'number' ? b.levelOrder : Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;

      return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    })
    .map((collection) => {
      const totalUnits = collection.units.size;
      const unitWord = totalUnits === 1 ? unitSingularLabel : unitPluralLabel;
      const rangeLabel = formatAlbumRange(collection.unitEntries);
      const progressLabel = `${collection.downloadedUnitsCount}/${totalUnits} ${unitWord}`;
      const meta = rangeLabel ? `${rangeLabel} · ${progressLabel}` : progressLabel;
      const sortedEntries = [...collection.unitEntries].sort((a, b) => (a.level - b.level) || (a.unit - b.unit));
      const firstEntry = sortedEntries[0] || { level: 1, unit: 1 };
      return {
        key: collection.key,
        title: collection.label,
        meta,
        coverUrl: getProfileAlbumCoverUrl(collection.label),
        totalUnitCount: totalUnits,
        downloadedUnitCount: collection.downloadedUnitsCount,
        onOpen: () => onOpenAlbumLesson(collection.key, firstEntry.level, firstEntry.unit),
      };
    });
}

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
  const profileAlbumCards = buildProfileAlbumCards({
    lessons,
    downloadedUnitKeys,
    collectionFallbackPrefix: appText.library.collectionFallbackPrefix,
    unitSingularLabel: appText.library.unitSingularLabel,
    unitPluralLabel: appText.library.unitPluralLabel,
    onOpenAlbumLesson: (albumKey, level, unit) => {
      onSelectUnit(level, unit, albumKey);
    },
  });
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
      currentCourseCode: currentCourseCode || appText.profile.courseNotAvailableLabel,
      downloadedLessonsCount,
      albumCards: profileAlbumCards,
      onOpenCurrentCourse,
      onOpenDownloadedLessons,
      onOpenSettings,
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
      profileText: appText.profile,
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
      profileInput,
      profileError,
      hasProfileWhitespace,
      isProfileInputValid,
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
      onProfileInputChange,
      onApplyProfileName,
      onRequestLogout,
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

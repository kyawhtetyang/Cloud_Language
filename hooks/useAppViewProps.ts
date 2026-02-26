import { Dispatch, SetStateAction } from 'react';
import { buildAppViewProps } from '../components/app/buildAppViewProps';
import {
  AppMode,
  AppTheme,
  clampTextScale,
  DefaultLanguage,
  LearnLanguage,
  SidebarTab,
  VoiceProvider,
} from '../config/appConfig';
import { LessonData } from '../types';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type UseAppViewPropsArgs = {
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
  handleLeaveCompletedUnitCancel: () => void;
  handleLeaveCompletedUnitConfirm: () => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: Dispatch<SetStateAction<boolean>>;
  handleLogoutConfirm: () => Promise<void>;
  profileName: string;
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  currentCourseCode: string;
  setProfileInput: (value: string) => void;
  handleApplyProfileName: () => void;
  setSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  learnLanguage: LearnLanguage;
  goToLibraryUnit: (level: number, unit: number, albumKey?: string | null) => void;
  handleReadLibraryAlbum: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => Promise<void>;
  librarySelectedAlbumKey: string | null;
  setLibrarySelectedAlbumKey: Dispatch<SetStateAction<string | null>>;
  downloadedUnitKeys: Set<string>;
  downloadUnitPack: (level: number, unit: number) => Promise<void>;
  removeUnitPack: (level: number, unit: number) => Promise<void>;
  isUnitDownloading: (level: number, unit: number) => boolean;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  textScalePercent: number;
  appTheme: AppTheme;
  voiceProvider: VoiceProvider;
  setDefaultLanguage: Dispatch<SetStateAction<DefaultLanguage>>;
  setLearnLanguage: Dispatch<SetStateAction<LearnLanguage>>;
  setIsPronunciationEnabled: Dispatch<SetStateAction<boolean>>;
  setIsBoldTextEnabled: Dispatch<SetStateAction<boolean>>;
  setIsAutoScrollEnabled: Dispatch<SetStateAction<boolean>>;
  setTextScalePercent: Dispatch<SetStateAction<number>>;
  setAppTheme: Dispatch<SetStateAction<AppTheme>>;
  setVoiceProvider: Dispatch<SetStateAction<VoiceProvider>>;
  learnStepCount: number;
  currentBatchEntries: LessonEntry[];
  lessonBatchGroups: LessonEntry[][];
  learnStep: number;
  isReading: boolean;
  handleSelectLessonStep: (step: number) => Promise<void>;
  englishReferenceByKey: Map<string, string>;
  activeSpeakingLessonIndex: number | null;
  handlePlaySingleLesson: (lesson: LessonData, lessonIndex: number) => void;
  highlightPhrasesByLessonKey: Map<string, string[]>;
  saveHighlightSelection: (lesson: LessonData, selectedText: string) => boolean;
  clearHighlightSelection: (lesson: LessonData) => boolean;
  repeatMode: 'off' | 'all' | 'one';
  isNextDisabled: boolean;
  sectionEnd: number;
  currentStageRange: { start: number; end: number };
  orderedUnitIndexes: number[];
  isRandomLessonOrderEnabled: boolean;
  isMobileBottomBarsVisible: boolean;
  handleToggleShuffle: () => void;
  handleToggleRepeat: () => void;
  handlePrevious: () => Promise<void>;
  handleReadCurrentBatch: () => Promise<void>;
  handleNext: () => Promise<void>;
  selectTab: (tab: SidebarTab) => void;
};

export function useAppViewProps({
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
  handleReadCurrentBatch,
  handleNext,
  selectTab,
}: UseAppViewPropsArgs) {
  return buildAppViewProps({
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
    onLeaveCompletedUnitCancel: handleLeaveCompletedUnitCancel,
    onLeaveCompletedUnitConfirm: handleLeaveCompletedUnitConfirm,
    isLogoutModalOpen,
    onCloseLogoutModal: () => setIsLogoutModalOpen(false),
    onConfirmLogoutModal: () => { void handleLogoutConfirm(); },
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    currentCourseCode,
    onProfileInputChange: setProfileInput,
    onApplyProfileName: handleApplyProfileName,
    onOpenCurrentCourse: () => {
      setSidebarTab('lesson');
      setIsSidebarOpen(false);
    },
    onOpenSettings: () => {
      setSidebarTab('settings');
      setIsSidebarOpen(false);
    },
    onRequestLogout: () => setIsLogoutModalOpen(true),
    learnLanguage,
    onSelectUnit: goToLibraryUnit,
    onReadAlbum: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => {
      void handleReadLibraryAlbum(units, albumKey);
    },
    selectedAlbumKey: librarySelectedAlbumKey,
    onSelectedAlbumKeyChange: setLibrarySelectedAlbumKey,
    downloadedUnitKeys,
    onDownloadUnit: (level: number, unit: number) => { void downloadUnitPack(level, unit); },
    onRemoveUnitDownload: (level: number, unit: number) => { void removeUnitPack(level, unit); },
    isUnitDownloading,
    isPronunciationEnabled,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    textScalePercent,
    appTheme,
    voiceProvider,
    onDefaultLanguageChange: setDefaultLanguage,
    onLearnLanguageChange: setLearnLanguage,
    onTogglePronunciation: () => setIsPronunciationEnabled((prev) => !prev),
    onToggleBoldText: () => setIsBoldTextEnabled((prev) => !prev),
    onToggleAutoScroll: () => setIsAutoScrollEnabled((prev) => !prev),
    onDecreaseTextSize: () => setTextScalePercent((prev) => clampTextScale(prev - 5)),
    onIncreaseTextSize: () => setTextScalePercent((prev) => clampTextScale(prev + 5)),
    onAppThemeChange: setAppTheme,
    onVoiceProviderChange: setVoiceProvider,
    onBackToProfile: () => {
      setSidebarTab('profile');
      setIsSidebarOpen(false);
    },
    learnStepCount,
    currentBatchEntries,
    lessonBatchGroups,
    learnStep,
    isReading,
    onSelectLessonStep: handleSelectLessonStep,
    englishReferenceByKey,
    activeSpeakingLessonIndex,
    onPlayLesson: handlePlaySingleLesson,
    savedHighlightPhrasesByLessonKey: highlightPhrasesByLessonKey,
    onSaveLessonHighlight: saveHighlightSelection,
    onClearLessonHighlight: clearHighlightSelection,
    repeatMode,
    isNextDisabled,
    sectionEnd,
    currentStageRange,
    orderedUnitIndexes,
    isRandomLessonOrderEnabled,
    isMobileBottomBarsVisible,
    onToggleShuffle: handleToggleShuffle,
    onToggleRepeat: handleToggleRepeat,
    onPrevious: handlePrevious,
    onReadCurrentBatch: () => { void handleReadCurrentBatch(); },
    onNext: handleNext,
    onMobileTabChange: selectTab,
  });
}

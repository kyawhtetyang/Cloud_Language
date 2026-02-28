import { describe, expect, it, vi } from 'vitest';
import { buildAppViewProps } from './buildAppViewProps';
import { LessonData } from '../../types';

const baseLesson: LessonData = {
  level: 1,
  unit: 1,
  stage: 'A1',
  topic: 'Shop At A Market',
  english: 'Hello',
  burmese: 'မင်္ဂလာပါ',
  pronunciation: 'ni hao',
  sourceLabel: 'Shop At A Market',
  collectionLabel: 'HSK 1',
};

function createLesson(english: string): LessonData {
  return {
    ...baseLesson,
    english,
  };
}

function createArgs(
  overrides: Partial<Parameters<typeof buildAppViewProps>[0]> = {},
): Parameters<typeof buildAppViewProps>[0] {
  return {
    defaultLanguage: 'english',
    selectedDefaultLanguage: 'english',
    currentIndex: 0,
    lessons: [baseLesson],
    currentLevel: 1,
    currentUnit: 1,
    mode: 'learn',
    completedUnitKeys: new Set<string>(),
    sidebarTab: 'library',
    isLeaveCompletedUnitModalOpen: false,
    leaveCompletedUnitModalTitle: '',
    leaveCompletedUnitConfirmMessage: '',
    leaveCompletedUnitCancelLabel: '',
    leaveCompletedUnitConfirmLabel: '',
    onLeaveCompletedUnitCancel: vi.fn(),
    onLeaveCompletedUnitConfirm: vi.fn(),
    isLogoutModalOpen: false,
    onCloseLogoutModal: vi.fn(),
    onConfirmLogoutModal: vi.fn(),
    profileName: 'tester',
    profileInput: 'tester',
    profileError: null,
    hasProfileWhitespace: false,
    isProfileInputValid: true,
    currentCourseCode: 'HSK 1',
    onProfileInputChange: vi.fn(),
    onApplyProfileName: vi.fn(),
    onOpenCurrentCourse: vi.fn(),
    onOpenDownloadedLessons: vi.fn(),
    onOpenSettings: vi.fn(),
    onRequestLogout: vi.fn(),
    learnLanguage: 'hsk_chinese',
    onSelectUnit: vi.fn(),
    onReadAlbum: vi.fn(),
    selectedAlbumKey: 'album-1',
    libraryViewMode: 'all',
    onSelectedAlbumKeyChange: vi.fn(),
    downloadedUnitKeys: new Set<string>(),
    onDownloadUnit: vi.fn(),
    onRemoveUnitDownload: vi.fn(),
    isUnitDownloading: vi.fn(() => false),
    isPronunciationEnabled: true,
    isBoldTextEnabled: false,
    isAutoScrollEnabled: true,
    textScalePercent: 100,
    appTheme: 'light',
    voiceProvider: 'apple_siri',
    onDefaultLanguageChange: vi.fn(),
    isEnglishUiLocked: true,
    onToggleEnglishUiLock: vi.fn(),
    onLearnLanguageChange: vi.fn(),
    onTogglePronunciation: vi.fn(),
    onToggleBoldText: vi.fn(),
    onToggleAutoScroll: vi.fn(),
    onDecreaseTextSize: vi.fn(),
    onIncreaseTextSize: vi.fn(),
    onAppThemeChange: vi.fn(),
    onVoiceProviderChange: vi.fn(),
    onBackToProfile: vi.fn(),
    learnStepCount: 1,
    currentBatchEntries: [{ lesson: baseLesson, lessonIndex: 0 }],
    lessonBatchGroups: [[{ lesson: baseLesson, lessonIndex: 0 }]],
    learnStep: 0,
    isReading: false,
    onSelectLessonStep: vi.fn(),
    englishReferenceByKey: new Map<string, string>(),
    activeSpeakingLessonIndex: null,
    onPlayLesson: vi.fn(),
    savedHighlightPhrasesByLessonKey: new Map<string, string[]>(),
    onSaveLessonHighlight: vi.fn(() => true),
    onClearLessonHighlight: vi.fn(() => true),
    repeatMode: 'off',
    isNextDisabled: false,
    sectionEnd: 0,
    currentStageRange: { start: 0, end: 0 },
    orderedUnitIndexes: [0],
    isRandomLessonOrderEnabled: false,
    isMobileBottomBarsVisible: true,
    onToggleShuffle: vi.fn(),
    onToggleRepeat: vi.fn(),
    onPrevious: vi.fn(),
    onReadCurrentBatch: vi.fn(),
    onNext: vi.fn(),
    onMobileTabChange: vi.fn(),
    ...overrides,
  };
}

describe('buildAppViewProps feed routing', () => {
  it('keeps lesson controls on lesson tab', () => {
    const result = buildAppViewProps(
      createArgs({
        sidebarTab: 'lesson',
      }),
    );

    expect(result.isFeedView).toBe(false);
    expect(result.showLessonActions).toBe(true);
    expect(result.mobileBottomNavProps.isVisible).toBe(true);
  });

  it('shows feed view only on feed tab', () => {
    const result = buildAppViewProps(
      createArgs({
        sidebarTab: 'feed',
      }),
    );

    expect(result.isFeedView).toBe(true);
    expect(result.showLessonActions).toBe(true);
    expect(result.showLibraryMiniPlayer).toBe(false);
    expect(result.mobileBottomNavProps.isVisible).toBe(true);
    expect(result.lessonViewProps.isRevisionView).toBe(true);
  });

  it('limits revision lesson view to three sentences', () => {
    const lessonA = createLesson('A');
    const lessonB = createLesson('B');
    const lessonC = createLesson('C');
    const lessonD = createLesson('D');
    const result = buildAppViewProps(
      createArgs({
        sidebarTab: 'feed',
        currentBatchEntries: [
          { lesson: lessonA, lessonIndex: 0 },
          { lesson: lessonB, lessonIndex: 1 },
          { lesson: lessonC, lessonIndex: 2 },
          { lesson: lessonD, lessonIndex: 3 },
        ],
        lessonBatchGroups: [
          [
            { lesson: lessonA, lessonIndex: 0 },
            { lesson: lessonB, lessonIndex: 1 },
          ],
          [
            { lesson: lessonC, lessonIndex: 2 },
            { lesson: lessonD, lessonIndex: 3 },
          ],
        ],
      }),
    );

    expect(result.lessonViewProps.currentBatchEntries).toHaveLength(3);
    expect(result.lessonViewProps.currentBatchEntries.map((entry) => entry.lesson.english)).toEqual([
      'A',
      'B',
      'C',
    ]);
    expect(result.lessonViewProps.allBatchGroups).toBeUndefined();
  });

  it('keeps full sentence groups on lesson tab', () => {
    const lessonA = createLesson('A');
    const lessonB = createLesson('B');
    const lessonC = createLesson('C');
    const lessonD = createLesson('D');
    const lessonBatchGroups = [
      [
        { lesson: lessonA, lessonIndex: 0 },
        { lesson: lessonB, lessonIndex: 1 },
      ],
      [
        { lesson: lessonC, lessonIndex: 2 },
        { lesson: lessonD, lessonIndex: 3 },
      ],
    ];
    const currentBatchEntries = [
      { lesson: lessonA, lessonIndex: 0 },
      { lesson: lessonB, lessonIndex: 1 },
      { lesson: lessonC, lessonIndex: 2 },
      { lesson: lessonD, lessonIndex: 3 },
    ];
    const result = buildAppViewProps(
      createArgs({
        sidebarTab: 'lesson',
        currentBatchEntries,
        lessonBatchGroups,
      }),
    );

    expect(result.lessonViewProps.currentBatchEntries).toHaveLength(4);
    expect(result.lessonViewProps.currentBatchEntries).toEqual(currentBatchEntries);
    expect(result.lessonViewProps.allBatchGroups).toEqual(lessonBatchGroups);
    expect(result.lessonViewProps.isRevisionView).toBe(false);
  });

  it('keeps mini player visible on library without selected album', () => {
    const result = buildAppViewProps(
      createArgs({
        sidebarTab: 'library',
        selectedAlbumKey: null,
      }),
    );

    expect(result.showLibraryMiniPlayer).toBe(true);
  });

  it('shows downloaded lessons count in profile props', () => {
    const lessonA = createLesson('A');
    const lessonB = { ...createLesson('B'), unit: 2 };
    const lessonC = { ...createLesson('C'), level: 2, unit: 1 };
    const result = buildAppViewProps(
      createArgs({
        lessons: [lessonA, lessonB, lessonC],
        downloadedUnitKeys: new Set<string>(['1:1', '2:1']),
      }),
    );

    expect(result.profileViewProps.downloadedLessonsCount).toBe(2);
  });

  it('keeps UI language and lesson translation language separate', () => {
    const result = buildAppViewProps(
      createArgs({
        defaultLanguage: 'english',
        selectedDefaultLanguage: 'burmese',
        sidebarTab: 'lesson',
      }),
    );

    expect(result.lessonViewProps.defaultLanguage).toBe('english');
    expect(result.lessonViewProps.translationLanguage).toBe('burmese');
  });
});

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
    onOpenProfileAlbumLibrary: vi.fn(),
    onOpenSettings: vi.fn(),
    onRequestLogout: vi.fn(),
    learnLanguage: 'chinese',
    onSelectUnit: vi.fn(),
    onReadAlbum: vi.fn(),
    selectedAlbumKey: 'album-1',
    libraryViewMode: 'all',
    onSelectedAlbumKeyChange: vi.fn(),
    downloadedUnitKeys: new Set<string>(),
    bookmarkedUnitKeys: new Set<string>(),
    bookmarkedAlbumKeys: new Set<string>(),
    onDownloadUnit: vi.fn(),
    onRemoveUnitDownload: vi.fn(),
    isUnitDownloading: vi.fn(() => false),
    onToggleUnitBookmark: vi.fn(),
    onToggleAlbumBookmark: vi.fn(),
    isPronunciationEnabled: true,
    isLearningLanguageVisible: true,
    isTranslationVisible: true,
    isBoldTextEnabled: false,
    isAutoScrollEnabled: true,
    textScalePercent: 100,
    appTheme: 'light',
    voiceProvider: 'apple_siri',
    onDefaultLanguageChange: vi.fn(),
    uiLockLanguage: 'off',
    onUiLockLanguageChange: vi.fn(),
    courseFramework: 'cefr',
    onLearnLanguageChange: vi.fn(),
    onCourseFrameworkChange: vi.fn(),
    onTogglePronunciation: vi.fn(),
    onToggleLearningLanguageVisibility: vi.fn(),
    onToggleTranslationVisibility: vi.fn(),
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
    isChatComposerFocused: false,
    onToggleShuffle: vi.fn(),
    onToggleRepeat: vi.fn(),
    onPrevious: vi.fn(),
    onReadCurrentBatch: vi.fn(),
    onNext: vi.fn(),
    onMobileTabChange: vi.fn(),
    onChatComposerFocusChange: vi.fn(),
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
    expect(result.showLessonActions).toBe(false);
    expect(result.showLibraryMiniPlayer).toBe(false);
    expect(result.mobileBottomNavProps.isVisible).toBe(true);
    expect(result.chatViewProps.defaultLanguage).toBe('english');
  });

  it('hides mobile nav in feed when chat composer is focused', () => {
    const result = buildAppViewProps(
      createArgs({
        sidebarTab: 'feed',
        isChatComposerFocused: true,
      }),
    );

    expect(result.mobileBottomNavProps.isVisible).toBe(false);
  });

  it('passes highlight phrases to chat feed props', () => {
    const lessonA = createLesson('A');
    const lessonB = createLesson('B');
    const lessonC = createLesson('C');
    const lessonD = createLesson('D');
    const highlights = new Map<string, string[]>([
      ['k1', ['你好', '谢谢']],
      ['k2', ['你好']],
    ]);
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
        savedHighlightPhrasesByLessonKey: highlights,
      }),
    );

    expect(result.chatViewProps.highlightPhrasesByLessonKey).toBe(highlights);
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

  it('shows bookmark counts in profile props', () => {
    const lessonA = createLesson('A');
    const lessonB = { ...createLesson('B'), unit: 2 };
    const lessonC = { ...createLesson('C'), level: 2, unit: 1 };
    const result = buildAppViewProps(
      createArgs({
        lessons: [lessonA, lessonB, lessonC],
        bookmarkedUnitKeys: new Set<string>(['1:1', '2:1']),
      }),
    );

    expect(result.profileViewProps.bookmarkedAlbumsCount).toBe(0);
    expect(result.profileViewProps.bookmarkedLessonsCount).toBe(2);
    expect(result.profileViewProps.bookmarkedLessonRows).toHaveLength(2);
    expect(result.profileViewProps.bookmarkedLessonRows?.map((row) => `${row.entry.level}:${row.entry.unit}`)).toEqual([
      '1:1',
      '2:1',
    ]);
  });

  it('opens library album detail when profile bookmarked album card is tapped', () => {
    const onOpenProfileAlbumLibrary = vi.fn();
    const onSelectedAlbumKeyChange = vi.fn();
    const onSelectUnit = vi.fn();

    const result = buildAppViewProps(
      createArgs({
        onOpenProfileAlbumLibrary,
        onSelectedAlbumKeyChange,
        onSelectUnit,
      }),
    );

    const firstAlbumCard = result.profileViewProps.albumCards?.[0];
    expect(firstAlbumCard).toBeDefined();
    firstAlbumCard?.onOpen();

    expect(onOpenProfileAlbumLibrary).toHaveBeenCalled();
    expect(onSelectedAlbumKeyChange).toHaveBeenCalledWith(firstAlbumCard?.key);
    expect(onSelectUnit).not.toHaveBeenCalled();
  });

  it('keeps shared mini player visible on profile even when audio is stopped', () => {
    const resultStopped = buildAppViewProps(
      createArgs({
        sidebarTab: 'profile',
        isReading: false,
        activeSpeakingLessonIndex: null,
      }),
    );
    expect(resultStopped.showLibraryMiniPlayer).toBe(true);

    const resultPlaying = buildAppViewProps(
      createArgs({
        sidebarTab: 'profile',
        isReading: true,
      }),
    );
    expect(resultPlaying.showLibraryMiniPlayer).toBe(true);
  });

  it('opens lesson when shared mini player card is tapped', () => {
    const onMobileTabChange = vi.fn();
    const result = buildAppViewProps(
      createArgs({
        sidebarTab: 'library',
        onMobileTabChange,
      }),
    );

    result.libraryMiniPlayerProps.onOpenPlayer();
    expect(onMobileTabChange).toHaveBeenCalledWith('lesson');
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

  it('keeps default and learn language values when they are the same', () => {
    const result = buildAppViewProps(
      createArgs({
        selectedDefaultLanguage: 'english',
        learnLanguage: 'english',
      }),
    );

    expect(result.settingsViewProps.defaultLanguage).toBe('english');
    expect(result.settingsViewProps.learnLanguage).toBe('english');
  });
});

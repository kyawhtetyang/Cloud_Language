import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LessonData } from './types';
import { useProfileProgress } from './hooks/useProfileProgress';
import { useLessonFlow } from './hooks/useLessonFlow';
import { useProfileProgressSync } from './hooks/useProfileProgressSync';
import { useSettingsPersistence } from './hooks/useSettingsPersistence';
import { useLessonData } from './hooks/useLessonData';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppPreferences } from './hooks/useAppPreferences';
import { useLessonUnitState } from './hooks/useLessonUnitState';
import { useLessonBatchGroups } from './hooks/useLessonBatchGroups';
import { useOfflineLessonPacks } from './hooks/useOfflineLessonPacks';
import { useAppTheme } from './hooks/useAppTheme';
import { useLessonHighlights } from './hooks/useLessonHighlights';
import { useCourseProgression } from './hooks/useCourseProgression';
import { SpeakEntry, useTrackPlayback } from './hooks/useTrackPlayback';
import { useUnitLeaveGuards } from './hooks/useUnitLeaveGuards';
import { RepeatMode, useUnitNavigation } from './hooks/useUnitNavigation';
import { buildLessonReferenceKey } from './utils/lessonReference';
import { AppDialogs } from './components/app/AppDialogs';
import { AppMainContent } from './components/app/AppMainContent';
import { AppBottomBars } from './components/app/AppBottomBars';
import {
  AppMode,
  buildStageUnitsFromLessons,
  clampTextScale,
  DEFAULT_PROGRESS_INDEX,
  DEFAULT_STREAK,
  DEFAULT_UNLOCKED_LEVEL,
  getPlayableLessonText,
  getLessonOrderIndex,
  getLessonUnitId,
  LESSONS_PER_BATCH,
  MATCH_PAIRS_PER_REVIEW,
  PROFILE_NAME_KEY,
  PROGRESS_KEY,
  ReviewResult,
  STREAK_KEY,
  toProfileStorageId,
  TOTAL_XP_PER_COURSE,
  UNLOCKED_LEVEL_KEY,
  resolveStageCode,
} from './config/appConfig';
import { getLessonModalText } from './config/lessonModalText';
import { AppSidebar } from './components/layout/AppSidebar';
import {
  LessonsUnavailableView,
  LoadingView,
  WelcomeView,
} from './components/views/AppStateViews';

function normalizeApiBaseUrl(rawApiBaseUrl: string | undefined): string {
  const fallbackBaseUrl = '/api';
  const candidate = (rawApiBaseUrl?.trim() || fallbackBaseUrl).replace(/\/+$/, '');
  if (candidate === '/api' || candidate.endsWith('/api')) {
    return candidate.slice(0, -4);
  }
  return candidate;
}

const App: React.FC = () => {
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
  const {
    isPronunciationEnabled,
    setIsPronunciationEnabled,
    learnLanguage,
    setLearnLanguage,
    defaultLanguage,
    setDefaultLanguage,
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
  } = useAppPreferences(profileName ? toProfileStorageId(profileName) : '');
  const [learnStep, setLearnStep] = useState(0);
  const [unitXp, setUnitXp] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [completedUnitKeys, setCompletedUnitKeys] = useState<Set<string>>(new Set());
  const [quizSectionStart, setQuizSectionStart] = useState(0);
  const [quizSectionEnd, setQuizSectionEnd] = useState(0);
  const [isUnitCompleteModalOpen, setIsUnitCompleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileBottomBarsVisible, setIsMobileBottomBarsVisible] = useState(true);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [pendingAutoPlayUnitKey, setPendingAutoPlayUnitKey] = useState<string | null>(null);

  const [roadmapSelectedAlbumKey, setRoadmapSelectedAlbumKey] = useState<string | null>(null);
  const lastUnitKeyRef = useRef<string>('');
  const lastScrollYRef = useRef(0);
  const scrollTickingRef = useRef(false);
  const [randomOrderVersion, setRandomOrderVersion] = useState(0);
  const {
    answerChecked,
    matchPairs,
    matchAnswerOptions,
    selectedPromptId,
    selectedAnswerId,
    matchedPairIds,
    matchMistakes,
    isMatchReviewComplete,
    resetQuizState,
    handleSelectPrompt,
    handleSelectAnswer,
  } = useLessonFlow(MATCH_PAIRS_PER_REVIEW);
  const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
  const { lessons, englishReferenceLessons, loading, errorMessage } = useLessonData(
    apiBaseUrl,
    learnLanguage,
  );
  const {
    downloadedUnitKeys,
    downloadUnitPack,
    removeUnitPack,
    isUnitDownloading,
  } = useOfflineLessonPacks(learnLanguage, lessons);
  const totalLevels = useMemo(
    () => lessons.reduce((max, lesson) => Math.max(max, getLessonOrderIndex(lesson)), 1),
    [lessons],
  );
  const englishReferenceByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const lesson of englishReferenceLessons) {
      map.set(buildLessonReferenceKey(lesson), lesson.english);
    }
    return map;
  }, [englishReferenceLessons]);
  const profileStorageId = profileName ? toProfileStorageId(profileName) : '';
  const { highlightPhrasesByLessonKey, saveHighlightSelection, clearHighlightSelection } = useLessonHighlights(
    profileStorageId,
    learnLanguage,
  );
  const progressStorageKey = profileStorageId ? `${PROGRESS_KEY}:${profileStorageId}` : PROGRESS_KEY;
  const unlockedStorageKey = profileStorageId ? `${UNLOCKED_LEVEL_KEY}:${profileStorageId}` : UNLOCKED_LEVEL_KEY;
  const streakStorageKey = profileStorageId ? `${STREAK_KEY}:${profileStorageId}` : STREAK_KEY;

  const { markHydrationStale } = useProfileProgressSync({
    apiBaseUrl,
    lessons,
    profileName,
    mode,
    currentIndex,
    unlockedLevel,
    streak,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    voiceProvider,
    totalLevels,
    progressStorageKey,
    unlockedStorageKey,
    streakStorageKey,
    setCurrentIndex,
    setUnlockedLevel,
    setStreak,
    setLearnLanguage,
    setDefaultLanguage,
    setIsPronunciationEnabled,
    setTextScalePercent,
    setIsBoldTextEnabled,
    setIsAutoScrollEnabled,
    setIsRandomLessonOrderEnabled,
    setIsReviewQuestionsRemoved,
    setAppTheme,
    setVoiceProvider,
  });

  useSettingsPersistence({
    profileStorageId,
    enabled: Boolean(profileName) && hasHydratedSettings,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    voiceProvider,
  });

  const {
    leaveQuizConfirmMessage,
    leaveQuizModalTitle,
    leaveQuizCancelLabel,
    leaveQuizConfirmLabel,
    leaveCompletedUnitModalTitle,
    leaveCompletedUnitConfirmMessage,
    leaveCompletedUnitCancelLabel,
    leaveCompletedUnitConfirmLabel,
    unitCompleteModalTitle,
    unitCompleteModalMessage,
    unitCompleteModalCancelLabel,
    unitCompleteModalConfirmLabel,
  } = getLessonModalText(defaultLanguage);
  const {
    currentLevel,
    currentUnit,
    currentCourseCode,
    currentLevelTitle,
    orderedUnitIndexes,
    sectionStart,
    sectionEnd,
    sectionTotal,
    currentBatchEntries,
  } = useLessonUnitState({
    lessons,
    mode,
    currentIndex,
    quizSectionStart,
    learnStep,
    isRandomLessonOrderEnabled,
    randomOrderVersion,
  });
  const currentStageCode = useMemo(() => {
    const anchor = lessons[sectionStart] ?? lessons[currentIndex];
    if (!anchor) return resolveStageCode(currentLevel);
    return resolveStageCode(getLessonOrderIndex(anchor), anchor.stage);
  }, [currentIndex, currentLevel, lessons, sectionStart]);
  const currentStageRange = useMemo(() => {
    const indexes = lessons.reduce<number[]>((acc, lesson, idx) => {
      const stageCode = resolveStageCode(getLessonOrderIndex(lesson), lesson.stage);
      if (stageCode === currentStageCode) {
        acc.push(idx);
      }
      return acc;
    }, []);
    if (indexes.length === 0) {
      return { start: 0, end: Math.max(0, lessons.length - 1) };
    }
    return { start: indexes[0], end: indexes[indexes.length - 1] };
  }, [currentStageCode, lessons]);
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
  useEffect(() => {
    const unitKey = `${currentLevel}:${currentUnit}`;
    if (lastUnitKeyRef.current === unitKey) return;
    lastUnitKeyRef.current = unitKey;
    resetUnitPlaybackAnchor();
  }, [currentLevel, currentUnit]);
  const learnStepCount = useMemo(
    () => Math.max(1, Math.ceil(sectionTotal / LESSONS_PER_BATCH)),
    [sectionTotal],
  );
  const orderedCourseUnitStartIndexes = useMemo(() => {
    const seen = new Set<string>();
    const starts: number[] = [];
    lessons.forEach((lesson, index) => {
      const key = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
      if (seen.has(key)) return;
      seen.add(key);
      starts.push(index);
    });
    return starts;
  }, [lessons]);
  const playableCourseUnitKeys = useMemo(() => {
    const playable = new Set<string>();
    lessons.forEach((lesson) => {
      const speakTextValue = getPlayableLessonText(lesson);
      if (!speakTextValue) return;
      playable.add(`${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`);
    });
    return playable;
  }, [lessons]);

  const handleApplyProfileName = () => {
    if (typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement
        && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)
      ) {
        activeElement.blur();
      }
    }

    applyProfileName(() => {
      markHydrationStale();
      setMode('learn');
      resetQuizState();
      setUnitXp(0);
      setReviewResult(null);
      setSidebarTab('lesson');
      setRandomOrderVersion((prev) => prev + 1);
      setIsSidebarOpen(false);
    });
  };

  useEffect(() => {
    document.body.classList.toggle('lang-burmese', defaultLanguage === 'burmese');
    document.documentElement.lang = defaultLanguage === 'burmese' ? 'my' : 'en';
  }, [defaultLanguage]);

  useAppTheme(appTheme);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;
    lastScrollYRef.current = window.scrollY || 0;

    const onScroll = () => {
      if (scrollTickingRef.current) return;
      const currentScrollY = window.scrollY || 0;
      scrollTickingRef.current = true;
      window.requestAnimationFrame(() => {
        if (!isMobileViewport()) {
          setIsMobileBottomBarsVisible(true);
          lastScrollYRef.current = currentScrollY;
          scrollTickingRef.current = false;
          return;
        }

        const delta = currentScrollY - lastScrollYRef.current;
        if (currentScrollY <= 12 || delta < -8) {
          setIsMobileBottomBarsVisible(true);
        } else if (delta > 8) {
          setIsMobileBottomBarsVisible(false);
        }

        lastScrollYRef.current = currentScrollY;
        scrollTickingRef.current = false;
      });
    };

    const onResize = () => {
      if (!isMobileViewport()) {
        setIsMobileBottomBarsVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    setIsMobileBottomBarsVisible(true);
  }, [mode, sidebarTab]);

  const getCurrentUnitSpeakEntries = (startFromLessonIndex?: number | null): SpeakEntry[] => {
    const entries = orderedUnitIndexes
      .map((lessonIndex) => {
        const lesson = lessons[lessonIndex];
        if (!lesson) return null;
        const speakTextValue = getPlayableLessonText(lesson);
        if (!speakTextValue) return null;
        return {
          text: speakTextValue,
          unitId: getLessonUnitId(lesson),
          audioUrl: lesson.audioPath,
          lessonIndex,
        };
      })
      .filter((entry): entry is SpeakEntry => entry !== null);

    if (typeof startFromLessonIndex !== 'number') {
      return entries;
    }

    const startPosition = entries.findIndex((entry) => entry.lessonIndex === startFromLessonIndex);
    if (startPosition < 0) {
      return entries;
    }
    return entries.slice(startPosition);
  };

  const {
    isNextDisabled,
    continueTrackPlaybackIfNeeded,
    handleNext,
    handlePrevious,
    navigateToLevelUnit,
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
    setUnitXp,
    setReviewResult,
    resetQuizState,
    setRoadmapSelectedAlbumKey,
    setSidebarTab,
    setIsSidebarOpen,
  });

  const handlePlaySingleLesson = (lesson: LessonData, lessonIndex: number) => {
    const speakValue = getPlayableLessonText(lesson);
    if (!speakValue) return;
    void playSingleEntry({
      text: speakValue,
      unitId: getLessonUnitId(lesson),
      audioUrl: lesson.audioPath,
      lessonIndex,
    });
  };

  const handleReadCurrentBatch = async () => {
    if (mode !== 'learn') return;

    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
      return;
    }

    setTrackPlaybackEnabled(true);
    unitPlaybackStartedAtRef.current = Date.now();
    const texts = getCurrentUnitSpeakEntries(lastPlayAnchorLessonIndexRef.current);
    if (texts.length === 0) {
      continueTrackPlaybackIfNeeded();
      return;
    }
    const finished = await playEntriesSequentially(texts);
    if (!finished) return;
    continueTrackPlaybackIfNeeded();
  };

  useEffect(() => {
    if (!pendingAutoPlayUnitKey) return;
    if (mode !== 'learn') return;
    if (sidebarTab !== 'lesson' && sidebarTab !== 'levels') return;
    if (orderedUnitIndexes.length === 0) return;

    const activeUnitKeyNow = `${currentLevel}:${currentUnit}`;
    if (activeUnitKeyNow !== pendingAutoPlayUnitKey) return;

    setPendingAutoPlayUnitKey(null);
    void (async () => {
      const texts = getCurrentUnitSpeakEntries();
      if (texts.length === 0) {
        continueTrackPlaybackIfNeeded();
        return;
      }
      const finished = await playEntriesSequentially(texts);
      if (!finished) return;
      continueTrackPlaybackIfNeeded();
    })();
  }, [
    playableCourseUnitKeys,
    currentLevel,
    currentUnit,
    mode,
    orderedUnitIndexes.length,
    orderedCourseUnitStartIndexes,
    pendingAutoPlayUnitKey,
    sidebarTab,
  ]);

  const handleSelectLessonStep = async (step: number) => {
    if (mode !== 'learn') return;
    setTrackPlaybackEnabled(false);
    const safeStep = Math.max(0, Math.min(learnStepCount - 1, step));
    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
    }
    setLearnStep(safeStep);
    const nextOffset = safeStep * LESSONS_PER_BATCH;
    setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
  };

  const handleReadRoadmapAlbum = async (
    units: Array<{ level: number; unit: number }>,
    albumKey?: string | null,
  ) => {
    if (mode !== 'learn') return;
    if (units.length === 0) return;
    setTrackPlaybackEnabled(false);

    const firstUnit = units[0];
    const safeLevel = Math.min(Math.max(firstUnit.level, 1), totalLevels);
    const safeUnit = Math.max(1, firstUnit.unit);
    const target = lessons.findIndex(
      (lesson) => getLessonOrderIndex(lesson) === safeLevel && getLessonUnitId(lesson) === safeUnit,
    );
    if (target < 0) return;

    if (albumKey !== undefined) {
      setRoadmapSelectedAlbumKey(albumKey);
    }
    setCurrentIndex(target);
    setLearnStep(0);
    setUnlockedLevel((prev) => Math.max(prev, safeLevel));

    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
    }

    const unitKeySet = new Set(units.map((item) => `${Math.max(1, item.level)}:${Math.max(1, item.unit)}`));
    const texts = lessons.flatMap((lesson, lessonIndex) => {
      const key = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
      const speakTextValue = getPlayableLessonText(lesson);
      if (!unitKeySet.has(key) || !speakTextValue) return [];
      return [{
        text: speakTextValue,
        unitId: getLessonUnitId(lesson),
        audioUrl: lesson.audioPath,
        lessonIndex,
      }];
    });

    if (texts.length === 0) return;
    await playEntriesSequentially(texts);
  };

  const {
    handleReview,
    handleResultContinue,
    handleUnitCompleteStay,
    handleUnitCompleteContinue,
  } = useCourseProgression({
    lessons,
    repeatMode,
    totalLevels,
    sectionStart,
    sectionEnd,
    quizSectionStart,
    quizSectionEnd,
    currentStageCode,
    currentStageRange,
    reviewResult,
    setMode,
    setCurrentIndex,
    setLearnStep,
    setRandomOrderVersion,
    setUnitXp,
    setReviewResult,
    setUnlockedLevel,
    setStreak,
    setCompletedUnitKeys,
    setIsSidebarOpen,
    setIsUnitCompleteModalOpen,
    resetQuizState,
  });
  const {
    isLeaveQuizModalOpen,
    isLeaveCompletedUnitModalOpen,
    goToLevelUnit,
    handleLeaveQuizCancel,
    handleLeaveQuizConfirm,
    handleLeaveCompletedUnitCancel,
    handleLeaveCompletedUnitConfirm,
  } = useUnitLeaveGuards({
    mode,
    currentLevel,
    currentUnit,
    learnStep,
    learnStepCount,
    completedUnitKeys,
    navigateToLevelUnit,
    setSidebarTab,
    setIsSidebarOpen,
  });

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
    } else {
      interruptPlaybackImmediately();
    }
    setTrackPlaybackEnabled(false);
    resetUnitPlaybackAnchor();

    try {
      localStorage.removeItem(PROFILE_NAME_KEY);
    } catch {
      // Keep logout resilient if storage is unavailable.
    }

    setProfileName('');
    setProfileInput('');
    setMode('learn');
    setCurrentIndex(DEFAULT_PROGRESS_INDEX);
    setLearnStep(0);
    setUnitXp(0);
    setReviewResult(null);
    setCompletedUnitKeys(new Set());
    setQuizSectionStart(0);
    setQuizSectionEnd(0);
    setIsUnitCompleteModalOpen(false);
    setRoadmapSelectedAlbumKey(null);
    setPendingAutoPlayUnitKey(null);
    setRepeatMode('off');
    setSidebarTab('profile');
    setIsSidebarOpen(false);
    setRandomOrderVersion((prev) => prev + 1);
  };

  const handleToggleShuffle = () => {
    const wasPlaying = isReading || activeSpeakingLessonIndex !== null;
    if (wasPlaying) {
      interruptPlaybackImmediately();
    }

    setIsRandomLessonOrderEnabled((prev) => !prev);
    setRandomOrderVersion((prev) => prev + 1);

    if (wasPlaying && mode === 'learn') {
      setLearnStep(0);
      setPendingAutoPlayUnitKey(`${currentLevel}:${currentUnit}`);
    }
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  if (loading) {
    return <LoadingView />;
  }

  if (errorMessage || lessons.length === 0) {
    return <LessonsUnavailableView errorMessage={errorMessage} apiBaseUrl={apiBaseUrl} />;
  }

  if (!profileName) {
    return (
      <WelcomeView
        profileInput={profileInput}
        profileError={profileError}
        hasProfileWhitespace={hasProfileWhitespace}
        isProfileInputValid={isProfileInputValid}
        onProfileInputChange={setProfileInput}
        onApplyProfileName={handleApplyProfileName}
      />
    );
  }

  const translationLabel = defaultLanguage === 'burmese' ? 'Burmese (Current)' : 'English';
  const totalLessonsCount = lessons.length;
  const completedLessonsCount = Math.min(currentIndex + 1, totalLessonsCount);
  const overallProgressPercent = totalLessonsCount > 0
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
    : 0;
  const activeUnitKey = `${currentLevel}:${currentUnit}`;
  const stageUnits = buildStageUnitsFromLessons(lessons).sort((a, b) => a.level - b.level || a.unit - b.unit);
  const completedRoadmapKeys =
    mode === 'completed'
      ? new Set(stageUnits.map((item) => `${item.level}:${item.unit}`))
      : completedUnitKeys;
  const isLevelsView = sidebarTab === 'levels';
  const isProfileView = sidebarTab === 'profile';
  const isLessonView = sidebarTab === 'lesson';
  const isSettingsView = sidebarTab === 'settings';
  const showLessonActions = isLessonView || isLevelsView;

  const leaveQuizModalProps = {
    isOpen: isLeaveQuizModalOpen,
    title: leaveQuizModalTitle,
    message: leaveQuizConfirmMessage,
    cancelLabel: leaveQuizCancelLabel,
    confirmLabel: leaveQuizConfirmLabel,
    onCancel: handleLeaveQuizCancel,
    onConfirm: handleLeaveQuizConfirm,
  };
  const leaveCompletedUnitModalProps = {
    isOpen: isLeaveCompletedUnitModalOpen,
    title: leaveCompletedUnitModalTitle,
    message: leaveCompletedUnitConfirmMessage,
    cancelLabel: leaveCompletedUnitCancelLabel,
    confirmLabel: leaveCompletedUnitConfirmLabel,
    onCancel: handleLeaveCompletedUnitCancel,
    onConfirm: handleLeaveCompletedUnitConfirm,
  };
  const unitCompleteModalProps = {
    isOpen: isUnitCompleteModalOpen,
    title: unitCompleteModalTitle,
    message: unitCompleteModalMessage,
    cancelLabel: unitCompleteModalCancelLabel,
    confirmLabel: unitCompleteModalConfirmLabel,
    onCancel: handleUnitCompleteStay,
    onConfirm: handleUnitCompleteContinue,
  };
  const logoutModalProps = {
    isOpen: isLogoutModalOpen,
    title: defaultLanguage === 'burmese' ? 'Log out လုပ်မလား?' : 'Log out?',
    message:
      defaultLanguage === 'burmese'
        ? 'အကောင့်ကနေထွက်မယ်ဆိုတာ အတည်ပြုပါ။'
        : 'Are you sure you want to log out from this profile?',
    cancelLabel: defaultLanguage === 'burmese' ? 'မထွက်တော့ဘူး' : 'Cancel',
    confirmLabel: defaultLanguage === 'burmese' ? 'Log out' : 'Log out',
    onCancel: () => setIsLogoutModalOpen(false),
    onConfirm: () => { void handleLogoutConfirm(); },
  };

  const profileViewProps = {
    profileName,
    progressPercent: overallProgressPercent,
    progressLabel: `${completedLessonsCount}/${totalLessonsCount} lessons completed`,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    currentCourseCode,
    unlockedUnits: Math.max(unlockedLevel, 1),
    totalUnits: Math.max(totalLevels, 1),
    streak,
    onProfileInputChange: setProfileInput,
    onApplyProfileName: handleApplyProfileName,
    onRequestLogout: () => setIsLogoutModalOpen(true),
  };

  const levelsViewProps = {
    lessons,
    defaultLanguage,
    learnLanguage,
    onSelectUnit: goToLevelUnit,
    onReadAlbum: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => {
      void handleReadRoadmapAlbum(units, albumKey);
    },
    selectedAlbumKey: roadmapSelectedAlbumKey,
    onSelectedAlbumKeyChange: setRoadmapSelectedAlbumKey,
    completedUnitKeys: completedRoadmapKeys,
    activeUnitKey,
    downloadedUnitKeys,
    onDownloadUnit: (level: number, unit: number) => { void downloadUnitPack(level, unit); },
    onRemoveUnitDownload: (level: number, unit: number) => { void removeUnitPack(level, unit); },
    isUnitDownloading,
  };

  const settingsViewProps = {
    defaultLanguage,
    learnLanguage,
    isPronunciationEnabled,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    textScalePercent,
    canDecreaseTextSize: textScalePercent > 90,
    canIncreaseTextSize: textScalePercent < 120,
    translationLabel,
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
  };

  const matchReviewViewProps = {
    currentCourseCode,
    currentLevelTitle,
    unitXp,
    matchPairs,
    matchAnswerOptions,
    matchedPairIds,
    selectedPromptId,
    selectedAnswerId,
    answerChecked,
    matchMistakes,
    matchPairsPerReview: MATCH_PAIRS_PER_REVIEW,
    isMatchReviewComplete,
    onSelectPrompt: handleSelectPrompt,
    onSelectAnswer: handleSelectAnswer,
  };

  const resultViewProps = reviewResult
    ? {
      reviewResult,
      unitXp,
      totalXp: TOTAL_XP_PER_COURSE,
      onContinue: handleResultContinue,
    }
    : null;

  const lessonViewProps = {
    onBackToRoadmap: () => {
      setSidebarTab('levels');
      setIsSidebarOpen(false);
    },
    progressLabel: `${Math.min(learnStepCount, learnStep + 1)}/${learnStepCount}`,
    currentIndex,
    currentBatchEntries,
    allBatchGroups: lessonBatchGroups,
    currentStep: learnStep,
    isReading,
    onSelectStep: handleSelectLessonStep,
    englishReferenceByKey,
    defaultLanguage,
    isPronunciationEnabled,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    textScalePercent,
    learnLanguage,
    activeSpeakingLessonIndex,
    onPlayLesson: handlePlaySingleLesson,
    savedHighlightPhrasesByLessonKey: highlightPhrasesByLessonKey,
    onSaveLessonHighlight: saveHighlightSelection,
    onClearLessonHighlight: clearHighlightSelection,
  };

  const lessonActionFooterProps = {
    mode,
    isNextDisabled: isNextDisabled || (mode === 'learn' && repeatMode === 'off' && sectionEnd >= currentStageRange.end),
    isPreviousDisabled: mode !== 'learn' || isNextDisabled,
    isReadDisabled: mode !== 'learn' || orderedUnitIndexes.length === 0,
    isReading,
    isShuffleEnabled: isRandomLessonOrderEnabled,
    repeatMode,
    isVisible: isMobileBottomBarsVisible,
    onToggleShuffle: handleToggleShuffle,
    onToggleRepeat: handleToggleRepeat,
    onPrevious: handlePrevious,
    onRead: () => { void handleReadCurrentBatch(); },
    onNext: handleNext,
  };

  const mobileBottomNavProps = {
    activeTab: sidebarTab,
    isVisible: isMobileBottomBarsVisible,
    onTabChange: selectTab,
  };

  return (
    <div className="min-h-screen bg-app-radial md:flex">
      <AppDialogs
        leaveQuizModalProps={leaveQuizModalProps}
        leaveCompletedUnitModalProps={leaveCompletedUnitModalProps}
        unitCompleteModalProps={unitCompleteModalProps}
        logoutModalProps={logoutModalProps}
        isSidebarOpen={isSidebarOpen}
        onDismissSidebarOverlay={() => setIsSidebarOpen(false)}
      />

      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        sidebarTab={sidebarTab}
        onClose={closeSidebar}
        onSelectTab={selectTab}
        onReload={reloadApp}
      />

      <div className="flex-1 flex flex-col min-h-screen pb-36 md:ml-72 md:pb-32">
        <AppMainContent
          isProfileView={isProfileView}
          isLevelsView={isLevelsView}
          isSettingsView={isSettingsView}
          mode={mode}
          profileViewProps={profileViewProps}
          levelsViewProps={levelsViewProps}
          settingsViewProps={settingsViewProps}
          matchReviewViewProps={matchReviewViewProps}
          resultViewProps={resultViewProps}
          lessonViewProps={lessonViewProps}
          onCompletedRestart={handleReview}
        />

        <AppBottomBars
          showLessonActions={showLessonActions}
          lessonActionFooterProps={lessonActionFooterProps}
          mobileBottomNavProps={mobileBottomNavProps}
        />
      </div>
    </div>
  );
};

export default App;

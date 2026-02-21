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
import { buildLessonReferenceKey } from './utils/lessonReference';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { LessonView } from './components/views/LessonView';
import { MatchReviewView } from './components/views/MatchReviewView';
import { ResultView } from './components/views/ResultView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LessonActionFooter } from './components/LessonActionFooter';
import { LeaveQuizModal } from './components/modals/LeaveQuizModal';
import { cancelSpeech, speakText } from './components/AudioButton';
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
  LEARN_QUESTIONS_PER_UNIT,
  LESSONS_PER_BATCH,
  MATCH_PAIRS_PER_REVIEW,
  PROFILE_NAME_KEY,
  PROGRESS_KEY,
  QUICK_REVIEW_CHECKPOINTS,
  ReviewResult,
  STREAK_KEY,
  toProfileStorageId,
  TOTAL_XP_PER_COURSE,
  UNLOCKED_LEVEL_KEY,
  resolveStageCode,
} from './config/appConfig';
import { getLessonModalText } from './config/lessonModalText';
import { LevelsView } from './components/views/LevelsView';
import { AppSidebar } from './components/layout/AppSidebar';
import {
  CompletedView,
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

type RepeatMode = 'off' | 'all' | 'one';
type PendingUnitTarget = { level: number; unit: number; albumKey?: string | null };
type SpeakEntry = { text: string; unitId?: number; audioUrl?: string };

const App: React.FC = () => {
  const {
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
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
    isRandomLessonOrderEnabled,
    setIsRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    setIsReviewQuestionsRemoved,
    appTheme,
    setAppTheme,
    lessonLayoutDefault,
    setLessonLayoutDefault,
    hasHydratedSettings,
  } = useAppPreferences(profileName ? toProfileStorageId(profileName) : '');
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [learnStep, setLearnStep] = useState(0);
  const [unitXp, setUnitXp] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [completedUnitKeys, setCompletedUnitKeys] = useState<Set<string>>(new Set());
  const [quizSectionStart, setQuizSectionStart] = useState(0);
  const [quizSectionEnd, setQuizSectionEnd] = useState(0);
  const [isLeaveQuizModalOpen, setIsLeaveQuizModalOpen] = useState(false);
  const [isLeaveCompletedUnitModalOpen, setIsLeaveCompletedUnitModalOpen] = useState(false);
  const [isUnitCompleteModalOpen, setIsUnitCompleteModalOpen] = useState(false);
  const [isLessonUnitBoundaryModalOpen, setIsLessonUnitBoundaryModalOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [lessonLayoutMode, setLessonLayoutMode] = useState<'paged' | 'list'>(lessonLayoutDefault);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [pendingUnitTarget, setPendingUnitTarget] = useState<PendingUnitTarget | null>(null);
  const [roadmapSelectedAlbumKey, setRoadmapSelectedAlbumKey] = useState<string | null>(null);
  const readSessionRef = useRef(0);
  const isContinuousListPlaybackRef = useRef(false);
  const modeRef = useRef<AppMode>('learn');
  const learnStepRef = useRef(0);
  const sectionTotalRef = useRef(1);
  const orderedUnitIndexesRef = useRef<number[]>([]);
  const sectionStartRef = useRef(0);
  const repeatModeRef = useRef<RepeatMode>('off');
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
    startQuizForLevel,
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
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    lessonLayoutDefault,
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
    setIsRandomLessonOrderEnabled,
    setIsReviewQuestionsRemoved,
    setAppTheme,
    setLessonLayoutDefault,
  });

  useSettingsPersistence({
    profileStorageId,
    enabled: Boolean(profileName) && hasHydratedSettings,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    lessonLayoutDefault,
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
    lessonUnitBoundaryModalTitle,
    lessonUnitBoundaryModalMessage,
    lessonUnitBoundaryModalCancelLabel,
    lessonUnitBoundaryModalConfirmLabel,
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
    sectionStart,
    sectionTotal,
  });

  const handleApplyProfileName = () => {
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
    if (mode !== 'learn' && isReading) {
      isContinuousListPlaybackRef.current = false;
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
    }
  }, [isReading, mode]);

  useEffect(() => {
    document.body.classList.toggle('lang-burmese', defaultLanguage === 'burmese');
    document.documentElement.lang = defaultLanguage === 'burmese' ? 'my' : 'en';
  }, [defaultLanguage]);

  useAppTheme(appTheme);

  const previousSidebarTabRef = useRef(sidebarTab);
  useEffect(() => {
    const movedIntoLessonTab = previousSidebarTabRef.current !== 'lesson' && sidebarTab === 'lesson';
    if (movedIntoLessonTab && isReading) {
      isContinuousListPlaybackRef.current = false;
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
    }
    previousSidebarTabRef.current = sidebarTab;
  }, [isReading, sidebarTab]);

  useEffect(() => {
    modeRef.current = mode;
    learnStepRef.current = learnStep;
    sectionTotalRef.current = sectionTotal;
    orderedUnitIndexesRef.current = orderedUnitIndexes;
    sectionStartRef.current = sectionStart;
    repeatModeRef.current = repeatMode;
  }, [mode, learnStep, sectionTotal, orderedUnitIndexes, sectionStart, repeatMode]);

  const playTextsSequentially = async (entries: SpeakEntry[]): Promise<boolean> => {
    if (mode !== 'learn' || entries.length === 0) return false;
    const sessionId = readSessionRef.current + 1;
    readSessionRef.current = sessionId;
    setIsReading(true);
    cancelSpeech();

    for (const entry of entries) {
      if (readSessionRef.current !== sessionId) break;
      await speakText(entry.text, {
        learnLanguage,
        unitId: entry.unitId,
        audioUrl: entry.audioUrl,
      });
    }

    if (readSessionRef.current === sessionId) {
      setIsReading(false);
      return true;
    }
    return false;
  };

  const getBatchTextsForStep = (step: number): SpeakEntry[] => {
    const safeStep = Math.max(0, Math.min(LEARN_QUESTIONS_PER_UNIT - 1, step));
    const sectionTotalValue = Math.max(1, sectionTotalRef.current);
    const offset = (safeStep * LESSONS_PER_BATCH) % sectionTotalValue;
    const batchIndexes = Array.from({ length: LESSONS_PER_BATCH }, (_, idx) => {
      const orderedIndex = orderedUnitIndexesRef.current[(offset + idx) % sectionTotalValue];
      return orderedIndex ?? sectionStartRef.current;
    });
    return batchIndexes
      .map((index) => {
        const lesson = lessons[index];
        if (!lesson) return null;
        const speakTextValue = getPlayableLessonText(lesson);
        if (!speakTextValue) return null;
        return {
          text: speakTextValue,
          unitId: getLessonUnitId(lesson),
          audioUrl: lesson.audioPath,
        };
      })
      .filter((entry): entry is SpeakEntry => entry !== null);
  };

  const proceedUnitCompletionWithoutReviewRef = useRef<() => void>(() => {});

  const runContinuousListPlayback = async () => {
    let cursorStep = learnStepRef.current;
    while (isContinuousListPlaybackRef.current && modeRef.current === 'learn') {
      const texts = getBatchTextsForStep(cursorStep);
      if (texts.length === 0) break;
      const finished = await playTextsSequentially(texts);
      if (!finished || !isContinuousListPlaybackRef.current || modeRef.current !== 'learn') break;

      if (cursorStep >= LEARN_QUESTIONS_PER_UNIT - 1) {
        if (repeatModeRef.current === 'one') {
          setCurrentIndex(sectionStartRef.current);
          setLearnStep(0);
          learnStepRef.current = 0;
          cursorStep = 0;
          setRandomOrderVersion((prev) => prev + 1);
        } else {
          proceedUnitCompletionWithoutReviewRef.current();
          // Let state commit to the next unit before continuing.
          await new Promise((resolve) => window.setTimeout(resolve, 0));
          cursorStep = learnStepRef.current;
        }
      } else {
        const nextStep = cursorStep + 1;
        const sectionTotalValue = Math.max(1, sectionTotalRef.current);
        const nextOffset = (nextStep * LESSONS_PER_BATCH) % sectionTotalValue;
        setLearnStep(nextStep);
        learnStepRef.current = nextStep;
        setCurrentIndex(orderedUnitIndexesRef.current[nextOffset] ?? sectionStartRef.current);
        cursorStep = nextStep;
        // Yield once so selection UI updates before the next batch starts speaking.
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
    }
    isContinuousListPlaybackRef.current = false;
  };

  const handleReadCurrentBatch = async () => {
    if (mode !== 'learn') return;

    if (isReading) {
      isContinuousListPlaybackRef.current = false;
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
      return;
    }

    const texts = currentBatchEntries
      .map(({ lesson }) => {
        const speakTextValue = getPlayableLessonText(lesson);
        if (!speakTextValue) return null;
        return {
          text: speakTextValue,
          unitId: getLessonUnitId(lesson),
          audioUrl: lesson.audioPath,
        };
      })
      .filter((entry): entry is SpeakEntry => entry !== null);

    if (lessonLayoutMode === 'list') {
      isContinuousListPlaybackRef.current = true;
      await runContinuousListPlayback();
      return;
    }

    isContinuousListPlaybackRef.current = false;
    await playTextsSequentially(texts);
  };

  const handleSelectLessonStep = (step: number) => {
    if (mode !== 'learn') return;
    const safeStep = Math.max(0, Math.min(LEARN_QUESTIONS_PER_UNIT - 1, step));
    if (isReading) {
      isContinuousListPlaybackRef.current = false;
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
    }
    learnStepRef.current = safeStep;
    setLearnStep(safeStep);
    const nextOffset = (safeStep * LESSONS_PER_BATCH) % sectionTotal;
    setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
  };

  const handleReadRoadmapAlbum = async (
    units: Array<{ level: number; unit: number }>,
    albumKey?: string | null,
  ) => {
    if (mode !== 'learn') return;
    if (units.length === 0) return;

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

    if (isReading) {
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
    }

    const unitKeySet = new Set(units.map((item) => `${Math.max(1, item.level)}:${Math.max(1, item.unit)}`));
    const texts = lessons
      .filter((lesson) => {
        const key = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
        return unitKeySet.has(key) && getPlayableLessonText(lesson).length > 0;
      })
      .map((lesson) => {
        const speakTextValue = getPlayableLessonText(lesson);
        return {
          text: speakTextValue,
          unitId: getLessonUnitId(lesson),
          audioUrl: lesson.audioPath,
        };
      });

    if (texts.length === 0) return;

    const sessionId = readSessionRef.current + 1;
    readSessionRef.current = sessionId;
    setIsReading(true);
    cancelSpeech();

    for (const entry of texts) {
      if (readSessionRef.current !== sessionId) break;
      await speakText(entry.text, {
        learnLanguage,
        unitId: entry.unitId,
        audioUrl: entry.audioUrl,
      });
    }

    if (readSessionRef.current === sessionId) {
      setIsReading(false);
    }
  };

  const proceedUnitCompletionWithoutReview = () => {
    const completedUnitKey = lessons[sectionStart]
      ? `${getLessonOrderIndex(lessons[sectionStart])}:${getLessonUnitId(lessons[sectionStart])}`
      : null;
    if (completedUnitKey) {
      setCompletedUnitKeys((prev) => new Set([...prev, completedUnitKey]));
    }
    const passedLevel = lessons[sectionStart] ? getLessonOrderIndex(lessons[sectionStart]) : 1;
    const nextUnlocked = Math.min(totalLevels, passedLevel + 1);
    setUnlockedLevel((prev) => Math.max(prev, nextUnlocked));
    setStreak((prev) => prev + 1);

    const nextStart = sectionEnd + 1;
    if (repeatMode === 'one') {
      setMode('learn');
      setCurrentIndex(sectionStart);
      setLearnStep(0);
      setRandomOrderVersion((prev) => prev + 1);
      setUnitXp(0);
      setReviewResult(null);
      resetQuizState();
      return;
    }
    const isBeyondCurrentStage =
      nextStart >= lessons.length
      || resolveStageCode(getLessonOrderIndex(lessons[nextStart]), lessons[nextStart]?.stage) !== currentStageCode;
    if (isBeyondCurrentStage) {
      if (repeatMode === 'all') {
        setMode('learn');
        setCurrentIndex(currentStageRange.start);
        setLearnStep(0);
        setRandomOrderVersion((prev) => prev + 1);
        setUnitXp(0);
        setReviewResult(null);
        resetQuizState();
      } else {
        setMode('completed');
        setUnlockedLevel(totalLevels);
        setReviewResult(null);
        resetQuizState();
      }
      return;
    }

    setMode('learn');
    setCurrentIndex(nextStart);
    setLearnStep(0);
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
  };

  useEffect(() => {
    proceedUnitCompletionWithoutReviewRef.current = proceedUnitCompletionWithoutReview;
  }, [proceedUnitCompletionWithoutReview]);

  const startCheckpointQuizForStep = (nextStep: number) => {
    const previousCheckpoint =
      QUICK_REVIEW_CHECKPOINTS.filter((checkpoint) => checkpoint < nextStep).at(-1) || 0;
    const reviewSourceIndexes = Array.from(
      { length: (nextStep - previousCheckpoint) * LESSONS_PER_BATCH },
      (_, idx) => {
        const offset = ((previousCheckpoint * LESSONS_PER_BATCH) + idx) % sectionTotal;
        return orderedUnitIndexes[offset] ?? sectionStart;
      },
    );
    const reviewSourceLessons = reviewSourceIndexes
      .map((index) => lessons[index])
      .filter((lesson): lesson is LessonData => Boolean(lesson));

    setQuizSectionStart(sectionStart);
    setQuizSectionEnd(sectionEnd);
    if (reviewSourceLessons.length > 0) {
      startQuizForLevel(reviewSourceLessons, 0, reviewSourceLessons.length - 1);
    } else {
      startQuizForLevel(lessons, sectionStart, sectionEnd);
    }
    setMode('quiz');
  };

  const handleNext = () => {
    if (isNextDisabled || mode !== 'learn') return;
    isContinuousListPlaybackRef.current = false;

    setIsNextDisabled(true);
    const nextStep = learnStep + 1;
    setLearnStep(nextStep);

    const isCheckpointStep = false;

    if (nextStep >= LEARN_QUESTIONS_PER_UNIT) {
      setIsLessonUnitBoundaryModalOpen(true);
      setIsNextDisabled(false);
      return;
    }

    const needsCheckpoint = isCheckpointStep;
    if (needsCheckpoint) {
      startCheckpointQuizForStep(nextStep);
    } else {
      const nextOffset = (nextStep * LESSONS_PER_BATCH) % sectionTotal;
      setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
      if (lessonLayoutMode === 'list') {
        void playTextsSequentially(getBatchTextsForStep(nextStep));
      }
    }

    setIsNextDisabled(false);
  };

  const handlePrevious = () => {
    if (mode !== 'learn' || isNextDisabled) return;

    if (isReading) {
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
    }

    setIsNextDisabled(true);

    if (learnStep <= 0) {
      if (repeatMode === 'one') {
        setCurrentIndex(sectionStart);
        setLearnStep(LEARN_QUESTIONS_PER_UNIT - 1);
        setIsNextDisabled(false);
        return;
      }

      if (sectionStart <= 0) {
        if (repeatMode !== 'all') {
          setIsNextDisabled(false);
          return;
        }
        const lastLessonIndex = currentStageRange.end;
        const lastLesson = lessons[lastLessonIndex];
        if (!lastLesson) {
          setIsNextDisabled(false);
          return;
        }
        const lastLevel = getLessonOrderIndex(lastLesson);
        const lastUnit = getLessonUnitId(lastLesson);
        const lastUnitIndexes = lessons.reduce<number[]>((acc, lesson, idx) => {
          if (getLessonOrderIndex(lesson) === lastLevel && getLessonUnitId(lesson) === lastUnit) {
            acc.push(idx);
          }
          return acc;
        }, []);
        setCurrentIndex(lastUnitIndexes[0] ?? lastLessonIndex);
        setLearnStep(LEARN_QUESTIONS_PER_UNIT - 1);
        setIsNextDisabled(false);
        return;
      }

      let previousUnitAnchor = sectionStart - 1;
      if (repeatMode === 'all') {
        const previousStageCode = lessons[previousUnitAnchor]
          ? resolveStageCode(getLessonOrderIndex(lessons[previousUnitAnchor]), lessons[previousUnitAnchor]?.stage)
          : currentStageCode;
        if (previousUnitAnchor < 0 || previousStageCode !== currentStageCode) {
          previousUnitAnchor = currentStageRange.end;
        }
      }
      const previousUnitLesson = lessons[previousUnitAnchor];
      if (!previousUnitLesson) {
        setIsNextDisabled(false);
        return;
      }

      const previousLevel = getLessonOrderIndex(previousUnitLesson);
      const previousUnit = getLessonUnitId(previousUnitLesson);
      const previousUnitIndexes = lessons.reduce<number[]>((acc, lesson, idx) => {
        if (getLessonOrderIndex(lesson) === previousLevel && getLessonUnitId(lesson) === previousUnit) {
          acc.push(idx);
        }
        return acc;
      }, []);

      setCurrentIndex(previousUnitIndexes[0] ?? previousUnitAnchor);
      setLearnStep(LEARN_QUESTIONS_PER_UNIT - 1);
      setIsNextDisabled(false);
      return;
    }

    const previousStep = Math.max(0, learnStep - 1);
    setLearnStep(previousStep);
    const previousOffset = (previousStep * LESSONS_PER_BATCH) % sectionTotal;
    setCurrentIndex(orderedUnitIndexes[previousOffset] ?? sectionStart);
    setIsNextDisabled(false);
  };

  const navigateToLevelUnit = (level: number, unit: number, albumKey?: string | null) => {
    const safeLevel = Math.min(Math.max(level, 1), totalLevels);
    const safeUnit = Math.max(1, unit);
    const target = lessons.findIndex(
      (lesson) => getLessonOrderIndex(lesson) === safeLevel && getLessonUnitId(lesson) === safeUnit,
    );
    if (target < 0) return;
    if (isReading) {
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
    }
    if (albumKey !== undefined) {
      setRoadmapSelectedAlbumKey(albumKey);
    }
    setMode('learn');
    setCurrentIndex(target);
    setUnlockedLevel((prev) => Math.max(prev, safeLevel));
    setSidebarTab('lesson');
    setLearnStep(0);
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
    setIsSidebarOpen(false);
  };

  const goToLevelUnit = (level: number, unit: number, albumKey?: string | null) => {
    const targetUnitKey = `${Math.max(1, level)}:${Math.max(1, unit)}`;
    const isSwitchingUnit = targetUnitKey !== `${currentLevel}:${currentUnit}`;
    const currentUnitKey = `${currentLevel}:${currentUnit}`;
    const isCurrentUnitAlreadyCompleted = completedUnitKeys.has(currentUnitKey);
    const isUnitLearnStepCompleted = mode === 'learn' && learnStep >= LEARN_QUESTIONS_PER_UNIT - 1;

    if (mode === 'quiz') {
      setPendingUnitTarget({ level, unit, albumKey });
      setIsLeaveQuizModalOpen(true);
      return;
    }

    if (
      isSwitchingUnit
      && isUnitLearnStepCompleted
      && !isCurrentUnitAlreadyCompleted
    ) {
      setPendingUnitTarget({ level, unit, albumKey });
      setIsLeaveCompletedUnitModalOpen(true);
      return;
    }

    navigateToLevelUnit(level, unit, albumKey);
  };

  const handleLeaveQuizCancel = () => {
    setIsLeaveQuizModalOpen(false);
    setPendingUnitTarget(null);
  };

  const handleLeaveQuizConfirm = () => {
    if (pendingUnitTarget) {
      navigateToLevelUnit(pendingUnitTarget.level, pendingUnitTarget.unit, pendingUnitTarget.albumKey);
    }
    setIsLeaveQuizModalOpen(false);
    setPendingUnitTarget(null);
  };

  const handleLeaveCompletedUnitCancel = () => {
    setIsLeaveCompletedUnitModalOpen(false);
    setPendingUnitTarget(null);
    setSidebarTab('lesson');
    setIsSidebarOpen(false);
  };

  const handleLeaveCompletedUnitConfirm = () => {
    if (pendingUnitTarget) {
      navigateToLevelUnit(pendingUnitTarget.level, pendingUnitTarget.unit, pendingUnitTarget.albumKey);
    }
    setIsLeaveCompletedUnitModalOpen(false);
    setPendingUnitTarget(null);
  };

  const continueFromPassedResult = () => {
    const passedLevel = lessons[quizSectionStart] ? getLessonOrderIndex(lessons[quizSectionStart]) : 1;
    const completedUnitKey = lessons[quizSectionStart]
      ? `${getLessonOrderIndex(lessons[quizSectionStart])}:${getLessonUnitId(lessons[quizSectionStart])}`
      : null;
    if (completedUnitKey) {
      setCompletedUnitKeys((prev) => new Set([...prev, completedUnitKey]));
    }
    const nextUnlocked = Math.min(totalLevels, passedLevel + 1);
    setUnlockedLevel((prev) => Math.max(prev, nextUnlocked));
    setStreak((prev) => prev + 1);

    const nextStart = quizSectionEnd + 1;
    if (repeatMode === 'one') {
      setMode('learn');
      setCurrentIndex(quizSectionStart);
      setLearnStep(0);
      setRandomOrderVersion((prev) => prev + 1);
      setUnitXp(0);
      setReviewResult(null);
      resetQuizState();
      return;
    }
    const isBeyondCurrentStage =
      nextStart >= lessons.length
      || resolveStageCode(getLessonOrderIndex(lessons[nextStart]), lessons[nextStart]?.stage) !== currentStageCode;
    if (isBeyondCurrentStage) {
      if (repeatMode === 'all') {
        setMode('learn');
        setCurrentIndex(currentStageRange.start);
        setLearnStep(0);
        setRandomOrderVersion((prev) => prev + 1);
        setUnitXp(0);
        setReviewResult(null);
        resetQuizState();
      } else {
        setMode('completed');
        setUnlockedLevel(totalLevels);
        setReviewResult(null);
        resetQuizState();
      }
      return;
    }

    setMode('learn');
    setCurrentIndex(nextStart);
    setLearnStep(0);
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
  };

  const handleReview = () => {
    setMode('learn');
    setCurrentIndex(0);
    setLearnStep(0);
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
    setIsSidebarOpen(false);
  };

  const handleResultContinue = () => {
    if (!reviewResult) return;

    if (!reviewResult.passed) {
      setMode('learn');
      setCurrentIndex(quizSectionStart);
      setLearnStep(0);
      setRandomOrderVersion((prev) => prev + 1);
      setUnitXp(0);
      setReviewResult(null);
      resetQuizState();
      setStreak(0);
      return;
    }

    setIsUnitCompleteModalOpen(true);
  };

  const handleUnitCompleteStay = () => {
    setIsUnitCompleteModalOpen(false);
  };

  const handleUnitCompleteContinue = () => {
    setIsUnitCompleteModalOpen(false);
    continueFromPassedResult();
  };

  const handleLessonUnitBoundaryStay = () => {
    setIsLessonUnitBoundaryModalOpen(false);
    setIsNextDisabled(false);
  };

  const handleLessonUnitBoundaryContinue = () => {
    setIsLessonUnitBoundaryModalOpen(false);
    setIsNextDisabled(false);
    proceedUnitCompletionWithoutReview();
  };

  const handleToggleShuffle = () => {
    setIsRandomLessonOrderEnabled((prev) => !prev);
    setRandomOrderVersion((prev) => prev + 1);
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

  return (
    <div className="min-h-screen bg-app-radial md:flex">
      <LeaveQuizModal
        isOpen={isLeaveQuizModalOpen}
        title={leaveQuizModalTitle}
        message={leaveQuizConfirmMessage}
        cancelLabel={leaveQuizCancelLabel}
        confirmLabel={leaveQuizConfirmLabel}
        onCancel={handleLeaveQuizCancel}
        onConfirm={handleLeaveQuizConfirm}
      />
      <LeaveQuizModal
        isOpen={isLeaveCompletedUnitModalOpen}
        title={leaveCompletedUnitModalTitle}
        message={leaveCompletedUnitConfirmMessage}
        cancelLabel={leaveCompletedUnitCancelLabel}
        confirmLabel={leaveCompletedUnitConfirmLabel}
        onCancel={handleLeaveCompletedUnitCancel}
        onConfirm={handleLeaveCompletedUnitConfirm}
      />
      <LeaveQuizModal
        isOpen={isUnitCompleteModalOpen}
        title={unitCompleteModalTitle}
        message={unitCompleteModalMessage}
        cancelLabel={unitCompleteModalCancelLabel}
        confirmLabel={unitCompleteModalConfirmLabel}
        onCancel={handleUnitCompleteStay}
        onConfirm={handleUnitCompleteContinue}
      />
      <LeaveQuizModal
        isOpen={isLessonUnitBoundaryModalOpen}
        title={lessonUnitBoundaryModalTitle}
        message={lessonUnitBoundaryModalMessage}
        cancelLabel={lessonUnitBoundaryModalCancelLabel}
        confirmLabel={lessonUnitBoundaryModalConfirmLabel}
        onCancel={handleLessonUnitBoundaryStay}
        onConfirm={handleLessonUnitBoundaryContinue}
      />

      {isSidebarOpen && (
        <button
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        sidebarTab={sidebarTab}
        onClose={closeSidebar}
        onSelectTab={selectTab}
        onReload={reloadApp}
      />

      <div className="flex-1 flex flex-col min-h-screen pb-36 md:pb-32">
        <main
          className="flex-1 flex items-start justify-center p-4 pt-6 md:p-6 md:pt-8"
        >
          {isProfileView ? (
            <ProfileView
              profileName={profileName}
              progressPercent={overallProgressPercent}
              progressLabel={`${completedLessonsCount}/${totalLessonsCount} lessons completed`}
              profileInput={profileInput}
              profileError={profileError}
              hasProfileWhitespace={hasProfileWhitespace}
              isProfileInputValid={isProfileInputValid}
              currentCourseCode={currentCourseCode}
              unlockedUnits={Math.max(unlockedLevel, 1)}
              totalUnits={Math.max(totalLevels, 1)}
              streak={streak}
              onProfileInputChange={setProfileInput}
              onApplyProfileName={handleApplyProfileName}
            />
          ) : isLevelsView ? (
            <LevelsView
              lessons={lessons}
              defaultLanguage={defaultLanguage}
              onSelectUnit={goToLevelUnit}
              onReadAlbum={(units, albumKey) => { void handleReadRoadmapAlbum(units, albumKey); }}
              selectedAlbumKey={roadmapSelectedAlbumKey}
              onSelectedAlbumKeyChange={setRoadmapSelectedAlbumKey}
              completedUnitKeys={completedRoadmapKeys}
              activeUnitKey={activeUnitKey}
              downloadedUnitKeys={downloadedUnitKeys}
              onDownloadUnit={(level, unit) => { void downloadUnitPack(level, unit); }}
              onRemoveUnitDownload={(level, unit) => { void removeUnitPack(level, unit); }}
              isUnitDownloading={isUnitDownloading}
            />
          ) : isSettingsView ? (
            <SettingsView
              defaultLanguage={defaultLanguage}
              learnLanguage={learnLanguage}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              textScalePercent={textScalePercent}
              canDecreaseTextSize={textScalePercent > 90}
              canIncreaseTextSize={textScalePercent < 120}
              translationLabel={translationLabel}
              appTheme={appTheme}
              lessonLayoutDefault={lessonLayoutDefault}
              onDefaultLanguageChange={setDefaultLanguage}
              onLearnLanguageChange={setLearnLanguage}
              onTogglePronunciation={() => setIsPronunciationEnabled((prev) => !prev)}
              onToggleBoldText={() => setIsBoldTextEnabled((prev) => !prev)}
              onDecreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev - 5))}
              onIncreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev + 5))}
              onAppThemeChange={setAppTheme}
              onLessonLayoutDefaultChange={setLessonLayoutDefault}
            />
          ) : mode === 'quiz' ? (
            <MatchReviewView
              currentCourseCode={currentCourseCode}
              currentLevelTitle={currentLevelTitle}
              unitXp={unitXp}
              matchPairs={matchPairs}
              matchAnswerOptions={matchAnswerOptions}
              matchedPairIds={matchedPairIds}
              selectedPromptId={selectedPromptId}
              selectedAnswerId={selectedAnswerId}
              answerChecked={answerChecked}
              matchMistakes={matchMistakes}
              matchPairsPerReview={MATCH_PAIRS_PER_REVIEW}
              isMatchReviewComplete={isMatchReviewComplete}
              onSelectPrompt={handleSelectPrompt}
              onSelectAnswer={handleSelectAnswer}
            />
          ) : mode === 'result' && reviewResult ? (
            <ResultView
              reviewResult={reviewResult}
              unitXp={unitXp}
              totalXp={TOTAL_XP_PER_COURSE}
              onContinue={handleResultContinue}
            />
          ) : mode === 'completed' ? (
            <CompletedView onRestart={handleReview} />
          ) : (
            <LessonView
              onBackToRoadmap={() => {
                setSidebarTab('levels');
                setIsSidebarOpen(false);
              }}
              progressLabel={`${Math.min(LEARN_QUESTIONS_PER_UNIT, learnStep + 1)}/${LEARN_QUESTIONS_PER_UNIT}`}
              currentIndex={currentIndex}
              currentBatchEntries={currentBatchEntries}
              allBatchGroups={lessonBatchGroups}
              currentStep={learnStep}
              isReading={isReading}
              onSelectStep={handleSelectLessonStep}
              englishReferenceLessons={englishReferenceLessons}
              englishReferenceByKey={englishReferenceByKey}
              defaultLanguage={defaultLanguage}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              learnLanguage={learnLanguage}
              defaultLayoutMode={lessonLayoutDefault}
              onLayoutModeChange={setLessonLayoutMode}
            />
          )}
        </main>

        {isLessonView && (
          <LessonActionFooter
            mode={mode}
            isNextDisabled={isNextDisabled}
            isPreviousDisabled={
              mode !== 'learn'
              || isNextDisabled
              || (learnStep <= 0 && sectionStart <= 0 && repeatMode !== 'all' && repeatMode !== 'one')
            }
            isReadDisabled={mode !== 'learn' || currentBatchEntries.length === 0}
            isReading={isReading}
            isShuffleEnabled={isRandomLessonOrderEnabled}
            repeatMode={repeatMode}
            onToggleShuffle={handleToggleShuffle}
            onToggleRepeat={handleToggleRepeat}
            onPrevious={handlePrevious}
            onRead={() => { void handleReadCurrentBatch(); }}
            onNext={handleNext}
          />
        )}

        <MobileBottomNav
          activeTab={sidebarTab}
          onTabChange={selectTab}
        />
      </div>
    </div>
  );
};

export default App;

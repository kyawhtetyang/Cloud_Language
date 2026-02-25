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
import {
  PREVIOUS_TRACK_SEEK_THRESHOLD_MS,
  SPEECH_IDLE_POLL_INTERVAL_MS,
  SPEECH_IDLE_TIMEOUT_MS,
} from './config/interactionConfig';
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
type SpeakEntry = { text: string; unitId: number; audioUrl: string | undefined; lessonIndex: number };

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
  const [isReading, setIsReading] = useState(false);
  const [activeSpeakingLessonIndex, setActiveSpeakingLessonIndex] = useState<number | null>(null);
  const [isMobileBottomBarsVisible, setIsMobileBottomBarsVisible] = useState(true);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [pendingUnitTarget, setPendingUnitTarget] = useState<PendingUnitTarget | null>(null);
  const [pendingAutoPlayUnitKey, setPendingAutoPlayUnitKey] = useState<string | null>(null);

  const [roadmapSelectedAlbumKey, setRoadmapSelectedAlbumKey] = useState<string | null>(null);
  const readSessionRef = useRef(0);
  const isTrackPlaybackRef = useRef(false);
  const lastPlayAnchorLessonIndexRef = useRef<number | null>(null);
  const unitPlaybackStartedAtRef = useRef<number | null>(null);
  const lastUnitKeyRef = useRef<string>('');
  const isUnitNavigationLockedRef = useRef(false);
  const playbackTokenRef = useRef(0);
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
  useEffect(() => {
    const unitKey = `${currentLevel}:${currentUnit}`;
    if (lastUnitKeyRef.current === unitKey) return;
    lastUnitKeyRef.current = unitKey;
    unitPlaybackStartedAtRef.current = null;
    lastPlayAnchorLessonIndexRef.current = null;
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

  const bumpPlaybackToken = (): number => {
    playbackTokenRef.current += 1;
    return playbackTokenRef.current;
  };

  const isPlaybackTokenCurrent = (token: number): boolean => playbackTokenRef.current === token;

  const waitForSpeechIdle = async (timeoutMs = SPEECH_IDLE_TIMEOUT_MS): Promise<void> => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (!synth.speaking && !synth.pending) return;
      await new Promise((resolve) => window.setTimeout(resolve, SPEECH_IDLE_POLL_INTERVAL_MS));
    }
  };

  const stopActivePlayback = async (): Promise<void> => {
    isTrackPlaybackRef.current = false;
    readSessionRef.current += 1;
    bumpPlaybackToken();
    setIsReading(false);
    setActiveSpeakingLessonIndex(null);
    cancelSpeech();
    await waitForSpeechIdle();
  };

  const runWithUnitNavigationLock = async (
    task: () => Promise<void> | void,
  ): Promise<void> => {
    if (isUnitNavigationLockedRef.current) return;
    isUnitNavigationLockedRef.current = true;
    setIsNextDisabled(true);
    try {
      await task();
    } finally {
      isUnitNavigationLockedRef.current = false;
      setIsNextDisabled(false);
    }
  };

  useEffect(() => {
    if (mode !== 'learn' && (isReading || activeSpeakingLessonIndex !== null)) {
      isTrackPlaybackRef.current = false;
      readSessionRef.current += 1;
      bumpPlaybackToken();
      setIsReading(false);
      setActiveSpeakingLessonIndex(null);
      cancelSpeech();
    }
  }, [activeSpeakingLessonIndex, isReading, mode]);

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

  const playTextsSequentially = async (entries: SpeakEntry[]): Promise<boolean> => {
    if (mode !== 'learn' || entries.length === 0) return false;
    const sessionId = readSessionRef.current + 1;
    const playbackToken = bumpPlaybackToken();
    readSessionRef.current = sessionId;
    unitPlaybackStartedAtRef.current = Date.now();
    setIsReading(true);
    setActiveSpeakingLessonIndex(null);
    cancelSpeech();
    await waitForSpeechIdle();

    for (const entry of entries) {
      if (readSessionRef.current !== sessionId) break;
      if (isPlaybackTokenCurrent(playbackToken)) {
        lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
        setActiveSpeakingLessonIndex(entry.lessonIndex);
      }
      await speakText(entry.text, {
        learnLanguage,
        unitId: entry.unitId,
        audioUrl: entry.audioUrl,
        voiceProvider,
        onStart: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
            setActiveSpeakingLessonIndex(entry.lessonIndex);
          }
        },
        onEnd: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            setActiveSpeakingLessonIndex(null);
          }
        },
      });
    }

    if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
      setIsReading(false);
      setActiveSpeakingLessonIndex(null);
      return true;
    }
    return false;
  };

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

  const resolveCurrentUnitStart = (): number | null => resolveUnitStartFromAnchor(sectionStart);

  const resolvePreviousUnitStartWithinStage = (): number | null => {
    let previousAnchor = sectionStart - 1;
    const isBeforeCurrentStage =
      previousAnchor < 0
      || resolveStageCode(getLessonOrderIndex(lessons[previousAnchor]), lessons[previousAnchor]?.stage) !== currentStageCode;

    if (isBeforeCurrentStage) {
      if (repeatMode === 'all') {
        previousAnchor = currentStageRange.end;
      } else {
        return null;
      }
    }

    if (previousAnchor < 0) return null;
    return resolveUnitStartFromAnchor(previousAnchor);
  };

  const shouldPreviousJumpToPreviousUnit = (): boolean => {
    const firstLessonIndex = orderedUnitIndexes[0];
    if (typeof firstLessonIndex !== 'number') return true;

    const currentPositionLessonIndex = typeof activeSpeakingLessonIndex === 'number'
      ? activeSpeakingLessonIndex
      : lastPlayAnchorLessonIndexRef.current;
    const isOnFirstSentence = currentPositionLessonIndex === firstLessonIndex;
    const isKnownCurrentUnitPosition =
      typeof currentPositionLessonIndex === 'number'
      && orderedUnitIndexes.includes(currentPositionLessonIndex);
    const elapsedMs = unitPlaybackStartedAtRef.current === null
      ? 0
      : Math.max(0, Date.now() - unitPlaybackStartedAtRef.current);
    const isWithinSeekThreshold = elapsedMs <= PREVIOUS_TRACK_SEEK_THRESHOLD_MS;

    return (isOnFirstSentence || !isKnownCurrentUnitPosition) && isWithinSeekThreshold;
  };

  const resolveUnitStartFromAnchor = (anchorIndex: number): number | null => {
    const anchorLesson = lessons[anchorIndex];
    if (!anchorLesson) return null;
    const targetLevel = getLessonOrderIndex(anchorLesson);
    const targetUnit = getLessonUnitId(anchorLesson);
    const unitStart = lessons.findIndex(
      (lesson) => getLessonOrderIndex(lesson) === targetLevel && getLessonUnitId(lesson) === targetUnit,
    );
    return unitStart >= 0 ? unitStart : null;
  };

  const resolveNextUnitStartForTrackPlayback = (): number | null => {
    const currentUnitStart = resolveUnitStartFromAnchor(sectionStart);
    if (currentUnitStart === null) return null;
    const currentLesson = lessons[currentUnitStart];
    if (!currentLesson) return null;
    const currentUnitKey = `${getLessonOrderIndex(currentLesson)}:${getLessonUnitId(currentLesson)}`;

    if (repeatMode === 'one') {
      return playableCourseUnitKeys.has(currentUnitKey) ? currentUnitStart : null;
    }

    const currentUnitPosition = orderedCourseUnitStartIndexes.findIndex((index) => {
      const lesson = lessons[index];
      if (!lesson) return false;
      return `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}` === currentUnitKey;
    });
    if (currentUnitPosition < 0) return null;

    const findPlayableStart = (indexes: number[]): number | null => {
      for (const startIndex of indexes) {
        const lesson = lessons[startIndex];
        if (!lesson) continue;
        const unitKey = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
        if (playableCourseUnitKeys.has(unitKey)) {
          return startIndex;
        }
      }
      return null;
    };

    const forwardCandidates = orderedCourseUnitStartIndexes.slice(currentUnitPosition + 1);
    const forwardMatch = findPlayableStart(forwardCandidates);
    if (forwardMatch !== null) return forwardMatch;

    if (repeatMode === 'all') {
      const wrapCandidates = orderedCourseUnitStartIndexes.slice(0, currentUnitPosition + 1);
      return findPlayableStart(wrapCandidates);
    }

    return null;
  };

  const continueTrackPlaybackIfNeeded = (): void => {
    if (!isTrackPlaybackRef.current) return;
    const targetUnitStart = resolveNextUnitStartForTrackPlayback();
    if (targetUnitStart === null) {
      isTrackPlaybackRef.current = false;
      return;
    }
    queueAutoPlayForUnitStart(targetUnitStart);
  };

  const handlePlaySingleLesson = (lesson: LessonData, lessonIndex: number) => {
    const speakValue = getPlayableLessonText(lesson);
    void (async () => {
      isTrackPlaybackRef.current = false;
      readSessionRef.current += 1;
      const sessionId = readSessionRef.current;
      const playbackToken = bumpPlaybackToken();
      unitPlaybackStartedAtRef.current = Date.now();
      setIsReading(false);
      lastPlayAnchorLessonIndexRef.current = lessonIndex;
      setActiveSpeakingLessonIndex(lessonIndex);
      cancelSpeech();
      await waitForSpeechIdle();

      if (!speakValue || readSessionRef.current !== sessionId || !isPlaybackTokenCurrent(playbackToken)) {
        return;
      }

      lastPlayAnchorLessonIndexRef.current = lessonIndex;
      setActiveSpeakingLessonIndex(lessonIndex);
      await speakText(speakValue, {
        learnLanguage,
        unitId: getLessonUnitId(lesson),
        audioUrl: lesson.audioPath,
        voiceProvider,
        onStart: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            lastPlayAnchorLessonIndexRef.current = lessonIndex;
            setActiveSpeakingLessonIndex(lessonIndex);
          }
        },
        onEnd: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            setActiveSpeakingLessonIndex(null);
          }
        },
      });

      if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
        setActiveSpeakingLessonIndex(null);
      }
    })();
  };

  const handleReadCurrentBatch = async () => {
    if (mode !== 'learn') return;

    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
      return;
    }

    isTrackPlaybackRef.current = true;
    unitPlaybackStartedAtRef.current = Date.now();
    const texts = getCurrentUnitSpeakEntries(lastPlayAnchorLessonIndexRef.current);
    if (texts.length === 0) {
      continueTrackPlaybackIfNeeded();
      return;
    }
    const finished = await playTextsSequentially(texts);
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
      const finished = await playTextsSequentially(texts);
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
    isTrackPlaybackRef.current = false;
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
    isTrackPlaybackRef.current = false;

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

    const sessionId = readSessionRef.current + 1;
    const playbackToken = bumpPlaybackToken();
    readSessionRef.current = sessionId;
    unitPlaybackStartedAtRef.current = Date.now();
    setIsReading(true);
    setActiveSpeakingLessonIndex(null);
    cancelSpeech();
    await waitForSpeechIdle();

    for (const entry of texts) {
      if (readSessionRef.current !== sessionId) break;
      if (isPlaybackTokenCurrent(playbackToken)) {
        lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
        setActiveSpeakingLessonIndex(entry.lessonIndex);
      }
      await speakText(entry.text, {
        learnLanguage,
        unitId: entry.unitId,
        audioUrl: entry.audioUrl,
        voiceProvider,
        onStart: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
            setActiveSpeakingLessonIndex(entry.lessonIndex);
          }
        },
        onEnd: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            setActiveSpeakingLessonIndex(null);
          }
        },
      });
    }

    if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
      setIsReading(false);
      setActiveSpeakingLessonIndex(null);
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

  const queueAutoPlayForUnitStart = (unitStart: number): void => {
    const lesson = lessons[unitStart];
    if (!lesson) return;

    const targetLevel = getLessonOrderIndex(lesson);
    const targetUnit = getLessonUnitId(lesson);
    unitPlaybackStartedAtRef.current = null;
    lastPlayAnchorLessonIndexRef.current = null;

    setMode('learn');
    setCurrentIndex(unitStart);
    setLearnStep(0);
    setUnlockedLevel((prev) => Math.max(prev, targetLevel));
    setPendingAutoPlayUnitKey(`${targetLevel}:${targetUnit}`);
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
  };

  const handleNext = async () => {
    if (mode !== 'learn') return;
    await runWithUnitNavigationLock(async () => {
      await stopActivePlayback();

      let targetUnitStart: number | null = null;
      if (repeatMode === 'one') {
        targetUnitStart = resolveUnitStartFromAnchor(sectionStart);
      } else {
        const nextAnchor = sectionEnd + 1;
        const isBeyondCurrentStage =
          nextAnchor >= lessons.length
          || resolveStageCode(getLessonOrderIndex(lessons[nextAnchor]), lessons[nextAnchor]?.stage) !== currentStageCode;

        if (isBeyondCurrentStage) {
          if (repeatMode === 'all') {
            targetUnitStart = resolveUnitStartFromAnchor(currentStageRange.start);
          }
        } else {
          targetUnitStart = resolveUnitStartFromAnchor(nextAnchor);
        }
      }

      if (targetUnitStart !== null) {
        queueAutoPlayForUnitStart(targetUnitStart);
      }
    });
  };

  const handlePrevious = async () => {
    if (mode !== 'learn') return;
    await runWithUnitNavigationLock(async () => {
      const shouldJumpToPreviousUnit =
        repeatMode !== 'one' && shouldPreviousJumpToPreviousUnit();

      await stopActivePlayback();

      let targetUnitStart: number | null = null;
      if (repeatMode === 'one') {
        targetUnitStart = resolveCurrentUnitStart();
      } else {
        if (shouldJumpToPreviousUnit) {
          targetUnitStart = resolvePreviousUnitStartWithinStage();
        }
        if (targetUnitStart === null) {
          targetUnitStart = resolveCurrentUnitStart();
        }
      }

      if (targetUnitStart !== null) {
        queueAutoPlayForUnitStart(targetUnitStart);
      }
    });
  };

  const navigateToLevelUnit = async (level: number, unit: number, albumKey?: string | null) => {
    await runWithUnitNavigationLock(async () => {
      const safeLevel = Math.min(Math.max(level, 1), totalLevels);
      const safeUnit = Math.max(1, unit);
      const target = lessons.findIndex(
        (lesson) => getLessonOrderIndex(lesson) === safeLevel && getLessonUnitId(lesson) === safeUnit,
      );
      if (target < 0) return;

      await stopActivePlayback();
      unitPlaybackStartedAtRef.current = null;
      lastPlayAnchorLessonIndexRef.current = null;

      if (albumKey !== undefined) {
        setRoadmapSelectedAlbumKey(albumKey);
      }
      setMode('learn');
      setCurrentIndex(target);
      setUnlockedLevel((prev) => Math.max(prev, safeLevel));
      setSidebarTab('lesson');
      setLearnStep(0);
      setPendingAutoPlayUnitKey(`${safeLevel}:${safeUnit}`);
      setRandomOrderVersion((prev) => prev + 1);
      setUnitXp(0);
      setReviewResult(null);
      resetQuizState();
      setIsSidebarOpen(false);
    });
  };

  const goToLevelUnit = (level: number, unit: number, albumKey?: string | null) => {
    const targetUnitKey = `${Math.max(1, level)}:${Math.max(1, unit)}`;
    const isSwitchingUnit = targetUnitKey !== `${currentLevel}:${currentUnit}`;
    const currentUnitKey = `${currentLevel}:${currentUnit}`;
    const isCurrentUnitAlreadyCompleted = completedUnitKeys.has(currentUnitKey);
    const isUnitLearnStepCompleted = mode === 'learn' && learnStep >= learnStepCount - 1;

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

    void navigateToLevelUnit(level, unit, albumKey);
  };

  const handleLeaveQuizCancel = () => {
    setIsLeaveQuizModalOpen(false);
    setPendingUnitTarget(null);
  };

  const handleLeaveQuizConfirm = () => {
    if (pendingUnitTarget) {
      void navigateToLevelUnit(pendingUnitTarget.level, pendingUnitTarget.unit, pendingUnitTarget.albumKey);
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
      void navigateToLevelUnit(pendingUnitTarget.level, pendingUnitTarget.unit, pendingUnitTarget.albumKey);
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
    setMode('learn');
    setCurrentIndex(quizSectionStart);
    setLearnStep(0);
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
  };

  const handleUnitCompleteContinue = () => {
    setIsUnitCompleteModalOpen(false);
    continueFromPassedResult();
  };

  const handleToggleShuffle = () => {
    const wasPlaying = isReading || activeSpeakingLessonIndex !== null;
    if (wasPlaying) {
      readSessionRef.current += 1;
      bumpPlaybackToken();
      setIsReading(false);
      setActiveSpeakingLessonIndex(null);
      cancelSpeech();
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
              learnLanguage={learnLanguage}
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
              isAutoScrollEnabled={isAutoScrollEnabled}
              textScalePercent={textScalePercent}
              canDecreaseTextSize={textScalePercent > 90}
              canIncreaseTextSize={textScalePercent < 120}
              translationLabel={translationLabel}
              appTheme={appTheme}
              voiceProvider={voiceProvider}
              onDefaultLanguageChange={setDefaultLanguage}
              onLearnLanguageChange={setLearnLanguage}
              onTogglePronunciation={() => setIsPronunciationEnabled((prev) => !prev)}
              onToggleBoldText={() => setIsBoldTextEnabled((prev) => !prev)}
              onToggleAutoScroll={() => setIsAutoScrollEnabled((prev) => !prev)}
              onDecreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev - 5))}
              onIncreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev + 5))}
              onAppThemeChange={setAppTheme}
              onVoiceProviderChange={setVoiceProvider}
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
              progressLabel={`${Math.min(learnStepCount, learnStep + 1)}/${learnStepCount}`}
              currentIndex={currentIndex}
              currentBatchEntries={currentBatchEntries}
              allBatchGroups={lessonBatchGroups}
              currentStep={learnStep}
              isReading={isReading}
              onSelectStep={handleSelectLessonStep}
              englishReferenceByKey={englishReferenceByKey}
              defaultLanguage={defaultLanguage}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              isAutoScrollEnabled={isAutoScrollEnabled}
              textScalePercent={textScalePercent}
              learnLanguage={learnLanguage}
              activeSpeakingLessonIndex={activeSpeakingLessonIndex}
              onPlayLesson={handlePlaySingleLesson}
              savedHighlightPhrasesByLessonKey={highlightPhrasesByLessonKey}
              onSaveLessonHighlight={saveHighlightSelection}
              onClearLessonHighlight={clearHighlightSelection}
            />
          )}
        </main>

        {(isLessonView || isLevelsView) && (
          <LessonActionFooter
            mode={mode}
            isNextDisabled={isNextDisabled || (mode === 'learn' && repeatMode === 'off' && sectionEnd >= currentStageRange.end)}
            isPreviousDisabled={
              mode !== 'learn'
              || isNextDisabled
            }
            isReadDisabled={mode !== 'learn' || orderedUnitIndexes.length === 0}
            isReading={isReading}
            isShuffleEnabled={isRandomLessonOrderEnabled}
            repeatMode={repeatMode}
            isVisible={isMobileBottomBarsVisible}
            onToggleShuffle={handleToggleShuffle}
            onToggleRepeat={handleToggleRepeat}
            onPrevious={handlePrevious}
            onRead={() => { void handleReadCurrentBatch(); }}
            onNext={handleNext}
          />
        )}

        <MobileBottomNav
          activeTab={sidebarTab}
          isVisible={isMobileBottomBarsVisible}
          onTabChange={selectTab}
        />
      </div>
    </div>
  );
};

export default App;

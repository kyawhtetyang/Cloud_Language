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
import { useOfflineLessonPacks } from './hooks/useOfflineLessonPacks';
import { isPassingScore } from './utils/reviewScoring';
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
  getLessonOrderIndex,
  getLessonUnitId,
  LEARN_QUESTIONS_PER_UNIT,
  LESSONS_PER_BATCH,
  MATCH_PAIRS_PER_REVIEW,
  PASS_SCORE,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>('learn');
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [streak, setStreak] = useState(0);
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
    voicePreference,
    setVoicePreference,
    isBoldTextEnabled,
    setIsBoldTextEnabled,
    isRandomLessonOrderEnabled,
    setIsRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    setIsReviewQuestionsRemoved,
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
  const [isReading, setIsReading] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [pendingUnitTarget, setPendingUnitTarget] = useState<{ level: number; unit: number } | null>(
    null,
  );
  const [roadmapSelectedAlbumKey, setRoadmapSelectedAlbumKey] = useState<string | null>(null);
  const readSessionRef = useRef(0);
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
    voicePreference,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
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
    setVoicePreference,
    setIsBoldTextEnabled,
    setIsRandomLessonOrderEnabled,
    setIsReviewQuestionsRemoved,
  });

  useSettingsPersistence({
    profileStorageId,
    enabled: Boolean(profileName) && hasHydratedSettings,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    voicePreference,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
  });

  const leaveQuizConfirmMessage =
    defaultLanguage === 'burmese'
      ? 'Quick Review မှ ထွက်မလား? ဒီ review အတွင်း တိုးတက်မှုတွေ ပျက်သွားပါမယ်။'
      : 'Leave quick review? Progress in this review will be lost.';
  const leaveQuizModalTitle = defaultLanguage === 'burmese' ? 'Quick Review မှ ထွက်ရန်' : 'Leave quick review?';
  const leaveQuizCancelLabel = defaultLanguage === 'burmese' ? 'မထွက်တော့ပါ' : 'Cancel';
  const leaveQuizConfirmLabel =
    defaultLanguage === 'burmese' ? 'ထွက်မယ်' : 'Leave quick review';
  const {
    currentLevel,
    currentUnit,
    currentCourseCode,
    currentLevelTitle,
    orderedUnitIndexes,
    sectionStart,
    sectionEnd,
    sectionTotal,
    unitFlowCurrent,
    unitFlowTotal,
    currentBatchEntries,
    currentBatchLessonsCount,
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
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
    }
  }, [isReading, mode]);

  const handleReadCurrentBatch = async () => {
    if (mode !== 'learn') return;

    if (isReading) {
      readSessionRef.current += 1;
      setIsReading(false);
      cancelSpeech();
      return;
    }

    const texts = currentBatchEntries
      .map(({ lesson }) => lesson.english)
      .filter((text) => typeof text === 'string' && text.trim().length > 0);

    if (texts.length === 0) return;

    const sessionId = readSessionRef.current + 1;
    readSessionRef.current = sessionId;
    setIsReading(true);
    cancelSpeech();

    for (const text of texts) {
      if (readSessionRef.current !== sessionId) break;
      await speakText(text, voicePreference);
    }

    if (readSessionRef.current === sessionId) {
      setIsReading(false);
    }
  };

  const handleNext = () => {
    if (isNextDisabled || mode !== 'learn') return;

    setIsNextDisabled(true);
    const nextStep = learnStep + 1;
    setLearnStep(nextStep);

    const isCheckpointStep = QUICK_REVIEW_CHECKPOINTS.includes(nextStep);

    if (isReviewQuestionsRemoved && isCheckpointStep) {
      if (nextStep >= LEARN_QUESTIONS_PER_UNIT) {
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
          setIsNextDisabled(false);
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
          setIsNextDisabled(false);
          return;
        }

        setMode('learn');
        setCurrentIndex(nextStart);
        setLearnStep(0);
        setRandomOrderVersion((prev) => prev + 1);
        setUnitXp(0);
        setReviewResult(null);
        resetQuizState();
      } else {
        const nextOffset = (nextStep * LESSONS_PER_BATCH) % sectionTotal;
        setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
      }
      setIsNextDisabled(false);
      return;
    }

    const needsCheckpoint = isCheckpointStep;
    if (needsCheckpoint) {
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
    } else {
      const nextOffset = (nextStep * LESSONS_PER_BATCH) % sectionTotal;
      setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
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
    if (mode === 'quiz') {
      setPendingUnitTarget({ level, unit });
      setIsLeaveQuizModalOpen(true);
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
      navigateToLevelUnit(pendingUnitTarget.level, pendingUnitTarget.unit);
    }
    setIsLeaveQuizModalOpen(false);
    setPendingUnitTarget(null);
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

  const handleQuizNext = () => {
    if (!answerChecked) return;

    const isPass = matchMistakes === 0 && matchedPairIds.length === matchPairs.length;
    const gainedXp = isPass ? 1 : 0;
    const nextXp = Math.min(unitXp + gainedXp, TOTAL_XP_PER_COURSE);
    if (isPass) {
      setUnitXp(nextXp);
    }

    if (learnStep >= LEARN_QUESTIONS_PER_UNIT) {
      const passedByScore = isPassingScore(nextXp, PASS_SCORE);
      if (!passedByScore) {
        setStreak(0);
      }
      setReviewResult({
        correct: nextXp,
        total: TOTAL_XP_PER_COURSE,
        passed: passedByScore,
      });
      setMode('result');
      resetQuizState();
      return;
    }

    setMode('learn');
    resetQuizState();
    if (isPass && learnStep < LEARN_QUESTIONS_PER_UNIT) {
      const nextOffset = (learnStep * LESSONS_PER_BATCH) % sectionTotal;
      setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
    } else {
      setStreak(0);
    }
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
  const pronunciationStyleLabel =
    defaultLanguage === 'burmese' ? 'Burmese style (Current)' : 'English style (Pinyin for Chinese)';
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f1ffe2_0%,#eef8ff_55%,#f5f7fa_100%)] md:flex">
      <LeaveQuizModal
        isOpen={isLeaveQuizModalOpen}
        title={leaveQuizModalTitle}
        message={leaveQuizConfirmMessage}
        cancelLabel={leaveQuizCancelLabel}
        confirmLabel={leaveQuizConfirmLabel}
        onCancel={handleLeaveQuizCancel}
        onConfirm={handleLeaveQuizConfirm}
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

      <div className="flex-1 flex flex-col min-h-screen pb-36 md:pb-0">
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
              isReviewQuestionsRemoved={isReviewQuestionsRemoved}
              textScalePercent={textScalePercent}
              canDecreaseTextSize={textScalePercent > 90}
              canIncreaseTextSize={textScalePercent < 120}
              voicePreference={voicePreference}
              translationLabel={translationLabel}
              pronunciationStyleLabel={pronunciationStyleLabel}
              onDefaultLanguageChange={setDefaultLanguage}
              onLearnLanguageChange={setLearnLanguage}
              onTogglePronunciation={() => setIsPronunciationEnabled((prev) => !prev)}
              onToggleBoldText={() => setIsBoldTextEnabled((prev) => !prev)}
              onToggleReviewQuestions={() => setIsReviewQuestionsRemoved((prev) => !prev)}
              onDecreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev - 5))}
              onIncreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev + 5))}
              onVoicePreferenceChange={setVoicePreference}
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
              currentCourseCode={currentCourseCode}
              currentLevelTitle={currentLevelTitle}
              unitXp={unitXp}
              currentIndex={currentIndex}
              currentBatchEntries={currentBatchEntries}
              currentBatchLessonsCount={currentBatchLessonsCount}
              englishReferenceLessons={englishReferenceLessons}
              englishReferenceByKey={englishReferenceByKey}
              defaultLanguage={defaultLanguage}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              voicePreference={voicePreference}
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
            learnStep={learnStep}
            isReviewQuestionsRemoved={isReviewQuestionsRemoved}
            isMatchReviewComplete={isMatchReviewComplete}
            onToggleShuffle={handleToggleShuffle}
            onToggleRepeat={handleToggleRepeat}
            onPrevious={handlePrevious}
            onRead={() => { void handleReadCurrentBatch(); }}
            onNext={handleNext}
            onQuizSubmit={handleQuizNext}
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

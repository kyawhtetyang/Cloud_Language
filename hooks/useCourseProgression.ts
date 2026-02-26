import { Dispatch, SetStateAction } from 'react';
import {
  AppMode,
  getLessonOrderIndex,
  getLessonUnitId,
  resolveStageCode,
  ReviewResult,
} from '../config/appConfig';
import { LessonData } from '../types';

type RepeatMode = 'off' | 'all' | 'one';

type UseCourseProgressionParams = {
  lessons: LessonData[];
  repeatMode: RepeatMode;
  totalLevels: number;
  sectionStart: number;
  sectionEnd: number;
  quizSectionStart: number;
  quizSectionEnd: number;
  currentStageCode: string;
  currentStageRange: { start: number; end: number };
  reviewResult: ReviewResult | null;
  setMode: Dispatch<SetStateAction<AppMode>>;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setLearnStep: Dispatch<SetStateAction<number>>;
  setRandomOrderVersion: Dispatch<SetStateAction<number>>;
  setUnitXp: Dispatch<SetStateAction<number>>;
  setReviewResult: Dispatch<SetStateAction<ReviewResult | null>>;
  setUnlockedLevel: Dispatch<SetStateAction<number>>;
  setStreak: Dispatch<SetStateAction<number>>;
  setCompletedUnitKeys: Dispatch<SetStateAction<Set<string>>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setIsUnitCompleteModalOpen: Dispatch<SetStateAction<boolean>>;
  resetQuizState: () => void;
};

type UseCourseProgressionResult = {
  proceedUnitCompletionWithoutReview: () => void;
  handleReview: () => void;
  handleResultContinue: () => void;
  handleUnitCompleteStay: () => void;
  handleUnitCompleteContinue: () => void;
};

export function useCourseProgression({
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
}: UseCourseProgressionParams): UseCourseProgressionResult {
  const resetToLearnFromIndex = (startIndex: number) => {
    setMode('learn');
    setCurrentIndex(startIndex);
    setLearnStep(0);
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
  };

  const completeUnitAt = (anchorIndex: number) => {
    const lesson = lessons[anchorIndex];
    if (!lesson) return;

    const completedUnitKey = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
    setCompletedUnitKeys((prev) => new Set([...prev, completedUnitKey]));

    const passedLevel = getLessonOrderIndex(lesson);
    const nextUnlocked = Math.min(totalLevels, passedLevel + 1);
    setUnlockedLevel((prev) => Math.max(prev, nextUnlocked));
    setStreak((prev) => prev + 1);
  };

  const proceedAfterCompletion = (currentUnitAnchor: number, nextStart: number) => {
    if (repeatMode === 'one') {
      resetToLearnFromIndex(currentUnitAnchor);
      return;
    }

    const nextLesson = lessons[nextStart];
    const isBeyondCurrentStage =
      nextStart >= lessons.length
      || resolveStageCode(getLessonOrderIndex(nextLesson), nextLesson?.stage) !== currentStageCode;

    if (isBeyondCurrentStage) {
      if (repeatMode === 'all') {
        resetToLearnFromIndex(currentStageRange.start);
      } else {
        setMode('completed');
        setUnlockedLevel(totalLevels);
        setReviewResult(null);
        resetQuizState();
      }
      return;
    }

    resetToLearnFromIndex(nextStart);
  };

  const proceedUnitCompletionWithoutReview = () => {
    completeUnitAt(sectionStart);
    proceedAfterCompletion(sectionStart, sectionEnd + 1);
  };

  const continueFromPassedResult = () => {
    completeUnitAt(quizSectionStart);
    proceedAfterCompletion(quizSectionStart, quizSectionEnd + 1);
  };

  const handleReview = () => {
    resetToLearnFromIndex(0);
    setIsSidebarOpen(false);
  };

  const handleResultContinue = () => {
    if (!reviewResult) return;

    if (!reviewResult.passed) {
      resetToLearnFromIndex(quizSectionStart);
      setStreak(0);
      return;
    }

    setIsUnitCompleteModalOpen(true);
  };

  const handleUnitCompleteStay = () => {
    setIsUnitCompleteModalOpen(false);
    resetToLearnFromIndex(quizSectionStart);
  };

  const handleUnitCompleteContinue = () => {
    setIsUnitCompleteModalOpen(false);
    continueFromPassedResult();
  };

  return {
    proceedUnitCompletionWithoutReview,
    handleReview,
    handleResultContinue,
    handleUnitCompleteStay,
    handleUnitCompleteContinue,
  };
}


import { useMemo } from 'react';
import { LessonData } from '../types';
import {
  AppMode,
  buildStageUnitsFromLessons,
  getLevelTitle,
  getLessonOrderIndex,
  getLessonUnitId,
  LEARN_QUESTIONS_PER_UNIT,
  LESSONS_PER_BATCH,
  resolveStageCode,
} from '../config/appConfig';

type UseLessonUnitStateParams = {
  lessons: LessonData[];
  mode: AppMode;
  currentIndex: number;
  quizSectionStart: number;
  learnStep: number;
  isRandomLessonOrderEnabled: boolean;
  randomOrderVersion: number;
};

export type LessonBatchEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

export type UseLessonUnitStateResult = {
  currentLevel: number;
  currentUnit: number;
  currentCourseCode: string;
  currentLevelTitle: string;
  levelIndexes: number[];
  orderedUnitIndexes: number[];
  sectionStart: number;
  sectionEnd: number;
  sectionTotal: number;
  unitFlowCurrent: number;
  unitFlowTotal: number;
  currentBatchEntries: LessonBatchEntry[];
  currentBatchLessonsCount: number;
};

export function useLessonUnitState({
  lessons,
  mode,
  currentIndex,
  quizSectionStart,
  learnStep,
  isRandomLessonOrderEnabled,
  randomOrderVersion,
}: UseLessonUnitStateParams): UseLessonUnitStateResult {
  const activeLevelIndex =
    mode === 'quiz' || mode === 'result'
      ? quizSectionStart
      : Math.min(currentIndex, Math.max(lessons.length - 1, 0));
  const fallbackLevel = Math.floor(activeLevelIndex / LEARN_QUESTIONS_PER_UNIT) + 1;
  const currentLevel = lessons[activeLevelIndex] ? getLessonOrderIndex(lessons[activeLevelIndex]) : fallbackLevel;
  const currentUnit = lessons[activeLevelIndex] ? getLessonUnitId(lessons[activeLevelIndex]) : 1;
  const currentStage = resolveStageCode(currentLevel, lessons[activeLevelIndex]?.stage);
  const currentStageUnits = buildStageUnitsFromLessons(lessons).filter((entry) => entry.stage === currentStage);
  const currentStageUnitNumber =
    currentStageUnits.find((entry) => entry.level === currentLevel && entry.unit === currentUnit)
      ?.stageUnitNumber || 1;
  const currentCourseCode = `${currentStage} Unit ${currentStageUnitNumber}`;

  const levelIndexes = useMemo(
    () =>
      lessons.reduce<number[]>((acc, lesson, idx) => {
        if (getLessonOrderIndex(lesson) === currentLevel && getLessonUnitId(lesson) === currentUnit) acc.push(idx);
        return acc;
      }, []),
    [currentLevel, currentUnit, lessons],
  );

  const orderedUnitIndexes = useMemo(() => {
    if (!isRandomLessonOrderEnabled || levelIndexes.length <= 1) {
      return levelIndexes;
    }
    const shuffled = [...levelIndexes];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [isRandomLessonOrderEnabled, levelIndexes, randomOrderVersion]);

  const sectionStart = levelIndexes.length > 0 ? Math.min(...levelIndexes) : Math.max(0, activeLevelIndex);
  const sectionEnd = levelIndexes.length > 0 ? Math.max(...levelIndexes) : Math.max(0, activeLevelIndex);
  const sectionTotal = Math.max(1, orderedUnitIndexes.length);
  const unitFlowTotal = LEARN_QUESTIONS_PER_UNIT;
  const batchStartOffset = mode === 'learn' ? (learnStep * LESSONS_PER_BATCH) % sectionTotal : 0;
  const currentBatchEntries =
    mode === 'learn'
      ? Array.from({ length: LESSONS_PER_BATCH }, (_, idx) => {
          const orderedIndex = (batchStartOffset + idx) % sectionTotal;
          const lessonIndex = orderedUnitIndexes[orderedIndex] ?? sectionStart;
          const lesson = lessons[lessonIndex];
          return lesson ? { lesson, lessonIndex } : null;
        }).filter((entry): entry is LessonBatchEntry => Boolean(entry))
      : [];
  const unitFlowCurrent = Math.min(learnStep, LEARN_QUESTIONS_PER_UNIT);

  return {
    currentLevel,
    currentUnit,
    currentCourseCode,
    currentLevelTitle: getLevelTitle(currentLevel),
    levelIndexes,
    orderedUnitIndexes,
    sectionStart,
    sectionEnd,
    sectionTotal,
    unitFlowCurrent,
    unitFlowTotal,
    currentBatchEntries,
    currentBatchLessonsCount: currentBatchEntries.length,
  };
}


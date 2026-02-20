import { useMemo } from 'react';
import { LESSONS_PER_BATCH, LEARN_QUESTIONS_PER_UNIT } from '../config/appConfig';
import { LessonData } from '../types';
import { LessonBatchEntry } from './useLessonUnitState';

type UseLessonBatchGroupsParams = {
  lessons: LessonData[];
  orderedUnitIndexes: number[];
  sectionStart: number;
  sectionTotal: number;
};

export function useLessonBatchGroups({
  lessons,
  orderedUnitIndexes,
  sectionStart,
  sectionTotal,
}: UseLessonBatchGroupsParams): LessonBatchEntry[][] {
  return useMemo(
    () =>
      Array.from({ length: LEARN_QUESTIONS_PER_UNIT }, (_, step) =>
        Array.from({ length: LESSONS_PER_BATCH }, (_, idx) => {
          const orderedIndex = ((step * LESSONS_PER_BATCH) + idx) % sectionTotal;
          const lessonIndex = orderedUnitIndexes[orderedIndex] ?? sectionStart;
          const lesson = lessons[lessonIndex];
          return lesson ? { lesson, lessonIndex } : null;
        }).filter((entry): entry is LessonBatchEntry => Boolean(entry)),
      ),
    [lessons, orderedUnitIndexes, sectionStart, sectionTotal],
  );
}


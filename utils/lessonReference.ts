import { getLessonOrderIndex, getLessonUnitId } from '../config/appConfig';
import { LessonData } from '../types';

export function buildLessonReferenceKey(
  lesson: Pick<LessonData, 'groupId' | 'unitId' | 'orderIndex' | 'level' | 'unit' | 'topic' | 'burmese'>,
): string {
  return `${getLessonOrderIndex(lesson)}|${getLessonUnitId(lesson)}|${lesson.topic}|${lesson.burmese}`;
}



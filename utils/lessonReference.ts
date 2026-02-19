import { LessonData } from '../types';

export function buildLessonReferenceKey(
  lesson: Pick<LessonData, 'level' | 'unit' | 'topic' | 'burmese'>,
): string {
  return `${lesson.level}|${lesson.unit}|${lesson.topic}|${lesson.burmese}`;
}

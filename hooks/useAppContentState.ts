import { useMemo } from 'react';
import { getLessonOrderIndex, DefaultLanguage, LearnLanguage } from '../config/appConfig';
import { getLessonModalText } from '../config/lessonModalText';
import { useLessonData } from './useLessonData';
import { useOfflineLessonPacks } from './useOfflineLessonPacks';
import { buildLessonReferenceKey } from '../utils/lessonReference';
import { LessonData } from '../types';

function normalizeApiBaseUrl(rawApiBaseUrl: string | undefined): string {
  const fallbackBaseUrl = '/api';
  const candidate = (rawApiBaseUrl?.trim() || fallbackBaseUrl).replace(/\/+$/, '');
  if (candidate === '/api' || candidate.endsWith('/api')) {
    return candidate.slice(0, -4);
  }
  return candidate;
}

type UseAppContentStateParams = {
  learnLanguage: LearnLanguage;
  defaultLanguage: DefaultLanguage;
};

type UseAppContentStateResult = {
  apiBaseUrl: string;
  lessons: LessonData[];
  loading: boolean;
  errorMessage: string | null;
  downloadedUnitKeys: Set<string>;
  downloadUnitPack: (level: number, unit: number) => Promise<void>;
  removeUnitPack: (level: number, unit: number) => Promise<void>;
  isUnitDownloading: (level: number, unit: number) => boolean;
  totalLevels: number;
  englishReferenceByKey: Map<string, string>;
  leaveCompletedUnitModalTitle: string;
  leaveCompletedUnitConfirmMessage: string;
  leaveCompletedUnitCancelLabel: string;
  leaveCompletedUnitConfirmLabel: string;
};

export function useAppContentState({
  learnLanguage,
  defaultLanguage,
}: UseAppContentStateParams): UseAppContentStateResult {
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
  const {
    leaveCompletedUnitModalTitle,
    leaveCompletedUnitConfirmMessage,
    leaveCompletedUnitCancelLabel,
    leaveCompletedUnitConfirmLabel,
  } = getLessonModalText(defaultLanguage);

  return {
    apiBaseUrl,
    lessons,
    loading,
    errorMessage,
    downloadedUnitKeys,
    downloadUnitPack,
    removeUnitPack,
    isUnitDownloading,
    totalLevels,
    englishReferenceByKey,
    leaveCompletedUnitModalTitle,
    leaveCompletedUnitConfirmMessage,
    leaveCompletedUnitCancelLabel,
    leaveCompletedUnitConfirmLabel,
  };
}

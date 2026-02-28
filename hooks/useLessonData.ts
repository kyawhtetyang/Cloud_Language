import { useEffect, useState } from 'react';
import { LearnLanguage } from '../config/appConfig';
import { LessonData } from '../types';
import { readDownloadedLessonsByLanguage } from '../offline/offlineStore';

const LESSON_FETCH_TIMEOUT_MS = 25000;

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  upstreamSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const onUpstreamAbort = () => controller.abort();
  if (upstreamSignal?.aborted) {
    controller.abort();
  } else {
    upstreamSignal?.addEventListener('abort', onUpstreamAbort, { once: true });
  }
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener('abort', onUpstreamAbort);
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === 'AbortError'
      : Boolean(error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'AbortError')
  );
}

type UseLessonDataResult = {
  lessons: LessonData[];
  englishReferenceLessons: LessonData[];
  loading: boolean;
  errorMessage: string | null;
};

export function useLessonData(
  apiBaseUrl: string,
  learnLanguage: LearnLanguage,
  lessonsLoadFailedMessage: string,
): UseLessonDataResult {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [englishReferenceLessons, setEnglishReferenceLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const requestController = new AbortController();

    const fetchData = async () => {
      try {
        if (!isActive) return;
        setLoading(true);
        setErrorMessage(null);
        const response = await fetchWithTimeout(
          `${apiBaseUrl}/api/lessons?language=${encodeURIComponent(learnLanguage)}`,
          LESSON_FETCH_TIMEOUT_MS,
          requestController.signal,
        );
        if (!response.ok) throw new Error(`API responded with ${response.status}`);

        const data = (await response.json()) as LessonData[];
        if (!Array.isArray(data) || data.length === 0) throw new Error('No lessons returned from API');

        let englishData: LessonData[] = data;
        if (learnLanguage !== 'english') {
          try {
            const englishResponse = await fetchWithTimeout(
              `${apiBaseUrl}/api/lessons?language=english`,
              LESSON_FETCH_TIMEOUT_MS,
              requestController.signal,
            );
            if (!englishResponse.ok) throw new Error(`API responded with ${englishResponse.status}`);
            const englishLessons = (await englishResponse.json()) as LessonData[];
            if (Array.isArray(englishLessons) && englishLessons.length > 0) {
              englishData = englishLessons;
            }
          } catch (englishFetchError) {
            console.warn('Failed to load english reference lessons. Using selected language lessons as fallback.', englishFetchError);
          }
        }

        if (!isActive) return;
        setLessons(data);
        setEnglishReferenceLessons(englishData);
      } catch (error) {
        if (isAbortError(error)) return;
        console.error('Error loading lessons from API, trying offline packs:', error);
        const [offlineLearnLessons, offlineEnglishLessons] = await Promise.all([
          readDownloadedLessonsByLanguage(learnLanguage),
          readDownloadedLessonsByLanguage('english'),
        ]);

        if (!isActive) return;
        if (offlineLearnLessons.length > 0) {
          setLessons(offlineLearnLessons);
          setEnglishReferenceLessons(
            offlineEnglishLessons.length > 0 ? offlineEnglishLessons : offlineLearnLessons,
          );
          setErrorMessage(null);
          return;
        }

        setErrorMessage(lessonsLoadFailedMessage);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    void fetchData();
    return () => {
      isActive = false;
      requestController.abort();
    };
  }, [apiBaseUrl, learnLanguage, lessonsLoadFailedMessage]);

  return { lessons, englishReferenceLessons, loading, errorMessage };
}

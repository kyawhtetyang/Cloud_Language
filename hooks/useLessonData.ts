import { useEffect, useState } from 'react';
import { LearnLanguage } from '../config/appConfig';
import { LessonData } from '../types';
import { readDownloadedLessonsByLanguage } from '../offline/offlineStore';

const LESSON_FETCH_TIMEOUT_MS = 12000;

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

type UseLessonDataResult = {
  lessons: LessonData[];
  englishReferenceLessons: LessonData[];
  loading: boolean;
  errorMessage: string | null;
};

export function useLessonData(apiBaseUrl: string, learnLanguage: LearnLanguage): UseLessonDataResult {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [englishReferenceLessons, setEnglishReferenceLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [response, englishResponse] = await Promise.all([
          fetchWithTimeout(`${apiBaseUrl}/api/lessons?language=${learnLanguage}`, LESSON_FETCH_TIMEOUT_MS),
          fetchWithTimeout(`${apiBaseUrl}/api/lessons?language=english`, LESSON_FETCH_TIMEOUT_MS),
        ]);
        if (!response.ok) throw new Error(`API responded with ${response.status}`);
        if (!englishResponse.ok) throw new Error(`API responded with ${englishResponse.status}`);

        const data = (await response.json()) as LessonData[];
        const englishData = (await englishResponse.json()) as LessonData[];
        if (!Array.isArray(data) || data.length === 0) throw new Error('No lessons returned from API');
        if (!Array.isArray(englishData) || englishData.length === 0) {
          throw new Error('No english lessons returned from API');
        }

        setLessons(data);
        setEnglishReferenceLessons(englishData);
      } catch (error) {
        console.error('Error loading lessons from API, trying offline packs:', error);
        const [offlineLearnLessons, offlineEnglishLessons] = await Promise.all([
          readDownloadedLessonsByLanguage(learnLanguage),
          readDownloadedLessonsByLanguage('english'),
        ]);

        if (offlineLearnLessons.length > 0) {
          setLessons(offlineLearnLessons);
          setEnglishReferenceLessons(
            offlineEnglishLessons.length > 0 ? offlineEnglishLessons : offlineLearnLessons,
          );
          setErrorMessage(null);
          return;
        }

        setErrorMessage('Could not load lessons from backend or offline storage.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [apiBaseUrl, learnLanguage]);

  return { lessons, englishReferenceLessons, loading, errorMessage };
}

import { useEffect, useState } from 'react';
import { ChineseTrack, LearnLanguage } from '../config/appConfig';
import { LessonData } from '../types';

type UseLessonDataResult = {
  lessons: LessonData[];
  englishReferenceLessons: LessonData[];
  loading: boolean;
  errorMessage: string | null;
};

export function useLessonData(
  apiBaseUrl: string,
  learnLanguage: LearnLanguage,
  chineseTrack: ChineseTrack,
): UseLessonDataResult {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [englishReferenceLessons, setEnglishReferenceLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const lessonQuery =
          learnLanguage === 'chinese'
            ? `${apiBaseUrl}/api/lessons?language=chinese&track=${encodeURIComponent(chineseTrack)}`
            : `${apiBaseUrl}/api/lessons?language=${learnLanguage}`;
        const [response, englishResponse] = await Promise.all([
          fetch(lessonQuery),
          fetch(`${apiBaseUrl}/api/lessons?language=english`),
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
        console.error('Error loading lessons:', error);
        setErrorMessage('Could not load lessons from the backend API.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [apiBaseUrl, chineseTrack, learnLanguage]);

  return { lessons, englishReferenceLessons, loading, errorMessage };
}

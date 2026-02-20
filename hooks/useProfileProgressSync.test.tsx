import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProfileProgressSync } from './useProfileProgressSync';
import { LessonData } from '../types';

function mockJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const lessons: LessonData[] = [
  {
    level: 1,
    unit: 1,
    topic: 'Topic',
    english: 'Hello',
    burmese: 'မင်္ဂလာပါ',
    pronunciation: 'mingalaba',
  },
];

describe('useProfileProgressSync debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debounces progress PUT calls and sends only the latest update', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });
    vi.stubGlobal('fetch', fetchMock);

    const baseParams = {
      apiBaseUrl: 'http://localhost:4000',
      lessons,
      profileName: 'tester',
      mode: 'learn' as const,
      unlockedLevel: 1,
      streak: 0,
      learnLanguage: 'english' as const,
      defaultLanguage: 'burmese' as const,
      isPronunciationEnabled: false,
      textScalePercent: 100,
      voicePreference: 'young_female' as const,
      isBoldTextEnabled: false,
      isRandomLessonOrderEnabled: false,
      isReviewQuestionsRemoved: false,
      appTheme: 'apple_notes' as const,
      lessonLayoutDefault: 'list' as const,
      totalLevels: 12,
      progressStorageKey: 'progress:tester',
      unlockedStorageKey: 'unlocked:tester',
      streakStorageKey: 'streak:tester',
      setCurrentIndex: vi.fn(),
      setUnlockedLevel: vi.fn(),
      setStreak: vi.fn(),
      setLearnLanguage: vi.fn(),
      setDefaultLanguage: vi.fn(),
      setIsPronunciationEnabled: vi.fn(),
      setTextScalePercent: vi.fn(),
      setVoicePreference: vi.fn(),
      setIsBoldTextEnabled: vi.fn(),
      setIsRandomLessonOrderEnabled: vi.fn(),
      setIsReviewQuestionsRemoved: vi.fn(),
      setAppTheme: vi.fn(),
      setLessonLayoutDefault: vi.fn(),
    };

    const { rerender } = renderHook(
      ({ currentIndex }) =>
        useProfileProgressSync({
          ...baseParams,
          currentIndex,
        }),
      { initialProps: { currentIndex: 0 } },
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('/api/progress?profileName=tester'),
      ),
    ).toBe(true);

    rerender({ currentIndex: 1 });
    rerender({ currentIndex: 2 });

    act(() => {
      vi.advanceTimersByTime(599);
    });

    const putCallsBefore = fetchMock.mock.calls.filter(
      ([url, init]) => String(url).includes('/api/progress') && init?.method === 'PUT',
    );
    expect(putCallsBefore.length).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    await act(async () => {
      await Promise.resolve();
    });
    const putCalls = fetchMock.mock.calls.filter(
      ([url, init]) => String(url).includes('/api/progress') && init?.method === 'PUT',
    );
    expect(putCalls.length).toBe(1);
  });
});


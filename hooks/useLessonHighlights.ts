import { useCallback, useEffect, useMemo, useState } from 'react';
import { LEARN_LANGUAGE_OPTIONS, LESSON_HIGHLIGHTS_KEY, LearnLanguage } from '../config/appConfig';
import { LessonHighlight, LessonData } from '../types';
import { buildLessonReferenceKey } from '../utils/lessonReference';

const GUEST_PROFILE_STORAGE_ID = 'guest';

function getStorageKey(profileStorageId: string, learnLanguage: LearnLanguage): string {
  const normalizedProfileStorageId = profileStorageId?.trim() || GUEST_PROFILE_STORAGE_ID;
  return `${LESSON_HIGHLIGHTS_KEY}:${normalizedProfileStorageId}:${learnLanguage}`;
}

function normalizeSelectionText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function readHighlightsFromStorage(storageKey: string): LessonHighlight[] {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is LessonHighlight => {
      if (!entry || typeof entry !== 'object') return false;
      return (
        typeof entry.id === 'string'
        && typeof entry.profileStorageId === 'string'
        && typeof entry.learnLanguage === 'string'
        && typeof entry.lessonKey === 'string'
        && typeof entry.lessonText === 'string'
        && typeof entry.selectedText === 'string'
        && typeof entry.createdAt === 'string'
      );
    });
  } catch {
    return [];
  }
}

function writeHighlightsToStorage(storageKey: string, highlights: LessonHighlight[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(highlights));
  } catch {
    // localStorage can fail in private mode or restricted environments.
  }
}

export function useLessonHighlights(profileStorageId: string, learnLanguage: LearnLanguage) {
  const [highlights, setHighlights] = useState<LessonHighlight[]>([]);
  const storageKey = useMemo(() => getStorageKey(profileStorageId, learnLanguage), [learnLanguage, profileStorageId]);

  useEffect(() => {
    setHighlights(readHighlightsFromStorage(storageKey));
  }, [storageKey]);

  const saveHighlightSelection = useCallback((lesson: LessonData, rawSelectedText: string): boolean => {
    const selectedText = normalizeSelectionText(rawSelectedText);
    if (!selectedText) return false;
    if (!LEARN_LANGUAGE_OPTIONS.some((option) => option.code === learnLanguage)) return false;

    const lessonKey = buildLessonReferenceKey(lesson);
    const profileId = profileStorageId?.trim() || GUEST_PROFILE_STORAGE_ID;

    let didSave = false;
    setHighlights((prev) => {
      const nextEntry: LessonHighlight = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        profileStorageId: profileId,
        learnLanguage,
        lessonKey,
        lessonText: lesson.english,
        selectedText,
        createdAt: new Date().toISOString(),
      };
      const next = [
        nextEntry,
        ...prev.filter((entry) => entry.lessonKey !== lessonKey),
      ];
      writeHighlightsToStorage(storageKey, next);
      didSave = true;
      return next;
    });

    return didSave;
  }, [learnLanguage, profileStorageId, storageKey]);

  const clearHighlightSelection = useCallback((lesson: LessonData): boolean => {
    const lessonKey = buildLessonReferenceKey(lesson);
    let didClear = false;
    setHighlights((prev) => {
      const next = prev.filter((entry) => entry.lessonKey !== lessonKey);
      didClear = next.length !== prev.length;
      if (!didClear) return prev;
      writeHighlightsToStorage(storageKey, next);
      return next;
    });
    return didClear;
  }, [storageKey]);

  const highlightCountByLessonKey = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of highlights) {
      counts.set(item.lessonKey, (counts.get(item.lessonKey) ?? 0) + 1);
    }
    return counts;
  }, [highlights]);

  const highlightPhrasesByLessonKey = useMemo(() => {
    const phraseSetByLessonKey = new Map<string, Set<string>>();
    for (const item of highlights) {
      const normalizedPhrase = normalizeSelectionText(item.selectedText);
      if (!normalizedPhrase) continue;
      if (!phraseSetByLessonKey.has(item.lessonKey)) {
        phraseSetByLessonKey.set(item.lessonKey, new Set<string>());
      }
      phraseSetByLessonKey.get(item.lessonKey)?.add(normalizedPhrase);
    }

    const phrasesByLessonKey = new Map<string, string[]>();
    phraseSetByLessonKey.forEach((phraseSet, lessonKey) => {
      const sortedPhrases = Array.from(phraseSet).sort((a, b) => b.length - a.length);
      phrasesByLessonKey.set(lessonKey, sortedPhrases);
    });
    return phrasesByLessonKey;
  }, [highlights]);

  return {
    highlights,
    highlightCountByLessonKey,
    highlightPhrasesByLessonKey,
    saveHighlightSelection,
    clearHighlightSelection,
  };
}

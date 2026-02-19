import { useCallback, useEffect, useState } from 'react';
import { LessonData, ProgressState } from '../types';
import { VoicePreference } from '../components/AudioButton';
import {
  AppMode,
  ChineseTrack,
  DefaultLanguage,
  LearnLanguage,
  PROGRESS_KEY,
  STREAK_KEY,
  UNLOCKED_LEVEL_KEY,
} from '../config/appConfig';
import { applyRemoteSyncedSettings, buildSyncedSettingsPayload } from '../config/settingsSync';

const PROGRESS_SYNC_DEBOUNCE_MS = 600;

type UseProfileProgressSyncParams = {
  apiBaseUrl: string;
  lessons: LessonData[];
  profileName: string;
  mode: AppMode;
  currentIndex: number;
  unlockedLevel: number;
  streak: number;
  learnLanguage: LearnLanguage;
  chineseTrack: ChineseTrack;
  defaultLanguage: DefaultLanguage;
  isPronunciationEnabled: boolean;
  textScalePercent: number;
  voicePreference: VoicePreference;
  isBoldTextEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
  totalLevels: number;
  progressStorageKey: string;
  unlockedStorageKey: string;
  streakStorageKey: string;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setUnlockedLevel: React.Dispatch<React.SetStateAction<number>>;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  setLearnLanguage: React.Dispatch<React.SetStateAction<LearnLanguage>>;
  setChineseTrack: React.Dispatch<React.SetStateAction<ChineseTrack>>;
  setDefaultLanguage: React.Dispatch<React.SetStateAction<DefaultLanguage>>;
  setIsPronunciationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setTextScalePercent: React.Dispatch<React.SetStateAction<number>>;
  setVoicePreference: React.Dispatch<React.SetStateAction<VoicePreference>>;
  setIsBoldTextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRandomLessonOrderEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReviewQuestionsRemoved: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useProfileProgressSync({
  apiBaseUrl,
  lessons,
  profileName,
  mode,
  currentIndex,
  unlockedLevel,
  streak,
  learnLanguage,
  chineseTrack,
  defaultLanguage,
  isPronunciationEnabled,
  textScalePercent,
  voicePreference,
  isBoldTextEnabled,
  isRandomLessonOrderEnabled,
  isReviewQuestionsRemoved,
  totalLevels,
  progressStorageKey,
  unlockedStorageKey,
  streakStorageKey,
  setCurrentIndex,
  setUnlockedLevel,
  setStreak,
  setLearnLanguage,
  setChineseTrack,
  setDefaultLanguage,
  setIsPronunciationEnabled,
  setTextScalePercent,
  setVoicePreference,
  setIsBoldTextEnabled,
  setIsRandomLessonOrderEnabled,
  setIsReviewQuestionsRemoved,
}: UseProfileProgressSyncParams) {
  const [hasHydratedProfile, setHasHydratedProfile] = useState(false);

  const markHydrationStale = useCallback(() => {
    setHasHydratedProfile(false);
  }, []);

  useEffect(() => {
    if (lessons.length === 0 || !profileName) return;
    let cancelled = false;

    const hydrateProfileProgress = async () => {
      const saved = localStorage.getItem(progressStorageKey) || localStorage.getItem(PROGRESS_KEY);
      const restoredIndex = saved ? (JSON.parse(saved) as ProgressState).currentIndex : 0;
      const safeLocalIndex = Math.min(Math.max(restoredIndex, 0), lessons.length - 1);

      const savedUnlocked = Number(localStorage.getItem(unlockedStorageKey) || localStorage.getItem(UNLOCKED_LEVEL_KEY) || 1);
      const inferredUnlocked = lessons[safeLocalIndex]?.level || 1;
      const safeLocalUnlocked = Math.min(totalLevels, Math.max(savedUnlocked, inferredUnlocked, 1));
      const safeLocalStreak = Math.max(0, Number(localStorage.getItem(streakStorageKey) || localStorage.getItem(STREAK_KEY) || 0));

      if (cancelled) return;
      setCurrentIndex(safeLocalIndex);
      setUnlockedLevel(safeLocalUnlocked);
      setStreak(safeLocalStreak);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/progress?profileName=${encodeURIComponent(profileName)}`,
        );
        if (response.ok) {
          const remote = await response.json();
          const remoteIndex = Math.min(
            Math.max(0, Number(remote.currentIndex) || 0),
            lessons.length - 1,
          );
          const remoteUnlocked = Math.min(
            totalLevels,
            Math.max(1, Number(remote.unlockedLevel) || 1),
          );
          const remoteStreak = Math.max(0, Number(remote.streak) || 0);
          if (cancelled) return;
          setCurrentIndex(remoteIndex);
          setUnlockedLevel(remoteUnlocked);
          setStreak(remoteStreak);
          applyRemoteSyncedSettings(remote as Record<string, unknown>, {
            setLearnLanguage,
            setChineseTrack,
            setDefaultLanguage,
            setIsPronunciationEnabled,
            setTextScalePercent,
            setVoicePreference,
            setIsBoldTextEnabled,
            setIsRandomLessonOrderEnabled,
            setIsReviewQuestionsRemoved,
          });
        }
      } catch {
        // DB sync is optional; localStorage remains the fallback.
      } finally {
        if (!cancelled) setHasHydratedProfile(true);
      }
    };

    hydrateProfileProgress();
    return () => {
      cancelled = true;
    };
  }, [
    apiBaseUrl,
    lessons,
    profileName,
    progressStorageKey,
    setCurrentIndex,
    setDefaultLanguage,
    setIsPronunciationEnabled,
    setChineseTrack,
    setTextScalePercent,
    setVoicePreference,
    setIsBoldTextEnabled,
    setIsRandomLessonOrderEnabled,
    setIsReviewQuestionsRemoved,
    setLearnLanguage,
    setStreak,
    setUnlockedLevel,
    streakStorageKey,
    totalLevels,
    unlockedStorageKey,
  ]);

  useEffect(() => {
    if (profileName) {
      setHasHydratedProfile(false);
    }
  }, [profileName]);

  useEffect(() => {
    if (lessons.length > 0 && mode !== 'quiz' && profileName) {
      const state: ProgressState = {
        currentIndex,
        completedCount: currentIndex,
      };
      localStorage.setItem(progressStorageKey, JSON.stringify(state));
    }
  }, [currentIndex, lessons.length, mode, profileName, progressStorageKey]);

  useEffect(() => {
    if (lessons.length > 0 && profileName) {
      localStorage.setItem(unlockedStorageKey, String(unlockedLevel));
    }
  }, [lessons.length, profileName, unlockedLevel, unlockedStorageKey]);

  useEffect(() => {
    if (lessons.length > 0 && profileName) {
      localStorage.setItem(streakStorageKey, String(streak));
    }
  }, [lessons.length, profileName, streak, streakStorageKey]);

  useEffect(() => {
    if (!profileName || lessons.length === 0 || !hasHydratedProfile) return;

    const payload = {
      profileName,
      currentIndex,
      unlockedLevel,
      streak,
      ...buildSyncedSettingsPayload({
        learnLanguage,
        chineseTrack,
        defaultLanguage,
        isPronunciationEnabled,
        textScalePercent,
        voicePreference,
        isBoldTextEnabled,
        isRandomLessonOrderEnabled,
        isReviewQuestionsRemoved,
      }),
    };

    const timeoutId = window.setTimeout(() => {
      void fetch(`${apiBaseUrl}/api/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        // DB sync is optional; localStorage remains the fallback.
      });
    }, PROGRESS_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    apiBaseUrl,
    currentIndex,
    defaultLanguage,
    chineseTrack,
    hasHydratedProfile,
    isPronunciationEnabled,
    textScalePercent,
    voicePreference,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    learnLanguage,
    lessons.length,
    profileName,
    streak,
    unlockedLevel,
  ]);

  return { markHydrationStale };
}

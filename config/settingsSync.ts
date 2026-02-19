import { Dispatch, SetStateAction } from 'react';
import { VoicePreference } from '../components/AudioButton';
import {
  BOLD_TEXT_ENABLED_KEY,
  clampTextScale,
  DEFAULT_LANGUAGE_KEY,
  DefaultLanguage,
  isDefaultLanguage,
  isLearnLanguage,
  LEARN_LANGUAGE_KEY,
  LearnLanguage,
  PRONUNCIATION_ENABLED_KEY,
  RANDOM_LESSON_ORDER_ENABLED_KEY,
  REMOVE_REVIEW_QUESTIONS_ENABLED_KEY,
  TEXT_SCALE_PERCENT_KEY,
  VOICE_PREFERENCE_KEY,
} from './appConfig';

export type SyncedAppSettings = {
  learnLanguage: LearnLanguage;
  defaultLanguage: DefaultLanguage;
  isPronunciationEnabled: boolean;
  textScalePercent: number;
  voicePreference: VoicePreference;
  isBoldTextEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
};

export type SyncedAppSettingsSetters = {
  setLearnLanguage: Dispatch<SetStateAction<LearnLanguage>>;
  setDefaultLanguage: Dispatch<SetStateAction<DefaultLanguage>>;
  setIsPronunciationEnabled: Dispatch<SetStateAction<boolean>>;
  setTextScalePercent: Dispatch<SetStateAction<number>>;
  setVoicePreference: Dispatch<SetStateAction<VoicePreference>>;
  setIsBoldTextEnabled: Dispatch<SetStateAction<boolean>>;
  setIsRandomLessonOrderEnabled: Dispatch<SetStateAction<boolean>>;
  setIsReviewQuestionsRemoved: Dispatch<SetStateAction<boolean>>;
};

const DEFAULT_SYNCED_SETTINGS: SyncedAppSettings = {
  learnLanguage: 'english',
  defaultLanguage: 'burmese',
  isPronunciationEnabled: false,
  textScalePercent: 100,
  voicePreference: 'young_female',
  isBoldTextEnabled: false,
  isRandomLessonOrderEnabled: false,
  isReviewQuestionsRemoved: false,
};

function toScopedKey(baseKey: string, profileStorageId: string): string {
  return `${baseKey}:${profileStorageId}`;
}

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage can fail in private mode or restricted environments.
  }
}

function parseLearnLanguage(value: string | null): LearnLanguage {
  return isLearnLanguage(value) ? value : 'english';
}

function parseDefaultLanguage(value: string | null): DefaultLanguage {
  return isDefaultLanguage(value) ? value : 'burmese';
}

function parseVoicePreference(value: string | null): VoicePreference {
  if (value === 'google_female' || value === 'system_default' || value === 'young_female') {
    return value;
  }
  return 'young_female';
}

function parseBoolean(value: string | null): boolean {
  return value === 'true';
}

function parseTextScale(value: string | null): number {
  return clampTextScale(Number(value || DEFAULT_SYNCED_SETTINGS.textScalePercent));
}

function readWithFallback(baseKey: string, profileStorageId?: string): string | null {
  if (!profileStorageId) {
    return safeRead(baseKey);
  }
  const scoped = safeRead(toScopedKey(baseKey, profileStorageId));
  if (scoped !== null) return scoped;
  return safeRead(baseKey);
}

export function readSyncedSettingsFromStorage(profileStorageId?: string): SyncedAppSettings {
  return {
    learnLanguage: parseLearnLanguage(readWithFallback(LEARN_LANGUAGE_KEY, profileStorageId)),
    defaultLanguage: parseDefaultLanguage(readWithFallback(DEFAULT_LANGUAGE_KEY, profileStorageId)),
    isPronunciationEnabled: parseBoolean(readWithFallback(PRONUNCIATION_ENABLED_KEY, profileStorageId)),
    textScalePercent: parseTextScale(readWithFallback(TEXT_SCALE_PERCENT_KEY, profileStorageId)),
    voicePreference: parseVoicePreference(readWithFallback(VOICE_PREFERENCE_KEY, profileStorageId)),
    isBoldTextEnabled: parseBoolean(readWithFallback(BOLD_TEXT_ENABLED_KEY, profileStorageId)),
    isRandomLessonOrderEnabled: parseBoolean(readWithFallback(RANDOM_LESSON_ORDER_ENABLED_KEY, profileStorageId)),
    isReviewQuestionsRemoved: parseBoolean(readWithFallback(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY, profileStorageId)),
  };
}

export function persistSyncedSettingsToStorage(
  settings: SyncedAppSettings,
  profileStorageId?: string,
): void {
  const resolveKey = (baseKey: string) =>
    profileStorageId ? toScopedKey(baseKey, profileStorageId) : baseKey;
  safeWrite(resolveKey(LEARN_LANGUAGE_KEY), settings.learnLanguage);
  safeWrite(resolveKey(DEFAULT_LANGUAGE_KEY), settings.defaultLanguage);
  safeWrite(resolveKey(PRONUNCIATION_ENABLED_KEY), String(settings.isPronunciationEnabled));
  safeWrite(resolveKey(TEXT_SCALE_PERCENT_KEY), String(settings.textScalePercent));
  safeWrite(resolveKey(VOICE_PREFERENCE_KEY), settings.voicePreference);
  safeWrite(resolveKey(BOLD_TEXT_ENABLED_KEY), String(settings.isBoldTextEnabled));
  safeWrite(resolveKey(RANDOM_LESSON_ORDER_ENABLED_KEY), String(settings.isRandomLessonOrderEnabled));
  safeWrite(resolveKey(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY), String(settings.isReviewQuestionsRemoved));
}

export function buildSyncedSettingsPayload(settings: SyncedAppSettings): SyncedAppSettings {
  return {
    learnLanguage: settings.learnLanguage,
    defaultLanguage: settings.defaultLanguage,
    isPronunciationEnabled: settings.isPronunciationEnabled,
    textScalePercent: settings.textScalePercent,
    voicePreference: settings.voicePreference,
    isBoldTextEnabled: settings.isBoldTextEnabled,
    isRandomLessonOrderEnabled: settings.isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved: settings.isReviewQuestionsRemoved,
  };
}

export function applyRemoteSyncedSettings(
  remote: Record<string, unknown>,
  setters: SyncedAppSettingsSetters,
): void {
  if (isLearnLanguage(remote.learnLanguage)) {
    setters.setLearnLanguage(remote.learnLanguage);
  }
  if (isDefaultLanguage(remote.defaultLanguage)) {
    setters.setDefaultLanguage(remote.defaultLanguage);
  }
  if (typeof remote.isPronunciationEnabled === 'boolean') {
    setters.setIsPronunciationEnabled(remote.isPronunciationEnabled);
  }
  if (typeof remote.textScalePercent === 'number') {
    setters.setTextScalePercent(clampTextScale(remote.textScalePercent));
  }
  if (
    remote.voicePreference === 'young_female' ||
    remote.voicePreference === 'google_female' ||
    remote.voicePreference === 'system_default'
  ) {
    setters.setVoicePreference(remote.voicePreference);
  }
  if (typeof remote.isBoldTextEnabled === 'boolean') {
    setters.setIsBoldTextEnabled(remote.isBoldTextEnabled);
  }
  if (typeof remote.isRandomLessonOrderEnabled === 'boolean') {
    setters.setIsRandomLessonOrderEnabled(remote.isRandomLessonOrderEnabled);
  }
  if (typeof remote.isReviewQuestionsRemoved === 'boolean') {
    setters.setIsReviewQuestionsRemoved(remote.isReviewQuestionsRemoved);
  }
}

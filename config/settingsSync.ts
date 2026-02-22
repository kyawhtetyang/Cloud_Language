import { Dispatch, SetStateAction } from 'react';
import {
  APP_DEFAULTS,
  APP_THEME_KEY,
  AppTheme,
  isAppTheme,
  BOLD_TEXT_ENABLED_KEY,
  clampTextScale,
  DEFAULT_LANGUAGE_KEY,
  DefaultLanguage,
  isDefaultLanguage,
  isLessonLayoutMode,
  isLearnLanguage,
  LESSON_LAYOUT_DEFAULT_KEY,
  LessonLayoutMode,
  LEARN_LANGUAGE_KEY,
  LearnLanguage,
  PRONUNCIATION_ENABLED_KEY,
  RANDOM_LESSON_ORDER_ENABLED_KEY,
  REMOVE_REVIEW_QUESTIONS_ENABLED_KEY,
  TEXT_SCALE_PERCENT_KEY,
  VOICE_PROVIDER_KEY,
  VoiceProvider,
  isVoiceProvider,
} from './appConfig';

export type SyncedAppSettings = {
  learnLanguage: LearnLanguage;
  defaultLanguage: DefaultLanguage;
  isPronunciationEnabled: boolean;
  textScalePercent: number;
  isBoldTextEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
  appTheme: AppTheme;
  lessonLayoutDefault: LessonLayoutMode;
  voiceProvider: VoiceProvider;
};

export type SyncedAppSettingsSetters = {
  setLearnLanguage: Dispatch<SetStateAction<LearnLanguage>>;
  setDefaultLanguage: Dispatch<SetStateAction<DefaultLanguage>>;
  setIsPronunciationEnabled: Dispatch<SetStateAction<boolean>>;
  setTextScalePercent: Dispatch<SetStateAction<number>>;
  setIsBoldTextEnabled: Dispatch<SetStateAction<boolean>>;
  setIsRandomLessonOrderEnabled: Dispatch<SetStateAction<boolean>>;
  setIsReviewQuestionsRemoved: Dispatch<SetStateAction<boolean>>;
  setAppTheme: Dispatch<SetStateAction<AppTheme>>;
  setLessonLayoutDefault: Dispatch<SetStateAction<LessonLayoutMode>>;
  setVoiceProvider: Dispatch<SetStateAction<VoiceProvider>>;
};

const DEFAULT_SYNCED_SETTINGS: SyncedAppSettings = {
  ...APP_DEFAULTS,
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
  return isLearnLanguage(value) ? value : APP_DEFAULTS.learnLanguage;
}

function parseDefaultLanguage(value: string | null): DefaultLanguage {
  return isDefaultLanguage(value) ? value : APP_DEFAULTS.defaultLanguage;
}

function parseBoolean(value: string | null): boolean {
  return value === 'true';
}

function parseTextScale(value: string | null): number {
  return clampTextScale(Number(value || DEFAULT_SYNCED_SETTINGS.textScalePercent));
}

function parseAppTheme(value: string | null): AppTheme {
  return isAppTheme(value) ? value : APP_DEFAULTS.appTheme;
}

function parseLessonLayoutDefault(value: string | null): LessonLayoutMode {
  return isLessonLayoutMode(value) ? value : APP_DEFAULTS.lessonLayoutDefault;
}

function parseVoiceProvider(value: string | null): VoiceProvider {
  if (value === 'google') return 'apple_siri';
  return isVoiceProvider(value) ? value : APP_DEFAULTS.voiceProvider;
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
    isBoldTextEnabled: parseBoolean(readWithFallback(BOLD_TEXT_ENABLED_KEY, profileStorageId)),
    isRandomLessonOrderEnabled: parseBoolean(readWithFallback(RANDOM_LESSON_ORDER_ENABLED_KEY, profileStorageId)),
    isReviewQuestionsRemoved: parseBoolean(readWithFallback(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY, profileStorageId)),
    appTheme: parseAppTheme(readWithFallback(APP_THEME_KEY, profileStorageId)),
    lessonLayoutDefault: parseLessonLayoutDefault(readWithFallback(LESSON_LAYOUT_DEFAULT_KEY, profileStorageId)),
    voiceProvider: parseVoiceProvider(readWithFallback(VOICE_PROVIDER_KEY, profileStorageId)),
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
  safeWrite(resolveKey(BOLD_TEXT_ENABLED_KEY), String(settings.isBoldTextEnabled));
  safeWrite(resolveKey(RANDOM_LESSON_ORDER_ENABLED_KEY), String(settings.isRandomLessonOrderEnabled));
  safeWrite(resolveKey(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY), String(settings.isReviewQuestionsRemoved));
  safeWrite(resolveKey(APP_THEME_KEY), settings.appTheme);
  safeWrite(resolveKey(LESSON_LAYOUT_DEFAULT_KEY), settings.lessonLayoutDefault);
  safeWrite(resolveKey(VOICE_PROVIDER_KEY), settings.voiceProvider);
}

export function buildSyncedSettingsPayload(settings: SyncedAppSettings): SyncedAppSettings {
  return {
    learnLanguage: settings.learnLanguage,
    defaultLanguage: settings.defaultLanguage,
    isPronunciationEnabled: settings.isPronunciationEnabled,
    textScalePercent: settings.textScalePercent,
    isBoldTextEnabled: settings.isBoldTextEnabled,
    isRandomLessonOrderEnabled: settings.isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved: settings.isReviewQuestionsRemoved,
    appTheme: settings.appTheme,
    lessonLayoutDefault: settings.lessonLayoutDefault,
    voiceProvider: settings.voiceProvider,
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
  if (typeof remote.isBoldTextEnabled === 'boolean') {
    setters.setIsBoldTextEnabled(remote.isBoldTextEnabled);
  }
  if (typeof remote.isRandomLessonOrderEnabled === 'boolean') {
    setters.setIsRandomLessonOrderEnabled(remote.isRandomLessonOrderEnabled);
  }
  if (typeof remote.isReviewQuestionsRemoved === 'boolean') {
    setters.setIsReviewQuestionsRemoved(remote.isReviewQuestionsRemoved);
  }
  if (isAppTheme(remote.appTheme)) {
    setters.setAppTheme(remote.appTheme);
  }
  if (isLessonLayoutMode(remote.lessonLayoutDefault)) {
    setters.setLessonLayoutDefault(remote.lessonLayoutDefault);
  }
  if (remote.voiceProvider === 'google') {
    setters.setVoiceProvider('apple_siri');
  } else if (isVoiceProvider(remote.voiceProvider)) {
    setters.setVoiceProvider(remote.voiceProvider);
  }
}


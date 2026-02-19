import { Dispatch, SetStateAction } from 'react';
import { VoicePreference } from '../components/AudioButton';
import {
  BOLD_TEXT_ENABLED_KEY,
  clampTextScale,
  DEFAULT_LANGUAGE_KEY,
  DefaultLanguage,
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
  return value === 'chinese' ? 'chinese' : 'english';
}

function parseDefaultLanguage(value: string | null): DefaultLanguage {
  return value === 'english' ? 'english' : 'burmese';
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

export function readSyncedSettingsFromStorage(): SyncedAppSettings {
  return {
    learnLanguage: parseLearnLanguage(safeRead(LEARN_LANGUAGE_KEY)),
    defaultLanguage: parseDefaultLanguage(safeRead(DEFAULT_LANGUAGE_KEY)),
    isPronunciationEnabled: parseBoolean(safeRead(PRONUNCIATION_ENABLED_KEY)),
    textScalePercent: parseTextScale(safeRead(TEXT_SCALE_PERCENT_KEY)),
    voicePreference: parseVoicePreference(safeRead(VOICE_PREFERENCE_KEY)),
    isBoldTextEnabled: parseBoolean(safeRead(BOLD_TEXT_ENABLED_KEY)),
    isRandomLessonOrderEnabled: parseBoolean(safeRead(RANDOM_LESSON_ORDER_ENABLED_KEY)),
    isReviewQuestionsRemoved: parseBoolean(safeRead(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY)),
  };
}

export function persistSyncedSettingsToStorage(settings: SyncedAppSettings): void {
  safeWrite(LEARN_LANGUAGE_KEY, settings.learnLanguage);
  safeWrite(DEFAULT_LANGUAGE_KEY, settings.defaultLanguage);
  safeWrite(PRONUNCIATION_ENABLED_KEY, String(settings.isPronunciationEnabled));
  safeWrite(TEXT_SCALE_PERCENT_KEY, String(settings.textScalePercent));
  safeWrite(VOICE_PREFERENCE_KEY, settings.voicePreference);
  safeWrite(BOLD_TEXT_ENABLED_KEY, String(settings.isBoldTextEnabled));
  safeWrite(RANDOM_LESSON_ORDER_ENABLED_KEY, String(settings.isRandomLessonOrderEnabled));
  safeWrite(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY, String(settings.isReviewQuestionsRemoved));
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
  if (remote.learnLanguage === 'english' || remote.learnLanguage === 'chinese') {
    setters.setLearnLanguage(remote.learnLanguage);
  }
  if (remote.defaultLanguage === 'english' || remote.defaultLanguage === 'burmese') {
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

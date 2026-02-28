import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyRemoteSyncedSettings,
  buildSyncedSettingsPayload,
  persistSyncedSettingsToStorage,
  readSyncedSettingsFromStorage,
} from './settingsSync';

describe('settingsSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads defaults when nothing is stored', () => {
    expect(readSyncedSettingsFromStorage()).toEqual({
      learnLanguage: 'english',
      defaultLanguage: 'burmese',
      isEnglishUiLocked: true,
      isPronunciationEnabled: false,
      textScalePercent: 100,
      isBoldTextEnabled: false,
      isAutoScrollEnabled: true,
      isRandomLessonOrderEnabled: false,
      isReviewQuestionsRemoved: false,
      appTheme: 'light',
      voiceProvider: 'default',
    });
  });

  it('persists and reads all synced settings consistently', () => {
    const settings = {
      learnLanguage: 'chinese' as const,
      defaultLanguage: 'english' as const,
      isEnglishUiLocked: false,
      isPronunciationEnabled: true,
      textScalePercent: 115,
      isBoldTextEnabled: true,
      isAutoScrollEnabled: false,
      isRandomLessonOrderEnabled: true,
      isReviewQuestionsRemoved: true,
      appTheme: 'dark' as const,
      voiceProvider: 'apple_siri' as const,
    };

    persistSyncedSettingsToStorage(settings);
    expect(readSyncedSettingsFromStorage()).toEqual(settings);
    expect(buildSyncedSettingsPayload(settings)).toEqual(settings);
  });

  it('uses profile-scoped settings with fallback to legacy global keys', () => {
    const legacyGlobal = {
      learnLanguage: 'english' as const,
      defaultLanguage: 'burmese' as const,
      isEnglishUiLocked: true,
      isPronunciationEnabled: false,
      textScalePercent: 100,
      isBoldTextEnabled: false,
      isAutoScrollEnabled: true,
      isRandomLessonOrderEnabled: false,
      isReviewQuestionsRemoved: false,
      appTheme: 'light' as const,
      voiceProvider: 'default' as const,
    };
    const profileSettings = {
      learnLanguage: 'chinese' as const,
      defaultLanguage: 'english' as const,
      isEnglishUiLocked: false,
      isPronunciationEnabled: true,
      textScalePercent: 115,
      isBoldTextEnabled: true,
      isAutoScrollEnabled: false,
      isRandomLessonOrderEnabled: true,
      isReviewQuestionsRemoved: true,
      appTheme: 'dark' as const,
      voiceProvider: 'apple_siri' as const,
    };

    persistSyncedSettingsToStorage(legacyGlobal);
    expect(readSyncedSettingsFromStorage('tester')).toEqual(legacyGlobal);

    persistSyncedSettingsToStorage(profileSettings, 'tester');
    expect(readSyncedSettingsFromStorage('tester')).toEqual(profileSettings);
    expect(readSyncedSettingsFromStorage()).toEqual(legacyGlobal);
  });

  it('applies only valid remote values to setters', () => {
    const setters = {
      setLearnLanguage: vi.fn(),
      setDefaultLanguage: vi.fn(),
      setIsEnglishUiLocked: vi.fn(),
      setIsPronunciationEnabled: vi.fn(),
      setTextScalePercent: vi.fn(),
      setIsBoldTextEnabled: vi.fn(),
      setIsAutoScrollEnabled: vi.fn(),
      setIsRandomLessonOrderEnabled: vi.fn(),
      setIsReviewQuestionsRemoved: vi.fn(),
      setAppTheme: vi.fn(),
      setVoiceProvider: vi.fn(),
    };

    applyRemoteSyncedSettings(
      {
        learnLanguage: 'chinese',
        defaultLanguage: 'vietnamese',
        isEnglishUiLocked: false,
        isPronunciationEnabled: true,
        textScalePercent: 999,
        isBoldTextEnabled: true,
        isAutoScrollEnabled: false,
        isRandomLessonOrderEnabled: true,
        isReviewQuestionsRemoved: true,
        appTheme: 'duolingo',
        voiceProvider: 'google',
      },
      setters,
    );

    expect(setters.setLearnLanguage).toHaveBeenCalledWith('chinese');
    expect(setters.setDefaultLanguage).toHaveBeenCalledWith('vietnamese');
    expect(setters.setIsEnglishUiLocked).toHaveBeenCalledWith(false);
    expect(setters.setIsPronunciationEnabled).toHaveBeenCalledWith(true);
    expect(setters.setTextScalePercent).toHaveBeenCalledWith(120);
    expect(setters.setIsBoldTextEnabled).toHaveBeenCalledWith(true);
    expect(setters.setIsAutoScrollEnabled).toHaveBeenCalledWith(false);
    expect(setters.setIsRandomLessonOrderEnabled).toHaveBeenCalledWith(true);
    expect(setters.setIsReviewQuestionsRemoved).toHaveBeenCalledWith(true);
    expect(setters.setAppTheme).toHaveBeenCalledWith('light');
    expect(setters.setVoiceProvider).toHaveBeenCalledWith('apple_siri');
  });
});

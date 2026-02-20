import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyRemoteSyncedSettings,
  buildSyncedSettingsPayload,
  persistSyncedSettingsToStorage,
  readSyncedSettingsFromStorage,
} from './settingsSync';
import { VOICE_PREFERENCE_KEY } from './appConfig';

describe('settingsSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads defaults when nothing is stored', () => {
    expect(readSyncedSettingsFromStorage()).toEqual({
      learnLanguage: 'english',
      defaultLanguage: 'burmese',
      isPronunciationEnabled: false,
      textScalePercent: 100,
      voicePreference: 'young_female',
      isBoldTextEnabled: false,
      isRandomLessonOrderEnabled: false,
      isReviewQuestionsRemoved: false,
      appTheme: 'apple_notes',
      lessonLayoutDefault: 'list',
    });
  });

  it('persists and reads all synced settings consistently', () => {
    const settings = {
      learnLanguage: 'chinese' as const,
      defaultLanguage: 'english' as const,
      isPronunciationEnabled: true,
      textScalePercent: 115,
      voicePreference: 'system_default' as const,
      isBoldTextEnabled: true,
      isRandomLessonOrderEnabled: true,
      isReviewQuestionsRemoved: true,
      appTheme: 'duolingo' as const,
      lessonLayoutDefault: 'paged' as const,
    };

    persistSyncedSettingsToStorage(settings);
    expect(readSyncedSettingsFromStorage()).toEqual(settings);
    expect(buildSyncedSettingsPayload(settings)).toEqual(settings);
  });

  it('uses profile-scoped settings with fallback to legacy global keys', () => {
    const legacyGlobal = {
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
    };
    const profileSettings = {
      learnLanguage: 'chinese' as const,
      defaultLanguage: 'english' as const,
      isPronunciationEnabled: true,
      textScalePercent: 115,
      voicePreference: 'system_default' as const,
      isBoldTextEnabled: true,
      isRandomLessonOrderEnabled: true,
      isReviewQuestionsRemoved: true,
      appTheme: 'duolingo' as const,
      lessonLayoutDefault: 'paged' as const,
    };

    persistSyncedSettingsToStorage(legacyGlobal);
    expect(readSyncedSettingsFromStorage('tester')).toEqual(legacyGlobal);

    persistSyncedSettingsToStorage(profileSettings, 'tester');
    localStorage.setItem(`${VOICE_PREFERENCE_KEY}:tester`, 'google_female');
    expect(readSyncedSettingsFromStorage('tester')).toEqual({
      ...profileSettings,
      voicePreference: 'system_default',
    });
    expect(readSyncedSettingsFromStorage()).toEqual(legacyGlobal);
  });

  it('applies only valid remote values to setters', () => {
    const setters = {
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

    applyRemoteSyncedSettings(
      {
        learnLanguage: 'chinese',
        defaultLanguage: 'english',
        isPronunciationEnabled: true,
        textScalePercent: 999,
        voicePreference: 'google_female',
        isBoldTextEnabled: true,
        isRandomLessonOrderEnabled: true,
        isReviewQuestionsRemoved: true,
        appTheme: 'duolingo',
        lessonLayoutDefault: 'paged',
      },
      setters,
    );

    expect(setters.setLearnLanguage).toHaveBeenCalledWith('chinese');
    expect(setters.setDefaultLanguage).toHaveBeenCalledWith('english');
    expect(setters.setIsPronunciationEnabled).toHaveBeenCalledWith(true);
    expect(setters.setTextScalePercent).toHaveBeenCalledWith(120);
    expect(setters.setVoicePreference).toHaveBeenCalledWith('system_default');
    expect(setters.setIsBoldTextEnabled).toHaveBeenCalledWith(true);
    expect(setters.setIsRandomLessonOrderEnabled).toHaveBeenCalledWith(true);
    expect(setters.setIsReviewQuestionsRemoved).toHaveBeenCalledWith(true);
    expect(setters.setAppTheme).toHaveBeenCalledWith('duolingo');
    expect(setters.setLessonLayoutDefault).toHaveBeenCalledWith('paged');
  });
});

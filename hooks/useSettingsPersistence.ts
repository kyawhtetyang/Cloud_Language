import { useEffect } from 'react';
import { VoicePreference } from '../components/AudioButton';
import {
  AppTheme,
  DefaultLanguage,
  LearnLanguage,
  LessonLayoutMode,
} from '../config/appConfig';
import { persistSyncedSettingsToStorage } from '../config/settingsSync';

type UseSettingsPersistenceParams = {
  profileStorageId: string;
  enabled?: boolean;
  learnLanguage: LearnLanguage;
  defaultLanguage: DefaultLanguage;
  isPronunciationEnabled: boolean;
  textScalePercent: number;
  voicePreference: VoicePreference;
  isBoldTextEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
  appTheme: AppTheme;
  lessonLayoutDefault: LessonLayoutMode;
};

export function useSettingsPersistence({
  profileStorageId,
  enabled = true,
  learnLanguage,
  defaultLanguage,
  isPronunciationEnabled,
  textScalePercent,
  voicePreference,
  isBoldTextEnabled,
  isRandomLessonOrderEnabled,
  isReviewQuestionsRemoved,
  appTheme,
  lessonLayoutDefault,
}: UseSettingsPersistenceParams) {
  useEffect(() => {
    if (!enabled || !profileStorageId) return;
    persistSyncedSettingsToStorage({
      learnLanguage,
      defaultLanguage,
      isPronunciationEnabled,
      textScalePercent,
      voicePreference,
      isBoldTextEnabled,
      isRandomLessonOrderEnabled,
      isReviewQuestionsRemoved,
      appTheme,
      lessonLayoutDefault,
    }, profileStorageId);
    document.documentElement.style.fontSize = `${textScalePercent}%`;
  }, [
    profileStorageId,
    enabled,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    voicePreference,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    lessonLayoutDefault,
  ]);
}

import { useEffect } from 'react';
import {
  AppTheme,
  DefaultLanguage,
  LearnLanguage,
  LessonLayoutMode,
  VoiceProvider,
} from '../config/appConfig';
import { persistSyncedSettingsToStorage } from '../config/settingsSync';

type UseSettingsPersistenceParams = {
  profileStorageId: string;
  enabled?: boolean;
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

export function useSettingsPersistence({
  profileStorageId,
  enabled = true,
  learnLanguage,
  defaultLanguage,
  isPronunciationEnabled,
  textScalePercent,
  isBoldTextEnabled,
  isRandomLessonOrderEnabled,
  isReviewQuestionsRemoved,
  appTheme,
  lessonLayoutDefault,
  voiceProvider,
}: UseSettingsPersistenceParams) {
  useEffect(() => {
    if (!enabled || !profileStorageId) return;
    persistSyncedSettingsToStorage({
      learnLanguage,
      defaultLanguage,
      isPronunciationEnabled,
      textScalePercent,
      isBoldTextEnabled,
      isRandomLessonOrderEnabled,
      isReviewQuestionsRemoved,
      appTheme,
      lessonLayoutDefault,
      voiceProvider,
    }, profileStorageId);
    document.documentElement.style.fontSize = `${textScalePercent}%`;
  }, [
    profileStorageId,
    enabled,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    lessonLayoutDefault,
    voiceProvider,
  ]);
}


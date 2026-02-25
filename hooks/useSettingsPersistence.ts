import { useEffect } from 'react';
import {
  AppTheme,
  DefaultLanguage,
  LearnLanguage,
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
  isAutoScrollEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
  appTheme: AppTheme;
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
  isAutoScrollEnabled,
  isRandomLessonOrderEnabled,
  isReviewQuestionsRemoved,
  appTheme,
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
      isAutoScrollEnabled,
      isRandomLessonOrderEnabled,
      isReviewQuestionsRemoved,
      appTheme,
      voiceProvider,
    }, profileStorageId);
  }, [
    profileStorageId,
    enabled,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    voiceProvider,
  ]);
}

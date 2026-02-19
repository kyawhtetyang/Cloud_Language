import { useEffect } from 'react';
import { VoicePreference } from '../components/AudioButton';
import {
  DefaultLanguage,
  LearnLanguage,
} from '../config/appConfig';
import { persistSyncedSettingsToStorage } from '../config/settingsSync';

type UseSettingsPersistenceParams = {
  learnLanguage: LearnLanguage;
  defaultLanguage: DefaultLanguage;
  isPronunciationEnabled: boolean;
  textScalePercent: number;
  voicePreference: VoicePreference;
  isBoldTextEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
};

export function useSettingsPersistence({
  learnLanguage,
  defaultLanguage,
  isPronunciationEnabled,
  textScalePercent,
  voicePreference,
  isBoldTextEnabled,
  isRandomLessonOrderEnabled,
  isReviewQuestionsRemoved,
}: UseSettingsPersistenceParams) {
  useEffect(() => {
    persistSyncedSettingsToStorage({
      learnLanguage,
      defaultLanguage,
      isPronunciationEnabled,
      textScalePercent,
      voicePreference,
      isBoldTextEnabled,
      isRandomLessonOrderEnabled,
      isReviewQuestionsRemoved,
    });
    document.documentElement.style.fontSize = `${textScalePercent}%`;
  }, [
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    voicePreference,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
  ]);
}

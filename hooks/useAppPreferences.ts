import { useEffect, useRef, useState } from 'react';
import {
  AppTheme,
  DefaultLanguage,
  LearnLanguage,
  VoiceProvider,
} from '../config/appConfig';
import { readSyncedSettingsFromStorage } from '../config/settingsSync';

type UseAppPreferencesResult = {
  isPronunciationEnabled: boolean;
  setIsPronunciationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  learnLanguage: LearnLanguage;
  setLearnLanguage: React.Dispatch<React.SetStateAction<LearnLanguage>>;
  defaultLanguage: DefaultLanguage;
  setDefaultLanguage: React.Dispatch<React.SetStateAction<DefaultLanguage>>;
  textScalePercent: number;
  setTextScalePercent: React.Dispatch<React.SetStateAction<number>>;
  isBoldTextEnabled: boolean;
  setIsBoldTextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isAutoScrollEnabled: boolean;
  setIsAutoScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isRandomLessonOrderEnabled: boolean;
  setIsRandomLessonOrderEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isReviewQuestionsRemoved: boolean;
  setIsReviewQuestionsRemoved: React.Dispatch<React.SetStateAction<boolean>>;
  appTheme: AppTheme;
  setAppTheme: React.Dispatch<React.SetStateAction<AppTheme>>;
  voiceProvider: VoiceProvider;
  setVoiceProvider: React.Dispatch<React.SetStateAction<VoiceProvider>>;
  hasHydratedSettings: boolean;
};

export function useAppPreferences(profileStorageId: string): UseAppPreferencesResult {
  const initialSettingsRef = useRef(readSyncedSettingsFromStorage(profileStorageId));
  const initialSettings = initialSettingsRef.current;
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);
  const [isPronunciationEnabled, setIsPronunciationEnabled] = useState<boolean>(initialSettings.isPronunciationEnabled);
  const [learnLanguage, setLearnLanguage] = useState<LearnLanguage>(initialSettings.learnLanguage);
  const [defaultLanguage, setDefaultLanguage] = useState<DefaultLanguage>(initialSettings.defaultLanguage);
  const [textScalePercent, setTextScalePercent] = useState<number>(initialSettings.textScalePercent);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState<boolean>(initialSettings.isBoldTextEnabled);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(initialSettings.isAutoScrollEnabled);
  const [isRandomLessonOrderEnabled, setIsRandomLessonOrderEnabled] = useState<boolean>(initialSettings.isRandomLessonOrderEnabled);
  const [isReviewQuestionsRemoved, setIsReviewQuestionsRemoved] = useState<boolean>(initialSettings.isReviewQuestionsRemoved);
  const [appTheme, setAppTheme] = useState<AppTheme>(initialSettings.appTheme);
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>(initialSettings.voiceProvider);

  useEffect(() => {
    if (!profileStorageId) {
      setHasHydratedSettings(false);
      return;
    }
    const next = readSyncedSettingsFromStorage(profileStorageId);
    setLearnLanguage(next.learnLanguage);
    setDefaultLanguage(next.defaultLanguage);
    setIsPronunciationEnabled(next.isPronunciationEnabled);
    setTextScalePercent(next.textScalePercent);
    setIsBoldTextEnabled(next.isBoldTextEnabled);
    setIsAutoScrollEnabled(next.isAutoScrollEnabled);
    setIsRandomLessonOrderEnabled(next.isRandomLessonOrderEnabled);
    setIsReviewQuestionsRemoved(next.isReviewQuestionsRemoved);
    setAppTheme(next.appTheme);
    setVoiceProvider(next.voiceProvider);
    setHasHydratedSettings(true);
  }, [profileStorageId]);

  return {
    isPronunciationEnabled,
    setIsPronunciationEnabled,
    learnLanguage,
    setLearnLanguage,
    defaultLanguage,
    setDefaultLanguage,
    textScalePercent,
    setTextScalePercent,
    isBoldTextEnabled,
    setIsBoldTextEnabled,
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    setIsRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    setIsReviewQuestionsRemoved,
    appTheme,
    setAppTheme,
    voiceProvider,
    setVoiceProvider,
    hasHydratedSettings,
  };
}

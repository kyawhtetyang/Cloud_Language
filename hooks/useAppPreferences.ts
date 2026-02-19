import { useRef, useState } from 'react';
import {
  DefaultLanguage,
  LearnLanguage,
} from '../config/appConfig';
import { VoicePreference } from '../components/AudioButton';
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
  voicePreference: VoicePreference;
  setVoicePreference: React.Dispatch<React.SetStateAction<VoicePreference>>;
  isBoldTextEnabled: boolean;
  setIsBoldTextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isRandomLessonOrderEnabled: boolean;
  setIsRandomLessonOrderEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isReviewQuestionsRemoved: boolean;
  setIsReviewQuestionsRemoved: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useAppPreferences(): UseAppPreferencesResult {
  const initialSettingsRef = useRef(readSyncedSettingsFromStorage());
  const initialSettings = initialSettingsRef.current;
  const [isPronunciationEnabled, setIsPronunciationEnabled] = useState<boolean>(initialSettings.isPronunciationEnabled);
  const [learnLanguage, setLearnLanguage] = useState<LearnLanguage>(initialSettings.learnLanguage);
  const [defaultLanguage, setDefaultLanguage] = useState<DefaultLanguage>(initialSettings.defaultLanguage);
  const [textScalePercent, setTextScalePercent] = useState<number>(initialSettings.textScalePercent);
  const [voicePreference, setVoicePreference] = useState<VoicePreference>(initialSettings.voicePreference);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState<boolean>(initialSettings.isBoldTextEnabled);
  const [isRandomLessonOrderEnabled, setIsRandomLessonOrderEnabled] = useState<boolean>(initialSettings.isRandomLessonOrderEnabled);
  const [isReviewQuestionsRemoved, setIsReviewQuestionsRemoved] = useState<boolean>(initialSettings.isReviewQuestionsRemoved);

  return {
    isPronunciationEnabled,
    setIsPronunciationEnabled,
    learnLanguage,
    setLearnLanguage,
    defaultLanguage,
    setDefaultLanguage,
    textScalePercent,
    setTextScalePercent,
    voicePreference,
    setVoicePreference,
    isBoldTextEnabled,
    setIsBoldTextEnabled,
    isRandomLessonOrderEnabled,
    setIsRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    setIsReviewQuestionsRemoved,
  };
}

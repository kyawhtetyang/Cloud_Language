import { useState } from 'react';
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
} from '../config/appConfig';
import { VoicePreference } from '../components/AudioButton';

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
  const [isPronunciationEnabled, setIsPronunciationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PRONUNCIATION_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [learnLanguage, setLearnLanguage] = useState<LearnLanguage>(() => {
    try {
      return localStorage.getItem(LEARN_LANGUAGE_KEY) === 'chinese' ? 'chinese' : 'english';
    } catch {
      return 'english';
    }
  });
  const [defaultLanguage, setDefaultLanguage] = useState<DefaultLanguage>(() => {
    try {
      const value = localStorage.getItem(DEFAULT_LANGUAGE_KEY);
      return value === 'english' ? 'english' : 'burmese';
    } catch {
      return 'burmese';
    }
  });
  const [textScalePercent, setTextScalePercent] = useState<number>(() => {
    try {
      return clampTextScale(Number(localStorage.getItem(TEXT_SCALE_PERCENT_KEY) || 100));
    } catch {
      return 100;
    }
  });
  const [voicePreference, setVoicePreference] = useState<VoicePreference>(() => {
    try {
      const value = localStorage.getItem(VOICE_PREFERENCE_KEY);
      if (value === 'google_female' || value === 'system_default' || value === 'young_female') {
        return value;
      }
      return 'young_female';
    } catch {
      return 'young_female';
    }
  });
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BOLD_TEXT_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isRandomLessonOrderEnabled, setIsRandomLessonOrderEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(RANDOM_LESSON_ORDER_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isReviewQuestionsRemoved, setIsReviewQuestionsRemoved] = useState<boolean>(() => {
    try {
      return localStorage.getItem(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });

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

import { useEffect } from 'react';
import { VoicePreference } from '../components/AudioButton';
import {
  BOLD_TEXT_ENABLED_KEY,
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
    localStorage.setItem(LEARN_LANGUAGE_KEY, learnLanguage);
  }, [learnLanguage]);

  useEffect(() => {
    localStorage.setItem(PRONUNCIATION_ENABLED_KEY, String(isPronunciationEnabled));
  }, [isPronunciationEnabled]);

  useEffect(() => {
    localStorage.setItem(DEFAULT_LANGUAGE_KEY, defaultLanguage);
  }, [defaultLanguage]);

  useEffect(() => {
    localStorage.setItem(TEXT_SCALE_PERCENT_KEY, String(textScalePercent));
    document.documentElement.style.fontSize = `${textScalePercent}%`;
  }, [textScalePercent]);

  useEffect(() => {
    localStorage.setItem(VOICE_PREFERENCE_KEY, voicePreference);
  }, [voicePreference]);

  useEffect(() => {
    localStorage.setItem(BOLD_TEXT_ENABLED_KEY, String(isBoldTextEnabled));
  }, [isBoldTextEnabled]);

  useEffect(() => {
    localStorage.setItem(RANDOM_LESSON_ORDER_ENABLED_KEY, String(isRandomLessonOrderEnabled));
  }, [isRandomLessonOrderEnabled]);

  useEffect(() => {
    localStorage.setItem(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY, String(isReviewQuestionsRemoved));
  }, [isReviewQuestionsRemoved]);
}

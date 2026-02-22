import type { LearnLanguage } from './appConfig';

export type SpeechLanguageProfile = {
  locale: string;
  prefix: string;
};

export const DEFAULT_SPEECH_LANGUAGE_PROFILE: SpeechLanguageProfile = {
  locale: 'en-US',
  prefix: 'en-',
};

export const SPEECH_LANGUAGE_PROFILES: Record<LearnLanguage, SpeechLanguageProfile> = {
  english: {
    locale: 'en-US',
    prefix: 'en-',
  },
  chinese: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  hsk_chinese: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  hsk1: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  hsk2: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  hsk3: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  hsk4: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  hsk5: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
  hsk6: {
    locale: 'zh-CN',
    prefix: 'zh-',
  },
};

export function getSpeechLanguageProfile(learnLanguage?: string): SpeechLanguageProfile {
  if (!learnLanguage) return DEFAULT_SPEECH_LANGUAGE_PROFILE;
  return SPEECH_LANGUAGE_PROFILES[learnLanguage as LearnLanguage] || DEFAULT_SPEECH_LANGUAGE_PROFILE;
}

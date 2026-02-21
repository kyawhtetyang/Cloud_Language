import { getSpeechLanguageProfile, SpeechLanguageProfile } from '../config/speechConfig';
import { VoiceProvider } from '../config/appConfig';

type SpeakContext = {
  learnLanguage?: string;
  unitId?: number;
  audioUrl?: string;
  voiceProvider?: VoiceProvider;
};

let activeHtmlAudio: HTMLAudioElement | null = null;
let activeSpeechSession = 0;
const AUDIO_START_TIMEOUT_MS = 450;

function pickVoiceForProfile(profile: SpeechLanguageProfile): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window) || typeof window.speechSynthesis.getVoices !== 'function') {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const lowerLocale = profile.locale.toLowerCase();
  const prefixMatch = profile.prefix.toLowerCase();
  const languageMatch = voices.find((voice) => voice.lang?.toLowerCase().startsWith(lowerLocale));
  if (languageMatch) return languageMatch;
  const broadLanguageMatch = voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefixMatch));
  return broadLanguageMatch || null;
}

function pickAppleFemaleVoice(profile: SpeechLanguageProfile): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window) || typeof window.speechSynthesis.getVoices !== 'function') {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const lowerLocale = profile.locale.toLowerCase();
  const prefixMatch = profile.prefix.toLowerCase();
  const localeVoices = voices.filter(
    (voice) =>
      voice.lang?.toLowerCase().startsWith(lowerLocale)
      || voice.lang?.toLowerCase().startsWith(prefixMatch),
  );
  const appleFemalePriority = ['siri', 'samantha', 'ava', 'karen', 'victoria', 'female'];
  const score = (voice: SpeechSynthesisVoice): number => {
    const name = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
    let total = 0;
    if (name.includes('apple') || name.includes('siri')) total += 4;
    const index = appleFemalePriority.findIndex((token) => name.includes(token));
    if (index >= 0) total += 3 - Math.min(index, 2);
    return total;
  };
  const ranked = [...localeVoices].sort((a, b) => score(b) - score(a));
  if (ranked.length > 0 && score(ranked[0]) > 0) return ranked[0];
  return null;
}

export function cancelSpeech(): void {
  if (activeHtmlAudio) {
    activeHtmlAudio.pause();
    activeHtmlAudio.currentTime = 0;
    activeHtmlAudio.src = '';
    activeHtmlAudio.load();
    activeHtmlAudio = null;
  }
  activeSpeechSession += 1;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function playDirectAudioUrl(audioUrl: string): Promise<boolean> {
  if (!audioUrl || typeof Audio === 'undefined') return Promise.resolve(false);
  const audio = new Audio(audioUrl);
  activeHtmlAudio = audio;

  return new Promise((resolve) => {
    let settled = false;
    let started = false;
    let startTimeout = 0;
    const cleanup = () => {
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
      if (startTimeout) {
        window.clearTimeout(startTimeout);
        startTimeout = 0;
      }
    };
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (!ok) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
      }
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
      resolve(ok);
    };
    startTimeout = window.setTimeout(() => {
      if (!started) done(false);
    }, AUDIO_START_TIMEOUT_MS);

    audio.onplaying = () => {
      if (settled) {
        audio.pause();
        audio.currentTime = 0;
        return;
      }
      started = true;
    };
    audio.onended = () => done(true);
    audio.onerror = () => done(false);
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => done(false));
    }
  });
}

export async function speakText(
  text: string,
  context?: SpeakContext,
): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  if (typeof text !== 'string' || text.trim().length === 0) return Promise.resolve();

  const sessionId = activeSpeechSession + 1;
  activeSpeechSession = sessionId;
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const speechProfile = getSpeechLanguageProfile(context?.learnLanguage);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechProfile.locale;
    const preferredVoice =
      context?.voiceProvider === 'apple_siri'
        ? pickAppleFemaleVoice(speechProfile) || pickVoiceForProfile(speechProfile)
        : pickVoiceForProfile(speechProfile);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    if (activeSpeechSession !== sessionId) done();
  });
}

import { getSpeechLanguageProfile, SpeechLanguageProfile } from '../config/speechConfig';

type SpeakContext = {
  learnLanguage?: string;
  unitId?: number;
  audioUrl?: string;
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
  if (typeof context?.audioUrl === 'string' && context.audioUrl.trim().length > 0) {
    const usedClipAudio = await playDirectAudioUrl(context.audioUrl);
    if (usedClipAudio) return;
  }
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
    const preferredVoice = pickVoiceForProfile(speechProfile);
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

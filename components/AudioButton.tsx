import React from 'react';

interface AudioButtonProps {
  text: string;
  onPlay?: () => void;
  compact?: boolean;
  voicePreference?: VoicePreference;
}

export type VoicePreference = 'young_female' | 'system_default';

const YOUNG_FEMALE_VOICE_HINTS = [
  'aria',
  'jenny',
  'ava',
  'emma',
  'xiaoxiao',
  'tingting',
  'katya',
  'female',
  'woman',
  'girl',
];

function guessUtteranceLang(text: string): string {
  if (/[\u1000-\u109F]/.test(text)) return 'my-MM';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
  return 'en-US';
}

function pickPreferredVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  voicePreference: VoicePreference,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const sameLang = voices.filter((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  const pool = sameLang.length > 0 ? sameLang : voices;
  if (voicePreference === 'system_default') {
    // Let the browser/system choose the true default voice.
    return null;
  }
  const youngFemaleMatch = pool.find((voice) => {
    const name = voice.name.toLowerCase();
    return YOUNG_FEMALE_VOICE_HINTS.some((hint) => name.includes(hint));
  });
  if (youngFemaleMatch) return youngFemaleMatch;
  const fallbackFemale = pool.find((voice) =>
    YOUNG_FEMALE_VOICE_HINTS.some((hint) => voice.name.toLowerCase().includes(hint)),
  );
  return fallbackFemale || pool[0] || null;
}

export function cancelSpeech(): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}

export function speakText(text: string, voicePreference: VoicePreference = 'young_female'): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = guessUtteranceLang(text);
  utterance.lang = lang;
  const preferredVoice = pickPreferredVoice(voices, lang, voicePreference);
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 0.9;
  utterance.pitch = 1.05;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    synth.speak(utterance);
  });
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  onPlay,
  compact = false,
  voicePreference = 'young_female',
}) => {
  const playAudio = () => {
    if ('speechSynthesis' in window) {
      cancelSpeech();
      void speakText(text, voicePreference).then(() => onPlay?.());
    }
  };

  return (
    <button
      onClick={playAudio}
      className={`rounded-2xl bg-brand border-2 border-brand-dark duo-button-shadow flex items-center justify-center text-white hover:bg-brand-dark transition-colors group ${
        compact ? 'w-11 h-11 rounded-xl shrink-0' : 'w-16 h-16'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={compact ? 20 : 32}
        height={compact ? 20 : 32}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="group-active:scale-90 transition-transform"
      >
        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
    </button>
  );
};

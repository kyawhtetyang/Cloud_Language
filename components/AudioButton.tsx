
import React from 'react';

interface AudioButtonProps {
  text: string;
  onPlay?: () => void;
  compact?: boolean;
}

const YOUNG_FEMALE_VOICE_HINTS = [
  'google uk english female',
  'google us english',
  'google',
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

function pickPreferredVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const sameLang = voices.filter((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  const pool = sameLang.length > 0 ? sameLang : voices;
  const googleFemale = pool.find((voice) => {
    const name = voice.name.toLowerCase();
    return name.includes('google') && (name.includes('female') || name.includes('aria') || name.includes('jenny'));
  });
  if (googleFemale) return googleFemale;
  const femaleMatch = pool.find((voice) =>
    YOUNG_FEMALE_VOICE_HINTS.some((hint) => voice.name.toLowerCase().includes(hint)),
  );
  return femaleMatch || pool[0] || null;
}

export const AudioButton: React.FC<AudioButtonProps> = ({ text, onPlay, compact = false }) => {
  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const lang = guessUtteranceLang(text);
      utterance.lang = lang;
      const preferredVoice = pickPreferredVoice(window.speechSynthesis.getVoices(), lang);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 1.02;
      utterance.pitch = 1.35;
      window.speechSynthesis.speak(utterance);
      onPlay?.();
    }
  };

  return (
    <button
      onClick={playAudio}
      className={`rounded-2xl bg-[#58cc02] border-2 border-[#46a302] duo-button-shadow flex items-center justify-center text-white hover:bg-[#46a302] transition-colors group ${
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


import React from 'react';

interface AudioButtonProps {
  text: string;
  onPlay?: () => void;
  compact?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({ text, onPlay, compact = false }) => {
  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
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

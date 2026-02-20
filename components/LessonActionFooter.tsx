import React from 'react';
import { AppMode } from '../config/appConfig';

type LessonActionFooterProps = {
  mode: AppMode;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  isReadDisabled: boolean;
  isReading: boolean;
  isShuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPrevious: () => void;
  onRead: () => void;
  onNext: () => void;
};

const PreviousIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <rect x="5" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M16 7l-7 5 7 5V7Z" fill="currentColor" />
  </svg>
);

const NextIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <rect x="17" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M8 7v10l7-5-7-5Z" fill="currentColor" />
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <path d="M9 7v10l8-5-8-5Z" fill="currentColor" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <rect x="8" y="7" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="13" y="7" width="3" height="10" rx="1" fill="currentColor" />
  </svg>
);

const ShuffleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h4v4" />
    <path d="M4 20l7-7" />
    <path d="M20 4l-8 8" />
    <path d="M4 4l5 5" />
    <path d="M16 21h4v-4" />
    <path d="M15 15l5 5" />
  </svg>
);

const RepeatIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

export const LessonActionFooter: React.FC<LessonActionFooterProps> = ({
  mode,
  isNextDisabled,
  isPreviousDisabled,
  isReadDisabled,
  isReading,
  isShuffleEnabled,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  onPrevious,
  onRead,
  onNext,
}) => {
  return (
    <footer className="fixed left-0 right-0 z-30 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] bottom-[calc(76px+env(safe-area-inset-bottom))] md:bottom-4 md:left-1/2 md:right-auto md:w-full md:max-w-[720px] md:-translate-x-1/2 md:px-6 md:pb-0">
      <div className="mx-auto flex max-w-md flex-col gap-2.5 md:gap-3">
        {mode === 'learn' && (
          <div className="mx-auto flex w-full max-w-[340px] items-center justify-between gap-1.5 rounded-[22px] bg-white/96 px-2 py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.16)] backdrop-blur-md">
            <button
              onClick={onToggleShuffle}
              aria-label={isShuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
              title={isShuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                isShuffleEnabled
                  ? 'btn-selected'
                  : 'btn-unselected'
              }`}
            >
              <ShuffleIcon />
              <span className="sr-only">{isShuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}</span>
            </button>
            <button
              onClick={onPrevious}
              disabled={isPreviousDisabled}
              aria-label="Previous"
              title="Previous"
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                isPreviousDisabled
                  ? 'btn-unselected cursor-not-allowed opacity-50'
                  : 'btn-unselected active:scale-[0.97]'
              }`}
            >
              <PreviousIcon />
              <span className="sr-only">Previous</span>
            </button>
            <button
              onClick={onRead}
              disabled={isReadDisabled}
              aria-label={isReading ? 'Stop' : 'Read'}
              title={isReading ? 'Stop' : 'Read'}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                isReadDisabled
                  ? 'btn-unselected cursor-not-allowed'
                  : 'btn-unselected hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isReading ? <PauseIcon /> : <PlayIcon />}
              <span className="sr-only">{isReading ? 'Stop' : 'Read'}</span>
            </button>
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              aria-label="Next"
              title="Next"
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                isNextDisabled
                  ? 'btn-unselected cursor-not-allowed opacity-50'
                  : 'btn-unselected active:scale-[0.97]'
              }`}
            >
              <NextIcon />
              <span className="sr-only">Next</span>
            </button>
            <button
              onClick={onToggleRepeat}
              aria-label={
                repeatMode === 'off'
                  ? 'Enable repeat all'
                  : repeatMode === 'all'
                    ? 'Enable repeat one'
                    : 'Disable repeat'
              }
              title={
                repeatMode === 'off'
                  ? 'Enable repeat all'
                  : repeatMode === 'all'
                    ? 'Enable repeat one'
                    : 'Disable repeat'
              }
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                repeatMode === 'off'
                  ? 'btn-unselected'
                  : 'btn-selected'
              }`}
            >
              <RepeatIcon />
              {repeatMode === 'one' && (
                <span className="absolute -bottom-0.5 right-1 text-xs font-black leading-none">1</span>
              )}
              <span className="sr-only">
                {repeatMode === 'off'
                  ? 'Enable repeat all'
                  : repeatMode === 'all'
                    ? 'Enable repeat one'
                    : 'Disable repeat'}
              </span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};


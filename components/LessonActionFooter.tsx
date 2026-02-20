import React from 'react';
import { AppMode, LEARN_QUESTIONS_PER_UNIT, QUICK_REVIEW_CHECKPOINTS } from '../config/appConfig';

type LessonActionFooterProps = {
  mode: AppMode;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  isReadDisabled: boolean;
  isReading: boolean;
  isShuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  learnStep: number;
  isReviewQuestionsRemoved: boolean;
  isMatchReviewComplete: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPrevious: () => void;
  onRead: () => void;
  onNext: () => void;
  onQuizSubmit: () => void;
};

const PreviousIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-[22px] w-[22px]" aria-hidden="true">
    <rect x="5" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M16 7l-7 5 7 5V7Z" fill="currentColor" />
  </svg>
);

const NextIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-[22px] w-[22px]" aria-hidden="true">
    <rect x="17" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M8 7v10l7-5-7-5Z" fill="currentColor" />
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-[28px] w-[28px]" aria-hidden="true">
    <path d="M9 7v10l8-5-8-5Z" fill="currentColor" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-[28px] w-[28px]" aria-hidden="true">
    <rect x="8" y="7" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="13" y="7" width="3" height="10" rx="1" fill="currentColor" />
  </svg>
);

const ShuffleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-[18px] w-[18px]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h4v4" />
    <path d="M4 20l7-7" />
    <path d="M20 4l-8 8" />
    <path d="M4 4l5 5" />
    <path d="M16 21h4v-4" />
    <path d="M15 15l5 5" />
  </svg>
);

const RepeatIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-[18px] w-[18px]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  learnStep,
  isReviewQuestionsRemoved,
  isMatchReviewComplete,
  onToggleShuffle,
  onToggleRepeat,
  onPrevious,
  onRead,
  onNext,
  onQuizSubmit,
}) => {
  return (
    <footer className="fixed bottom-16 left-0 right-0 p-3 md:p-6 bg-white/95 backdrop-blur border-t border-gray-100 md:static md:border-none md:bg-transparent">
      <div className="max-w-md mx-auto flex flex-col gap-2.5 md:gap-3">
        {mode === 'learn' && (
          <div className="mx-auto flex w-full max-w-[320px] items-center justify-between gap-1.5">
            <button
              onClick={onToggleShuffle}
              aria-label={isShuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
              title={isShuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                isShuffleEnabled
                  ? 'border-[#58cc02] bg-[#ecf9df] text-[#2f7d01]'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
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
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-700 transition-all ${
                isPreviousDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 active:scale-95'
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
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#dbe8cb] bg-white text-[#2f7d01] transition-all ${
                isReadDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f7ffef] active:scale-95'
              }`}
            >
              {isReading ? <PauseIcon /> : <PlayIcon />}
              <span className="sr-only">{isReading ? 'Stop' : 'Read'}</span>
            </button>
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              aria-label={(() => {
                const nextStep = Math.min(LEARN_QUESTIONS_PER_UNIT, learnStep + 1);
                if (!QUICK_REVIEW_CHECKPOINTS.includes(nextStep) || isReviewQuestionsRemoved) return 'Next';
                return 'Quick Review';
              })()}
              title={(() => {
                const nextStep = Math.min(LEARN_QUESTIONS_PER_UNIT, learnStep + 1);
                if (!QUICK_REVIEW_CHECKPOINTS.includes(nextStep) || isReviewQuestionsRemoved) return 'Next';
                return 'Quick Review';
              })()}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-700 transition-all ${
                isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 active:scale-95'
              }`}
            >
              <NextIcon />
              <span className="sr-only">
                {(() => {
                  const nextStep = Math.min(LEARN_QUESTIONS_PER_UNIT, learnStep + 1);
                  if (!QUICK_REVIEW_CHECKPOINTS.includes(nextStep) || isReviewQuestionsRemoved) return 'Next';
                  return 'Quick Review';
                })()}
              </span>
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
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                repeatMode === 'off'
                  ? 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  : 'border-[#58cc02] bg-[#ecf9df] text-[#2f7d01]'
              }`}
            >
              <RepeatIcon />
              {repeatMode === 'one' && (
                <span className="absolute -bottom-0.5 right-1 text-[10px] font-black leading-none">1</span>
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
        {mode === 'quiz' && (
          <button
            onClick={onQuizSubmit}
            disabled={!isMatchReviewComplete}
            className={`w-full py-3 md:py-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-base md:text-lg uppercase tracking-wide md:tracking-wider duo-button-shadow transition-all ${
              !isMatchReviewComplete
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-95'
            }`}
          >
            Submit Quick Review
          </button>
        )}
      </div>
    </footer>
  );
};

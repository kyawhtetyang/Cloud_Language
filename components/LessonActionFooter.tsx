import React from 'react';
import { AppMode, LEARN_QUESTIONS_PER_UNIT, QUICK_REVIEW_CHECKPOINTS } from '../config/appConfig';

type LessonActionFooterProps = {
  mode: AppMode;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  isReadDisabled: boolean;
  isReading: boolean;
  learnStep: number;
  isReviewQuestionsRemoved: boolean;
  isMatchReviewComplete: boolean;
  onPrevious: () => void;
  onRead: () => void;
  onNext: () => void;
  onQuizSubmit: () => void;
};

export const LessonActionFooter: React.FC<LessonActionFooterProps> = ({
  mode,
  isNextDisabled,
  isPreviousDisabled,
  isReadDisabled,
  isReading,
  learnStep,
  isReviewQuestionsRemoved,
  isMatchReviewComplete,
  onPrevious,
  onRead,
  onNext,
  onQuizSubmit,
}) => {
  return (
    <footer className="fixed bottom-16 left-0 right-0 p-3 md:p-6 bg-white/95 backdrop-blur border-t border-gray-100 md:static md:border-none md:bg-transparent">
      <div className="max-w-md mx-auto flex flex-col gap-2.5 md:gap-3">
        {mode === 'learn' && (
          <div className="grid grid-cols-3 gap-2.5 md:gap-3">
            <button
              onClick={onPrevious}
              disabled={isPreviousDisabled}
              className={`w-full py-3 md:py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-extrabold text-base md:text-lg uppercase tracking-wide md:tracking-wider transition-all ${
                isPreviousDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 active:scale-95'
              }`}
            >
              Previous
            </button>
            <button
              onClick={onRead}
              disabled={isReadDisabled}
              className={`w-full py-3 md:py-4 rounded-2xl border-2 border-[#dbe8cb] bg-white text-[#2f7d01] font-extrabold text-base md:text-lg uppercase tracking-wide md:tracking-wider transition-all ${
                isReadDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f7ffef] active:scale-95'
              }`}
            >
              {isReading ? 'Stop' : 'Read'}
            </button>
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className={`w-full py-3 md:py-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-base md:text-lg uppercase tracking-wide md:tracking-wider duo-button-shadow transition-all ${
                isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'
              }`}
            >
              {(() => {
                const nextStep = Math.min(LEARN_QUESTIONS_PER_UNIT, learnStep + 1);
                if (!QUICK_REVIEW_CHECKPOINTS.includes(nextStep) || isReviewQuestionsRemoved) return 'Next';
                return 'Quick Review';
              })()}
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

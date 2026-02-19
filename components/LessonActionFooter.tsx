import React from 'react';
import { AppMode, LEARN_QUESTIONS_PER_UNIT, QUICK_REVIEW_CHECKPOINTS } from '../config/appConfig';

type LessonActionFooterProps = {
  mode: AppMode;
  isNextDisabled: boolean;
  learnStep: number;
  isReviewQuestionsRemoved: boolean;
  isMatchReviewComplete: boolean;
  onNext: () => void;
  onQuizSubmit: () => void;
};

export const LessonActionFooter: React.FC<LessonActionFooterProps> = ({
  mode,
  isNextDisabled,
  learnStep,
  isReviewQuestionsRemoved,
  isMatchReviewComplete,
  onNext,
  onQuizSubmit,
}) => {
  return (
    <footer className="fixed bottom-16 left-0 right-0 p-3 md:p-6 bg-white/95 backdrop-blur border-t border-gray-100 md:static md:border-none md:bg-transparent">
      <div className="max-w-md mx-auto flex flex-col gap-2.5 md:gap-3">
        {mode === 'learn' && (
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


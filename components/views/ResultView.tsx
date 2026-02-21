import React from 'react';

type ReviewResult = {
  correct: number;
  total: number;
  passed: boolean;
};

type ResultViewProps = {
  reviewResult: ReviewResult;
  unitXp: number;
  totalXp: number;
  onContinue: () => void;
};

export const ResultView: React.FC<ResultViewProps> = ({
  reviewResult,
  unitXp,
  totalXp,
  onContinue,
}) => {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl text-center">
      <h2 className="text-3xl font-extrabold text-ink mb-3">Review Complete</h2>
      <p className="text-lg font-extrabold text-brand-ink mb-1">
        Review Score: {unitXp}/{totalXp}
      </p>
      <p className={`text-sm font-bold mb-6 ${reviewResult.passed ? 'text-brand-ink' : 'text-danger'}`}>
        {reviewResult.passed ? 'Passed' : 'Needs more practice'}
      </p>
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-2xl bg-brand text-white font-extrabold text-lg uppercase tracking-wider duo-button-shadow hover:brightness-110 active:scale-95 transition-all"
      >
        {reviewResult.passed ? 'Continue' : 'Retry Unit'}
      </button>
    </div>
  );
};





import React from 'react';
import {
  VIEW_H2_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_PANEL_CLASS,
  VIEW_PANEL_PAD_CLASS,
  VIEW_STATUS_TEXT_CLASS,
} from './viewShared';

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
    <div className={`${VIEW_PAGE_CLASS} ${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} text-center`}>
      <h2 className={`${VIEW_H2_CLASS} mb-3`}>Review Complete</h2>
      <p className="text-lg font-extrabold text-brand-ink mb-1">
        Review Score: {unitXp}/{totalXp}
      </p>
      <p className={`${VIEW_STATUS_TEXT_CLASS} mb-6 ${reviewResult.passed ? 'text-brand-ink' : 'text-danger'}`}>
        {reviewResult.passed ? 'Passed' : 'Needs more practice'}
      </p>
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-2xl border-2 btn-selected font-extrabold text-lg uppercase tracking-wider active:scale-95 transition-all"
      >
        {reviewResult.passed ? 'Continue' : 'Retry Unit'}
      </button>
    </div>
  );
};


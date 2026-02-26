import React from 'react';
import {
  VIEW_H2_CLASS,
  VIEW_META_TEXT_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_PANEL_CLASS,
  VIEW_PANEL_PAD_CLASS,
  VIEW_STATUS_TEXT_CLASS,
} from './viewShared';

type MatchPair = {
  id: string;
  prompt: string;
  answer: string;
};

type MatchReviewViewProps = {
  currentCourseCode: string;
  currentLevelTitle: string;
  unitXp: number;
  matchPairs: MatchPair[];
  matchAnswerOptions: MatchPair[];
  matchedPairIds: string[];
  selectedPromptId: string | null;
  selectedAnswerId: string | null;
  answerChecked: boolean;
  matchMistakes: number;
  matchPairsPerReview: number;
  isMatchReviewComplete: boolean;
  onSelectPrompt: (id: string) => void;
  onSelectAnswer: (id: string) => void;
};

export const MatchReviewView: React.FC<MatchReviewViewProps> = ({
  currentCourseCode,
  currentLevelTitle,
  unitXp,
  matchPairs,
  matchAnswerOptions,
  matchedPairIds,
  selectedPromptId,
  selectedAnswerId,
  answerChecked,
  matchMistakes,
  matchPairsPerReview,
  isMatchReviewComplete,
  onSelectPrompt,
  onSelectAnswer,
}) => {
  return (
    <div className={`${VIEW_PAGE_CLASS} ${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS}`}>
      <div className="w-full mb-3 flex items-center justify-between gap-2">
        <p className={`${VIEW_META_TEXT_CLASS} text-brand`}>
          Course {currentCourseCode} • {currentLevelTitle}
        </p>
        <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-lg border-2 border-brand-stroke bg-brand-paler text-brand-ink text-xs font-extrabold uppercase tracking-wide">
          XP: {unitXp}
        </span>
      </div>
      <h2 className={`${VIEW_H2_CLASS} mb-1`}>Match each sentence</h2>
      <p className={`${VIEW_META_TEXT_CLASS} text-brand mb-4`}>
        Quick Review • {matchPairsPerReview} Matches
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          {matchPairs.map((pair) => {
            const isMatched = matchedPairIds.includes(pair.id);
            const isSelected = selectedPromptId === pair.id;
            return (
              <button
                key={`prompt-${pair.id}`}
                onClick={() => onSelectPrompt(pair.id)}
                disabled={isMatched || answerChecked}
                className={`w-full text-left px-3 py-3 rounded-xl border-2 text-sm md:text-base font-medium transition-all ${
                  isMatched
                    ? 'border-brand bg-brand-pale-alt text-brand-ink'
                    : isSelected
                      ? 'border-brand bg-brand-paler'
                      : 'border-[var(--border-subtle)] selection-hover'
                }`}
              >
                {pair.prompt}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {matchAnswerOptions.map((pair) => {
            const isMatched = matchedPairIds.includes(pair.id);
            const isSelected = selectedAnswerId === pair.id;
            return (
              <button
                key={`answer-${pair.id}`}
                onClick={() => onSelectAnswer(pair.id)}
                disabled={isMatched || answerChecked}
                className={`w-full text-left px-3 py-3 rounded-xl border-2 text-sm md:text-base font-medium transition-all ${
                  isMatched
                    ? 'border-brand bg-brand-pale-alt text-brand-ink'
                    : isSelected
                      ? 'border-brand bg-brand-paler'
                      : 'border-[var(--border-subtle)] selection-hover'
                }`}
              >
                {pair.answer}
              </button>
            );
          })}
        </div>
      </div>
      <p className={`${VIEW_STATUS_TEXT_CLASS} mt-4`}>
        Matched: {matchedPairIds.length}/{Math.max(matchPairs.length, matchPairsPerReview)}
        {isMatchReviewComplete && (matchMistakes === 0 ? ' • Perfect' : ` • Mistakes: ${matchMistakes}`)}
      </p>
    </div>
  );
};

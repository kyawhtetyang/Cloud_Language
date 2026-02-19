import React from 'react';

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
    <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl">
      <div className="w-full mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#58cc02]">
          Course {currentCourseCode} • {currentLevelTitle}
        </p>
        <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-lg border-2 border-[#9ad56a] bg-[#f7ffef] text-[#2f7d01] text-[11px] font-extrabold uppercase tracking-wide">
          XP: {unitXp}
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-medium text-[#3c3c3c] mb-1">Match each sentence</h2>
      <p className="text-xs font-extrabold uppercase tracking-wide text-[#58cc02] mb-4">
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
                    ? 'border-[#58cc02] bg-[#f0ffe5] text-[#2f7d01]'
                    : isSelected
                      ? 'border-[#58cc02] bg-[#f7ffef]'
                      : 'border-gray-200 hover:bg-gray-50'
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
                    ? 'border-[#58cc02] bg-[#f0ffe5] text-[#2f7d01]'
                    : isSelected
                      ? 'border-[#58cc02] bg-[#f7ffef]'
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {pair.answer}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-gray-500">
        Matched: {matchedPairIds.length}/{Math.max(matchPairs.length, matchPairsPerReview)}
        {isMatchReviewComplete && (matchMistakes === 0 ? ' • Perfect' : ` • Mistakes: ${matchMistakes}`)}
      </p>
    </div>
  );
};



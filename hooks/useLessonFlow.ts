import { useEffect, useState } from 'react';
import { getLessonOrderIndex, getLessonUnitId } from '../config/appConfig';
import { LessonData } from '../types';

type MatchPair = {
  id: string;
  prompt: string;
  answer: string;
};

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function useLessonFlow(matchPairsPerReview: number) {
  const [answerChecked, setAnswerChecked] = useState(false);
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([]);
  const [matchAnswerOptions, setMatchAnswerOptions] = useState<MatchPair[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchMistakes, setMatchMistakes] = useState(0);

  const isMatchReviewComplete = matchPairs.length > 0 && matchedPairIds.length === matchPairs.length;

  const resetQuizState = () => {
    setAnswerChecked(false);
    setMatchPairs([]);
    setMatchAnswerOptions([]);
    setSelectedPromptId(null);
    setSelectedAnswerId(null);
    setMatchedPairIds([]);
    setMatchMistakes(0);
  };

  useEffect(() => {
    if (answerChecked) return;
    if (matchPairs.length > 0 && matchedPairIds.length === matchPairs.length) {
      setAnswerChecked(true);
    }
  }, [answerChecked, matchPairs.length, matchedPairIds.length]);

  const startQuizForLevel = (lessons: LessonData[], start: number, end: number) => {
    const levelLessons: LessonData[] = lessons.slice(start, end + 1);
    resetQuizState();
    const uniquePairs = Array.from(
      new Map(levelLessons.map((lesson) => [`${lesson.english}__${lesson.burmese}`, lesson])).values(),
    );
    const selected = shuffleArray(uniquePairs).slice(0, Math.min(matchPairsPerReview, uniquePairs.length));
    const pairs = selected.map((lesson, idx) => ({
      id: `${idx}-${getLessonOrderIndex(lesson)}-${getLessonUnitId(lesson)}`,
      prompt: lesson.english,
      answer: lesson.burmese,
    }));
    setMatchPairs(pairs);
    setMatchAnswerOptions(shuffleArray(pairs));
  };

  const commitMatchAttempt = (promptId: string, answerId: string) => {
    const isCorrectMatch = promptId === answerId;
    if (isCorrectMatch) {
      setMatchedPairIds((prev) => (prev.includes(promptId) ? prev : [...prev, promptId]));
    } else {
      setMatchMistakes((prev) => prev + 1);
    }
    setSelectedPromptId(null);
    setSelectedAnswerId(null);
  };

  const handleSelectPrompt = (promptId: string) => {
    if (matchedPairIds.includes(promptId) || answerChecked) return;
    if (selectedAnswerId) {
      commitMatchAttempt(promptId, selectedAnswerId);
      return;
    }
    setSelectedPromptId(promptId);
  };

  const handleSelectAnswer = (answerId: string) => {
    if (matchedPairIds.includes(answerId) || answerChecked) return;
    if (selectedPromptId) {
      commitMatchAttempt(selectedPromptId, answerId);
      return;
    }
    setSelectedAnswerId(answerId);
  };

  return {
    answerChecked,
    matchPairs,
    matchAnswerOptions,
    selectedPromptId,
    selectedAnswerId,
    matchedPairIds,
    matchMistakes,
    isMatchReviewComplete,
    setAnswerChecked,
    resetQuizState,
    startQuizForLevel,
    handleSelectPrompt,
    handleSelectAnswer,
  };
}





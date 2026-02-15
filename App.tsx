import React, { useEffect, useState } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { AudioButton } from './components/AudioButton';
import { LessonData, ProgressState } from './types';

const LEARN_QUESTIONS_PER_UNIT = 10;
const REVIEW_QUESTIONS_PER_UNIT = 5;
const PROGRESS_KEY = 'lingo_burmese_progress';
const UNLOCKED_LEVEL_KEY = 'lingo_burmese_unlocked_level';
const STREAK_KEY = 'lingo_burmese_streak';
const LESSONS_PER_BATCH = 3;
const CURRICULUM = [
  {
    level: 1,
    title: 'Foundations',
    stage: 'A1',
    topics: ['Alphabet & sounds', 'Basic greetings', 'Be verb (am/is/are)', 'Simple nouns', 'Yes/No questions'],
  },
  {
    level: 2,
    title: 'Survival Basics',
    stage: 'A1',
    topics: ['Present simple', 'Daily routines', 'Basic adjectives', 'There is/are', 'Simple WH questions'],
  },
  {
    level: 3,
    title: 'Structured Sentences',
    stage: 'A2',
    topics: ['Past simple', 'Future (will / going to)', 'Comparatives', 'Basic modals (can/must)', 'Frequency adverbs'],
  },
  {
    level: 4,
    title: 'Functional English',
    stage: 'A2',
    topics: ['Present continuous', 'Countable/uncountable', 'Requests & offers', 'Directions', 'Basic connectors'],
  },
] as const;

type AppMode = 'learn' | 'quiz' | 'completed';
type SidebarTab = 'profile' | 'levels' | 'lesson';

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getLevelTitle(level: number): string {
  const row = CURRICULUM.find((item) => item.level === level);
  return row?.title || `Unit ${level}`;
}

const App: React.FC = () => {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>('learn');
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('lesson');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<LessonData[]>([]);
  const [quizChoiceSets, setQuizChoiceSets] = useState<string[][]>([]);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [quizSectionStart, setQuizSectionStart] = useState(0);
  const [quizSectionEnd, setQuizSectionEnd] = useState(0);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const totalContentUnits = Math.max(1, lessons.reduce((max, lesson) => Math.max(max, lesson.level || 1), 1));
  const totalLevels = CURRICULUM.length;
  const activeLevelIndex =
    mode === 'quiz' ? quizSectionStart : Math.min(currentIndex, Math.max(lessons.length - 1, 0));
  const fallbackLevel = Math.floor(activeLevelIndex / LEARN_QUESTIONS_PER_UNIT) + 1;
  const currentLevel = lessons[activeLevelIndex]?.level || fallbackLevel;
  const levelIndexes = lessons.reduce<number[]>((acc, lesson, idx) => {
    if (lesson.level === currentLevel) acc.push(idx);
    return acc;
  }, []);
  const sectionStart = levelIndexes.length > 0 ? levelIndexes[0] : Math.max(0, activeLevelIndex);
  const sectionEnd = levelIndexes.length > 0 ? levelIndexes[levelIndexes.length - 1] : Math.max(0, activeLevelIndex);
  const sectionTotal = Math.max(1, sectionEnd - sectionStart + 1);
  const sectionCurrent = mode === 'learn' ? Math.min(activeLevelIndex - sectionStart + 1, sectionTotal) : sectionTotal;

  const currentQuizQuestion = quizQuestions[quizQuestionIndex];
  const currentChoices = quizChoiceSets[quizQuestionIndex] || [];
  const requiredCorrect = Math.max(1, Math.ceil(quizQuestions.length * 0.67));
  const currentBatchEnd = Math.min(currentIndex + LESSONS_PER_BATCH - 1, sectionEnd, Math.max(lessons.length - 1, 0));
  const currentBatchLessons = lessons.slice(currentIndex, currentBatchEnd + 1);
  const progressCurrent =
    mode === 'completed'
      ? lessons.length
      : mode === 'learn'
        ? Math.min(currentIndex + currentBatchLessons.length, lessons.length)
        : Math.min(currentIndex + 1, lessons.length);
  const progressTotal = Math.max(lessons.length, 1);
  const isBatchFinalInLevel = currentIndex + LESSONS_PER_BATCH > sectionEnd || currentIndex === lessons.length - 1;
  const activeEnglishText =
    mode === 'learn' && sidebarTab === 'lesson' && currentBatchLessons.length > 0
      ? currentBatchLessons[0].english
      : mode === 'quiz' && currentQuizQuestion
        ? currentQuizQuestion.english
        : null;

  const resetQuizState = () => {
    setQuizQuestionIndex(0);
    setQuizResults([]);
    setSelectedChoice(null);
    setAnswerChecked(false);
  };

  const playEnglishText = (text: string | null) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/lessons`);
        if (!response.ok) throw new Error(`API responded with ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('No lessons returned from API');

        setLessons(data);

        const saved = localStorage.getItem(PROGRESS_KEY);
        const restoredIndex = saved ? (JSON.parse(saved) as ProgressState).currentIndex : 0;
        const safeIndex = Math.min(Math.max(restoredIndex, 0), data.length - 1);
        setCurrentIndex(safeIndex);

        const savedUnlocked = Number(localStorage.getItem(UNLOCKED_LEVEL_KEY) || 1);
        const inferredUnlocked = data[safeIndex]?.level || 1;
        const safeUnlocked = Math.min(totalLevels, Math.max(savedUnlocked, inferredUnlocked, 1));
        setUnlockedLevel(safeUnlocked);
        setStreak(Math.max(0, Number(localStorage.getItem(STREAK_KEY) || 0)));
      } catch (error) {
        console.error('Error loading lessons:', error);
        setErrorMessage('Could not load lessons from the backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (lessons.length > 0 && mode !== 'quiz') {
      const state: ProgressState = {
        currentIndex,
        completedCount: currentIndex,
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
  }, [currentIndex, lessons.length, mode]);

  useEffect(() => {
    if (lessons.length > 0) {
      localStorage.setItem(UNLOCKED_LEVEL_KEY, String(unlockedLevel));
    }
  }, [lessons.length, unlockedLevel]);

  useEffect(() => {
    if (lessons.length > 0) {
      localStorage.setItem(STREAK_KEY, String(streak));
    }
  }, [lessons.length, streak]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (mode !== 'quiz') return;

      const num = Number(event.key);
      if (!answerChecked && Number.isInteger(num) && num >= 1 && num <= 4) {
        const option = currentChoices[num - 1];
        if (option) {
          event.preventDefault();
          setSelectedChoice(option);
        }
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (!answerChecked && selectedChoice) {
          const isCorrect = selectedChoice === currentQuizQuestion?.burmese;
          setQuizResults((prev) => [...prev, Boolean(isCorrect)]);
          setAnswerChecked(true);
        } else if (answerChecked) {
          handleQuizNext();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [answerChecked, currentChoices, currentQuizQuestion?.burmese, mode, selectedChoice]);

  const startQuizForLevel = (start: number, end: number) => {
    const levelLessons = lessons.slice(start, end + 1);
    const quizPool = shuffleArray(levelLessons).slice(0, Math.min(REVIEW_QUESTIONS_PER_UNIT, levelLessons.length));
    const options = quizPool.map((question) => {
      const distractors = shuffleArray(lessons.filter((lesson) => lesson.burmese !== question.burmese))
        .slice(0, 3)
        .map((lesson) => lesson.burmese);
      return shuffleArray([question.burmese, ...distractors]);
    });

    setQuizSectionStart(start);
    setQuizSectionEnd(end);
    setQuizQuestions(quizPool);
    setQuizChoiceSets(options);
    resetQuizState();
    setMode('quiz');
  };

  const handleNext = () => {
    if (isNextDisabled || mode !== 'learn') return;

    setIsNextDisabled(true);
    setIsAnimating(true);

    setTimeout(() => {
      const nextIndex = currentIndex + LESSONS_PER_BATCH;
      const levelEnded = nextIndex > sectionEnd || currentIndex === lessons.length - 1;

      if (levelEnded) {
        const start = sectionStart;
        const end = sectionEnd;
        startQuizForLevel(start, end);
      } else {
        setCurrentIndex(nextIndex);
      }

      setIsAnimating(false);
    }, 300);

    setTimeout(() => {
      setIsNextDisabled(false);
    }, 300);
  };

  const goToLevel = (level: number) => {
    if (mode === 'quiz') return;
    const safeLevel = Math.min(Math.max(level, 1), totalLevels);
    const target = lessons.findIndex((lesson) => lesson.level === safeLevel);
    if (target < 0) return;
    setMode('learn');
    setCurrentIndex(target);
    setUnlockedLevel((prev) => Math.max(prev, safeLevel));
    setSidebarTab('lesson');
    resetQuizState();
    setIsSidebarOpen(false);
  };

  const goToLevelUnit = (level: number, unitIndex: number) => {
    if (mode === 'quiz') return;
    const safeLevel = Math.min(Math.max(level, 1), totalLevels);
    const safeUnit = Math.max(1, unitIndex + 1);
    const target = lessons.findIndex((lesson) => lesson.level === safeLevel && lesson.unit === safeUnit);
    if (target < 0) return;
    setMode('learn');
    setCurrentIndex(target);
    setUnlockedLevel((prev) => Math.max(prev, safeLevel));
    setSidebarTab('lesson');
    resetQuizState();
    setIsSidebarOpen(false);
  };

  const handleReview = () => {
    setMode('learn');
    setCurrentIndex(0);
    resetQuizState();
    setIsSidebarOpen(false);
  };

  const handleContinue = () => {
    if (mode === 'completed') {
      setMode('learn');
      setCurrentIndex(0);
      resetQuizState();
    }
    setSidebarTab('lesson');
    setIsSidebarOpen(false);
  };

  const handleSkipToLevel2 = () => {
    if (totalContentUnits < 2 || mode === 'quiz') return;
    const level2Start = lessons.findIndex((lesson) => lesson.level === 2);
    if (level2Start < 0) return;
    setUnlockedLevel((prev) => Math.max(prev, 2));
    setMode('learn');
    setCurrentIndex(level2Start);
    resetQuizState();
    setSidebarTab('lesson');
    setIsSidebarOpen(false);
  };

  const handleCheckAnswer = () => {
    if (!currentQuizQuestion || !selectedChoice || answerChecked) return;
    const isCorrect = selectedChoice === currentQuizQuestion.burmese;
    setQuizResults((prev) => [...prev, isCorrect]);
    setAnswerChecked(true);
  };

  const handleQuizNext = () => {
    if (!answerChecked) return;

    if (quizQuestionIndex < quizQuestions.length - 1) {
      setQuizQuestionIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setAnswerChecked(false);
      return;
    }

    const correctCount = quizResults.filter(Boolean).length;
    const isPass = correctCount >= requiredCorrect;

    if (!isPass) {
      setMode('learn');
      setCurrentIndex(quizSectionStart);
      resetQuizState();
      setStreak(0);
      return;
    }

    const passedLevel = lessons[quizSectionStart]?.level || 1;
    const nextUnlocked = Math.min(totalLevels, passedLevel + 1);
    setUnlockedLevel((prev) => Math.max(prev, nextUnlocked));
    setStreak((prev) => prev + 1);

    const nextStart = quizSectionEnd + 1;
    if (nextStart >= lessons.length) {
      setMode('completed');
      setUnlockedLevel(totalLevels);
      return;
    }

    setMode('learn');
    setCurrentIndex(nextStart);
    resetQuizState();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#58cc02] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMessage || lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-[#3c3c3c] mb-2">Lessons unavailable</h2>
          <p className="text-gray-500">{errorMessage || 'No lessons available right now.'}</p>
          <p className="text-sm text-gray-400 mt-3">Check backend API at {apiBaseUrl}/api/health</p>
        </div>
      </div>
    );
  }

  const isCorrectAnswer =
    answerChecked && selectedChoice !== null && currentQuizQuestion
      ? selectedChoice === currentQuizQuestion.burmese
      : false;
  const isLevelsView = sidebarTab === 'levels';
  const isProfileView = sidebarTab === 'profile';
  const isLessonView = sidebarTab === 'lesson';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f1ffe2_0%,#eef8ff_55%,#f5f7fa_100%)] md:flex">
      {isSidebarOpen && mode !== 'quiz' && (
        <button
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {mode !== 'quiz' && (
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r-2 border-[#dbe8cb] p-5 z-40 transform transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#3c3c3c] uppercase tracking-wide">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#58cc02] shadow-[0_2px_0_0_#46a302]">
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <circle cx="8" cy="11" r="4" fill="white" />
                <circle cx="16" cy="11" r="4" fill="white" />
                <circle cx="8" cy="11" r="1.2" fill="#3c3c3c" />
                <circle cx="16" cy="11" r="1.2" fill="#3c3c3c" />
                <path d="M10.2 15h3.6l-1.8 2.2z" fill="#f59e0b" />
                <path d="M6.4 7.8l1.8-2 1.4 2z" fill="white" />
                <path d="M14.4 7.8l1.4-2 1.8 2z" fill="white" />
              </svg>
            </span>
            Duolingo
          </h2>
          <button
            className="md:hidden text-gray-500 font-bold text-xl"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <button
            onClick={() => setSidebarTab('profile')}
            disabled={mode === 'quiz'}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'profile'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : mode === 'quiz'
                  ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setSidebarTab('levels')}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'levels'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Units
          </button>
          <button
            onClick={() => setSidebarTab('lesson')}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'lesson'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Lesson
          </button>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleContinue}
            className="w-full px-3 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110 transition-all"
          >
            Continue
          </button>
        </div>
        </div>
      </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen pb-36 md:pb-0">
        <div className="md:hidden px-4 pt-4 grid grid-cols-3 items-center gap-2">
          <div className="justify-self-start">
            {mode !== 'quiz' ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-extrabold uppercase tracking-wide text-gray-600"
              >
                Menu
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-gray-200 text-gray-500 text-xs font-extrabold uppercase tracking-wide">
                Focus Quiz
              </div>
            )}
          </div>
          <div className="justify-self-center">
            {isLessonView ? (
              <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-gray-200 text-gray-600 text-xs font-extrabold uppercase tracking-wide">
                {sectionCurrent}/{sectionTotal}
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div className="justify-self-end px-3 py-1.5 rounded-xl bg-white border-2 border-[#9ad56a] text-[#2f7d01] text-xs font-extrabold uppercase tracking-wide">
            {isProfileView ? 'Profile' : isLevelsView ? 'Units' : `Unit ${currentLevel}`}
          </div>
        </div>
        {isLessonView && (
        <ProgressBar
          current={progressCurrent}
          total={progressTotal}
          sectionCurrent={sectionCurrent}
          sectionTotal={sectionTotal}
        />
        )}

        <main
          className={`flex-1 flex justify-center p-4 md:p-6 ${
            isLessonView ? 'items-start pt-3 md:items-center md:pt-6' : 'items-center'
          }`}
        >
          {isProfileView ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-8 md:p-10 w-full max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#58cc02] text-white flex items-center justify-center text-2xl font-extrabold">U</div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#3c3c3c]">User Profile</h2>
                  <p className="text-sm text-gray-500 font-bold">Mobile Learner</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border-2 border-[#c5eb9f] bg-[#f7ffef] p-4">
                  <p className="text-xs text-[#2f7d01] font-extrabold uppercase">Current Unit</p>
                  <p className="text-3xl font-extrabold text-[#3c3c3c]">{currentLevel}</p>
                </div>
                <div className="rounded-2xl border-2 border-[#c5eb9f] bg-[#f7ffef] p-4">
                  <p className="text-xs text-[#2f7d01] font-extrabold uppercase">Unlocked Units</p>
                  <p className="text-3xl font-extrabold text-[#3c3c3c]">{unlockedLevel}/{totalLevels}</p>
                </div>
                <div className="rounded-2xl border-2 border-[#ffd7d7] bg-[#fff4f4] p-4">
                  <p className="text-xs text-[#ef4444] font-extrabold uppercase">Review Size</p>
                  <p className="text-3xl font-extrabold text-[#3c3c3c]">{REVIEW_QUESTIONS_PER_UNIT}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarTab('lesson')}
                className="w-full mt-6 py-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-lg uppercase tracking-wider duo-button-shadow hover:brightness-110 active:scale-95 transition-all"
              >
                Go To Lesson
              </button>
              {totalContentUnits >= 2 && (
                <button
                  onClick={handleSkipToLevel2}
                  className="w-full mt-3 py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 font-extrabold text-sm uppercase tracking-wider duo-secondary-shadow hover:bg-gray-50 transition-all active:scale-95"
                >
                  Skip Unit 1 (Experienced)
                </button>
              )}
            </div>
          ) : isLevelsView ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-6 md:p-8 w-full max-w-2xl">
              <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-4">Levels</h2>

              <div className="mb-5">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#2f7d01] mb-2">Beginner (A1)</p>
                <div className="space-y-2">
                  {CURRICULUM.filter((item) => item.stage === 'A1').map((item) => (
                    <div
                      key={item.level}
                      className="w-full text-left rounded-xl border-2 border-[#c5eb9f] bg-[#f7ffef] px-3 py-2.5"
                    >
                      <div className="w-full flex items-start justify-between gap-3">
                        <p className="text-base font-extrabold text-[#3c3c3c]">
                          Level {item.level} - {item.title}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        {item.topics.map((topic, topicIdx) => {
                          const isTopicAvailable = lessons.some(
                            (lesson) => lesson.level === item.level && lesson.unit === topicIdx + 1,
                          );
                          return (
                          <button
                            key={topic}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              goToLevelUnit(item.level, topicIdx);
                            }}
                            disabled={!isTopicAvailable || mode === 'quiz'}
                            className="w-full text-left rounded-lg border border-[#dbe8cb] bg-white/80 px-2 py-1.5 text-xs font-bold text-gray-700 hover:bg-white hover:border-[#9ad56a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Unit {topicIdx + 1} - {topic}
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#a16207] mb-2">Pre-Intermediate (A2)</p>
                <div className="space-y-2">
                  {CURRICULUM.filter((item) => item.stage === 'A2').map((item) => (
                    <div
                      key={item.level}
                      className="w-full text-left rounded-xl border-2 border-[#facc15] bg-[#fff9e8] px-3 py-2.5"
                    >
                      <div className="w-full flex items-start justify-between gap-3">
                        <p className="text-base font-extrabold text-[#3c3c3c]">
                          Level {item.level} - {item.title}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        {item.topics.map((topic, topicIdx) => {
                          const isTopicAvailable = lessons.some(
                            (lesson) => lesson.level === item.level && lesson.unit === topicIdx + 1,
                          );
                          return (
                          <button
                            key={topic}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              goToLevelUnit(item.level, topicIdx);
                            }}
                            disabled={!isTopicAvailable || mode === 'quiz'}
                            className="w-full text-left rounded-lg border border-[#f5d564] bg-white/85 px-2 py-1.5 text-xs font-bold text-gray-700 hover:bg-white hover:border-[#eab308] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Unit {topicIdx + 1} - {topic}
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : mode === 'quiz' && currentQuizQuestion ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-8 w-full max-w-md">
              <h2 className="text-3xl font-extrabold text-[#3c3c3c] mb-6">{currentQuizQuestion.english}</h2>
              <div className="space-y-3">
                {currentChoices.map((choice) => {
                  const selected = selectedChoice === choice;
                  const isCorrectChoice = answerChecked && choice === currentQuizQuestion.burmese;
                  const isWrongChoice = answerChecked && selected && !isCorrectChoice;
                  return (
                    <button
                      key={choice}
                      onClick={() => !answerChecked && setSelectedChoice(choice)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 font-extrabold transition-all ${
                        isCorrectChoice
                          ? 'border-[#58cc02] bg-[#f0ffe5] text-[#2f7d01]'
                          : isWrongChoice
                            ? 'border-[#ef4444] bg-[#fff1f1] text-[#b91c1c]'
                            : selected
                              ? 'border-[#58cc02] bg-[#f7ffef]'
                              : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      disabled={answerChecked}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              {answerChecked && (
                <p className={`mt-4 text-sm font-bold ${isCorrectAnswer ? 'text-[#2f7d01]' : 'text-[#b91c1c]'}`}>
                  {isCorrectAnswer ? 'Correct answer.' : `Wrong answer. Correct: ${currentQuizQuestion.burmese}`}
                </p>
              )}
            </div>
          ) : mode === 'completed' ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-10 w-full max-w-md text-center">
              <h2 className="text-3xl font-extrabold text-[#3c3c3c] mb-3">All Units Passed</h2>
              <p className="text-gray-500 mb-6">You completed all sections and passed the random checks.</p>
              <button
                onClick={handleReview}
                className="w-full py-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-lg uppercase tracking-wider duo-button-shadow hover:brightness-110 active:scale-95 transition-all"
              >
                Restart Unit 1
              </button>
            </div>
          ) : (
            <div
              className={`bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl flex flex-col items-center transition-all duration-300 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#58cc02] mb-2">
                Unit {currentLevel}: {getLevelTitle(currentLevel)}
              </p>
              <div className="w-full space-y-2">
                {currentBatchLessons.map((lesson, idx) => (
                  <div key={`${lesson.english}-${currentIndex + idx}`}>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-2.5 py-2">
                      <AudioButton text={lesson.english} compact />
                      <div className="text-left leading-tight">
                        <p className="text-base md:text-lg font-extrabold text-[#3c3c3c]">{lesson.english}</p>
                        <p className="text-base md:text-lg font-bold text-[#58cc02]">{lesson.burmese}</p>
                        <p className="text-sm md:text-base text-[#777] font-semibold">{lesson.pronunciation}</p>
                      </div>
                    </div>
                    {idx < currentBatchLessons.length - 1 && <div className="h-1"></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {isLessonView && (
        <footer className="fixed bottom-16 left-0 right-0 p-3 md:p-6 bg-white/95 backdrop-blur border-t border-gray-100 md:static md:border-none md:bg-transparent">
          <div className="max-w-md mx-auto flex flex-col gap-2.5 md:gap-3">
            {mode === 'learn' && (
              <>
                <button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`w-full py-3 md:py-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-base md:text-lg uppercase tracking-wide md:tracking-wider duo-button-shadow transition-all ${
                    isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'
                  }`}
                >
                  {isBatchFinalInLevel ? 'Take Unit Review' : 'Next'}
                </button>
                <button
                  onClick={handleReview}
                  className="w-full py-2.5 md:py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-500 font-extrabold text-xs md:text-sm uppercase tracking-wide md:tracking-wider hover:bg-gray-50 duo-secondary-shadow transition-all active:scale-95"
                >
                  Review Unit 1
                </button>
              </>
            )}
            {mode === 'quiz' && (
              <button
                onClick={answerChecked ? handleQuizNext : handleCheckAnswer}
                disabled={!answerChecked && selectedChoice === null}
                className={`w-full py-3 md:py-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-base md:text-lg uppercase tracking-wide md:tracking-wider duo-button-shadow transition-all ${
                  !answerChecked && selectedChoice === null
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:brightness-110 active:scale-95'
                }`}
              >
                {answerChecked
                  ? quizQuestionIndex < quizQuestions.length - 1
                    ? 'Next Question'
                    : 'Submit Unit Review'
                  : 'Check Answer'}
              </button>
            )}
          </div>
        </footer>
        )}

        {mode !== 'quiz' && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-gray-100">
            <div className="grid grid-cols-3 gap-1 p-2">
              <button
                onClick={() => {
                  setSidebarTab('profile');
                  setIsSidebarOpen(false);
                }}
                className={`py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all ${
                  isProfileView
                    ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
                    : 'bg-white text-gray-500 border-2 border-gray-200'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setSidebarTab('levels');
                  setIsSidebarOpen(false);
                }}
                className={`py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all ${
                  isLevelsView
                    ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
                    : 'bg-white text-gray-500 border-2 border-gray-200'
                }`}
              >
                Units
              </button>
              <button
                onClick={() => {
                  setSidebarTab('lesson');
                  setIsSidebarOpen(false);
                }}
                className={`py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all ${
                  isLessonView
                    ? 'bg-[#58cc02] text-white border-2 border-[#46a302] duo-button-shadow'
                    : 'bg-white text-gray-500 border-2 border-gray-200'
                }`}
              >
                Lesson
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;

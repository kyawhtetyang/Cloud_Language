import React, { useEffect, useState } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { AudioButton } from './components/AudioButton';
import { LessonData, ProgressState } from './types';

const LEARN_QUESTIONS_PER_UNIT = 10;
const QUICK_REVIEW_CHECKPOINTS = [2, 4, 6, 8, 10];
const QUICK_REVIEW_COUNT = QUICK_REVIEW_CHECKPOINTS.length;
const TOTAL_XP_PER_COURSE = QUICK_REVIEW_COUNT;
const PASS_SCORE = 4;
const PROFILE_NAME_KEY = 'lingo_burmese_profile_name';
const PROGRESS_KEY = 'lingo_burmese_progress';
const UNLOCKED_LEVEL_KEY = 'lingo_burmese_unlocked_level';
const STREAK_KEY = 'lingo_burmese_streak';
const PRONUNCIATION_ENABLED_KEY = 'lingo_burmese_pronunciation_enabled';
const LEARN_LANGUAGE_KEY = 'lingo_burmese_learn_language';
const DEFAULT_LANGUAGE_KEY = 'lingo_burmese_default_language';
const RELOAD_TO_LESSON_KEY = 'lingo_burmese_reload_to_lesson';
const LESSONS_PER_BATCH = 3;
const MATCH_PAIRS_PER_REVIEW = 3;
const CURRICULUM = [
  {
    level: 1,
    title: 'Sound & Survival Speech',
    stage: 'A1',
    topics: [
      'Alphabet sounds & basic pronunciation',
      'Greeting and introducing yourself',
      'Saying name, country, job',
      'Yes/No short answers',
      'Classroom survival phrases',
    ],
  },
  {
    level: 2,
    title: 'Basic Daily Speech',
    stage: 'A1',
    topics: [
      'Talking about daily routine',
      'Describing people & objects',
      'Asking simple questions',
      'Talking about time & dates',
      'Giving simple directions',
    ],
  },
  {
    level: 3,
    title: 'Guided Conversation',
    stage: 'A1',
    topics: [
      'Talking about likes & preferences',
      'Talking about family & friends',
      'Talking about past weekend',
      'Talking about future plans',
      'Role-play conversations',
    ],
  },
  {
    level: 4,
    title: 'Narrating Events',
    stage: 'A2',
    topics: [
      'Telling past stories',
      'Describing experiences',
      'Sequencing events clearly',
      'Comparing things',
      'Giving short explanations',
    ],
  },
  {
    level: 5,
    title: 'Functional Interaction',
    stage: 'A2',
    topics: [
      'Making requests politely',
      'Giving advice',
      'Making suggestions',
      'Handling simple problems',
      'Expressing agreement/disagreement',
    ],
  },
  {
    level: 6,
    title: 'Structured Responses',
    stage: 'A2',
    topics: [
      'Giving opinions with reasons',
      'Explaining cause & effect',
      'Describing advantages & disadvantages',
      'Reacting naturally in conversation',
      'Extending answers confidently',
    ],
  },
  {
    level: 7,
    title: 'Expanding Fluency',
    stage: 'B1',
    topics: [
      'Talking about achievements',
      'Describing processes',
      'Hypothetical situations (if...)',
      'Explaining decisions',
      'Storytelling techniques',
    ],
  },
  {
    level: 8,
    title: 'Discussion Skills',
    stage: 'B1',
    topics: [
      'Expressing strong opinions',
      'Supporting arguments',
      'Comparing viewpoints',
      'Participating in discussions',
      'Managing turn-taking',
    ],
  },
  {
    level: 9,
    title: 'Persuasive Speaking',
    stage: 'B1',
    topics: [
      'Presenting arguments',
      'Convincing others',
      'Handling objections',
      'Structured mini-presentations',
      'Debate practice',
    ],
  },
  {
    level: 10,
    title: 'Advanced Fluency',
    stage: 'B2',
    topics: [
      'Hypothetical & abstract topics',
      'Nuanced comparisons',
      'Clarifying complex ideas',
      'Paraphrasing smoothly',
      'Emphasis & rhetorical devices',
    ],
  },
  {
    level: 11,
    title: 'Analytical Discussion',
    stage: 'B2',
    topics: [
      'Analyzing social issues',
      'Evaluating arguments',
      'Diplomatic disagreement',
      'Problem-solution discussions',
      'Critical thinking in speech',
    ],
  },
  {
    level: 12,
    title: 'Professional Speaking Mastery',
    stage: 'B2',
    topics: [
      'Leading meetings',
      'Formal presentations',
      'Negotiation techniques',
      'Handling Q&A sessions',
      'Executive-level communication',
    ],
  },
] as const;

const STAGE_ORDER = ['A1', 'A2', 'B1', 'B2'] as const;
const STAGE_META = {
  A1: {
    label: 'Beginner (A1)',
    levelCardClass: 'border-[#c5eb9f] bg-[#f7ffef]',
    topicCardClass: 'border-[#dbe8cb] bg-white/85 hover:border-[#9ad56a]',
    badgeClass: 'bg-[#e9f7dc] text-[#2f7d01]',
    titleClass: 'text-[#2f7d01]',
  },
  A2: {
    label: 'Pre-Intermediate (A2)',
    levelCardClass: 'border-[#facc15] bg-[#fff9e8]',
    topicCardClass: 'border-[#f5d564] bg-white/90 hover:border-[#eab308]',
    badgeClass: 'bg-[#fff1c4] text-[#a16207]',
    titleClass: 'text-[#a16207]',
  },
  B1: {
    label: 'Intermediate (B1)',
    levelCardClass: 'border-[#93c5fd] bg-[#eff6ff]',
    topicCardClass: 'border-[#bfdbfe] bg-white/90 hover:border-[#60a5fa]',
    badgeClass: 'bg-[#dbeafe] text-[#1d4ed8]',
    titleClass: 'text-[#1d4ed8]',
  },
  B2: {
    label: 'Upper-Intermediate (B2)',
    levelCardClass: 'border-[#fbcfe8] bg-[#fff1f9]',
    topicCardClass: 'border-[#f9a8d4] bg-white/90 hover:border-[#ec4899]',
    badgeClass: 'bg-[#fce7f3] text-[#be185d]',
    titleClass: 'text-[#be185d]',
  },
} as const;

type AppMode = 'learn' | 'quiz' | 'result' | 'completed';
type SidebarTab = 'profile' | 'levels' | 'lesson' | 'settings';
type LearnLanguage = 'english' | 'chinese';
type DefaultLanguage = 'burmese' | 'english';
type MatchPair = {
  id: string;
  prompt: string;
  answer: string;
};
type ReviewResult = {
  correct: number;
  total: number;
  passed: boolean;
};

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

function toProfileStorageId(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'user'
  );
}

const App: React.FC = () => {
  const [profileName, setProfileName] = useState<string>(() => {
    try {
      return localStorage.getItem(PROFILE_NAME_KEY)?.trim() || '';
    } catch {
      return '';
    }
  });
  const [profileInput, setProfileInput] = useState(profileName);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [englishReferenceLessons, setEnglishReferenceLessons] = useState<LessonData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>('learn');
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>(() => {
    try {
      if (sessionStorage.getItem(RELOAD_TO_LESSON_KEY) === 'true') {
        sessionStorage.removeItem(RELOAD_TO_LESSON_KEY);
        return 'lesson';
      }
    } catch {
      // Ignore sessionStorage failures and use default.
    }
    return 'profile';
  });
  const [isPronunciationEnabled, setIsPronunciationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PRONUNCIATION_ENABLED_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [learnLanguage, setLearnLanguage] = useState<LearnLanguage>(() => {
    try {
      return localStorage.getItem(LEARN_LANGUAGE_KEY) === 'chinese' ? 'chinese' : 'english';
    } catch {
      return 'english';
    }
  });
  const [defaultLanguage, setDefaultLanguage] = useState<DefaultLanguage>(() => {
    try {
      const value = localStorage.getItem(DEFAULT_LANGUAGE_KEY);
      return value === 'english' ? 'english' : 'burmese';
    } catch {
      return 'burmese';
    }
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [learnStep, setLearnStep] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [unitXp, setUnitXp] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [quizSectionStart, setQuizSectionStart] = useState(0);
  const [quizSectionEnd, setQuizSectionEnd] = useState(0);
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([]);
  const [matchAnswerOptions, setMatchAnswerOptions] = useState<MatchPair[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchMistakes, setMatchMistakes] = useState(0);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const profileStorageId = profileName ? toProfileStorageId(profileName) : '';
  const progressStorageKey = profileStorageId ? `${PROGRESS_KEY}:${profileStorageId}` : PROGRESS_KEY;
  const unlockedStorageKey = profileStorageId ? `${UNLOCKED_LEVEL_KEY}:${profileStorageId}` : UNLOCKED_LEVEL_KEY;
  const streakStorageKey = profileStorageId ? `${STREAK_KEY}:${profileStorageId}` : STREAK_KEY;

  const totalLevels = CURRICULUM.length;
  const activeLevelIndex =
    mode === 'quiz' || mode === 'result'
      ? quizSectionStart
      : Math.min(currentIndex, Math.max(lessons.length - 1, 0));
  const fallbackLevel = Math.floor(activeLevelIndex / LEARN_QUESTIONS_PER_UNIT) + 1;
  const currentLevel = lessons[activeLevelIndex]?.level || fallbackLevel;
  const currentUnit = lessons[activeLevelIndex]?.unit || 1;
  const currentCourseCode = `${currentLevel}.${currentUnit}`;
  const levelIndexes = lessons.reduce<number[]>((acc, lesson, idx) => {
    if (lesson.level === currentLevel && lesson.unit === currentUnit) acc.push(idx);
    return acc;
  }, []);
  const sectionStart = levelIndexes.length > 0 ? levelIndexes[0] : Math.max(0, activeLevelIndex);
  const sectionEnd = levelIndexes.length > 0 ? levelIndexes[levelIndexes.length - 1] : Math.max(0, activeLevelIndex);
  const sectionTotal = Math.max(1, sectionEnd - sectionStart + 1);
  const isMatchReview = mode === 'quiz';
  const isMatchReviewComplete =
    isMatchReview && matchPairs.length > 0 && matchedPairIds.length === matchPairs.length;
  const unitFlowTotal = LEARN_QUESTIONS_PER_UNIT;
  const batchStartOffset =
    mode === 'learn' ? ((learnStep * LESSONS_PER_BATCH) % Math.max(sectionTotal, 1)) : 0;
  const currentBatchEntries =
    mode === 'learn'
      ? Array.from({ length: LESSONS_PER_BATCH }, (_, idx) => {
          const offset = (batchStartOffset + idx) % Math.max(sectionTotal, 1);
          const lessonIndex = sectionStart + offset;
          const lesson = lessons[lessonIndex];
          return lesson ? { lesson, lessonIndex } : null;
        }).filter((entry): entry is { lesson: LessonData; lessonIndex: number } => Boolean(entry))
      : [];
  const currentBatchLessons = currentBatchEntries.map((entry) => entry.lesson);
  const unitFlowCurrent =
    Math.min(learnStep, LEARN_QUESTIONS_PER_UNIT);
  const trimmedProfileInput = profileInput.trim();
  const hasProfileWhitespace = /\s/.test(trimmedProfileInput);
  const isProfileInputValid = trimmedProfileInput.length > 0 && !hasProfileWhitespace;

  const resetQuizState = () => {
    setAnswerChecked(false);
    setMatchPairs([]);
    setMatchAnswerOptions([]);
    setSelectedPromptId(null);
    setSelectedAnswerId(null);
    setMatchedPairIds([]);
    setMatchMistakes(0);
  };

  const applyProfileName = () => {
    const nextName = trimmedProfileInput;
    if (!nextName) return;
    if (/\s/.test(nextName)) {
      setProfileError('Username cannot contain spaces.');
      return;
    }
    setProfileError(null);
    localStorage.setItem(PROFILE_NAME_KEY, nextName);
    setProfileName(nextName);
    setMode('learn');
    resetQuizState();
    setUnitXp(0);
    setReviewResult(null);
    setSidebarTab('lesson');
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [response, englishResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/lessons?language=${learnLanguage}`),
          fetch(`${apiBaseUrl}/api/lessons?language=english`),
        ]);
        if (!response.ok) throw new Error(`API responded with ${response.status}`);
        if (!englishResponse.ok) throw new Error(`API responded with ${englishResponse.status}`);

        const data = (await response.json()) as LessonData[];
        const englishData = (await englishResponse.json()) as LessonData[];
        if (!Array.isArray(data) || data.length === 0) throw new Error('No lessons returned from API');
        if (!Array.isArray(englishData) || englishData.length === 0) throw new Error('No english lessons returned from API');

        setLessons(data);
        setEnglishReferenceLessons(englishData);
      } catch (error) {
        console.error('Error loading lessons:', error);
        setErrorMessage('Could not load lessons from the backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl, learnLanguage]);

  useEffect(() => {
    if (lessons.length === 0 || !profileName) return;

    const saved = localStorage.getItem(progressStorageKey) || localStorage.getItem(PROGRESS_KEY);
    const restoredIndex = saved ? (JSON.parse(saved) as ProgressState).currentIndex : 0;
    const safeIndex = Math.min(Math.max(restoredIndex, 0), lessons.length - 1);
    setCurrentIndex(safeIndex);

    const savedUnlocked = Number(localStorage.getItem(unlockedStorageKey) || localStorage.getItem(UNLOCKED_LEVEL_KEY) || 1);
    const inferredUnlocked = lessons[safeIndex]?.level || 1;
    const safeUnlocked = Math.min(totalLevels, Math.max(savedUnlocked, inferredUnlocked, 1));
    setUnlockedLevel(safeUnlocked);
    setStreak(Math.max(0, Number(localStorage.getItem(streakStorageKey) || localStorage.getItem(STREAK_KEY) || 0)));
  }, [lessons, profileName, progressStorageKey, streakStorageKey, totalLevels, unlockedStorageKey]);

  useEffect(() => {
    if (profileName) {
      setProfileInput(profileName);
    }
  }, [profileName]);

  useEffect(() => {
    if (lessons.length > 0 && mode !== 'quiz' && profileName) {
      const state: ProgressState = {
        currentIndex,
        completedCount: currentIndex,
      };
      localStorage.setItem(progressStorageKey, JSON.stringify(state));
    }
  }, [currentIndex, lessons.length, mode, profileName, progressStorageKey]);

  useEffect(() => {
    if (lessons.length > 0 && profileName) {
      localStorage.setItem(unlockedStorageKey, String(unlockedLevel));
    }
  }, [lessons.length, profileName, unlockedLevel, unlockedStorageKey]);

  useEffect(() => {
    if (lessons.length > 0 && profileName) {
      localStorage.setItem(streakStorageKey, String(streak));
    }
  }, [lessons.length, profileName, streak, streakStorageKey]);

  useEffect(() => {
    localStorage.setItem(LEARN_LANGUAGE_KEY, learnLanguage);
  }, [learnLanguage]);

  useEffect(() => {
    localStorage.setItem(PRONUNCIATION_ENABLED_KEY, String(isPronunciationEnabled));
  }, [isPronunciationEnabled]);

  useEffect(() => {
    localStorage.setItem(DEFAULT_LANGUAGE_KEY, defaultLanguage);
  }, [defaultLanguage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sidebarTab]);

  useEffect(() => {
    if (!isMatchReview || answerChecked) return;
    if (matchPairs.length > 0 && matchedPairIds.length === matchPairs.length) {
      setAnswerChecked(true);
    }
  }, [answerChecked, isMatchReview, matchPairs.length, matchedPairIds.length]);

  const startQuizForLevel = (start: number, end: number) => {
    const levelLessons: LessonData[] = lessons.slice(start, end + 1);

    setQuizSectionStart(start);
    setQuizSectionEnd(end);
    resetQuizState();
    const uniquePairs = Array.from(
      new Map(levelLessons.map((lesson) => [`${lesson.english}__${lesson.burmese}`, lesson])).values(),
    );
    const selected = shuffleArray(uniquePairs).slice(0, Math.min(MATCH_PAIRS_PER_REVIEW, uniquePairs.length));
    const pairs = selected.map((lesson, idx) => ({
      id: `${idx}-${lesson.level}-${lesson.unit}`,
      prompt: lesson.english,
      answer: lesson.burmese,
    }));
    setMatchPairs(pairs);
    setMatchAnswerOptions(shuffleArray(pairs));
    setMode('quiz');
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
    if (!isMatchReview || matchedPairIds.includes(promptId)) return;
    if (answerChecked) return;
    if (selectedAnswerId) {
      commitMatchAttempt(promptId, selectedAnswerId);
      return;
    }
    setSelectedPromptId(promptId);
  };

  const handleSelectAnswer = (answerId: string) => {
    if (!isMatchReview || matchedPairIds.includes(answerId)) return;
    if (answerChecked) return;
    if (selectedPromptId) {
      commitMatchAttempt(selectedPromptId, answerId);
      return;
    }
    setSelectedAnswerId(answerId);
  };

  const handleNext = () => {
    if (isNextDisabled || mode !== 'learn') return;

    setIsNextDisabled(true);
    const nextStep = learnStep + 1;
    setLearnStep(nextStep);

    const needsCheckpoint = QUICK_REVIEW_CHECKPOINTS.includes(nextStep);
    if (needsCheckpoint) {
      startQuizForLevel(sectionStart, sectionEnd);
    } else {
      const nextOffset = (nextStep * LESSONS_PER_BATCH) % Math.max(sectionTotal, 1);
      setCurrentIndex(sectionStart + nextOffset);
    }

    setIsNextDisabled(false);
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
    setLearnStep(0);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
    setIsSidebarOpen(false);
  };

  const handleReview = () => {
    setMode('learn');
    setCurrentIndex(0);
    setLearnStep(0);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
    setIsSidebarOpen(false);
  };

  const handleSidebarReview = () => {
    const target = lessons.findIndex(
      (lesson) => lesson.level === currentLevel && lesson.unit === currentUnit,
    );
    setMode('learn');
    setCurrentIndex(target >= 0 ? target : 0);
    setLearnStep(0);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
    setSidebarTab('lesson');
    setIsSidebarOpen(false);
  };

  const handleResultContinue = () => {
    if (!reviewResult) return;

    if (!reviewResult.passed) {
      setMode('learn');
      setCurrentIndex(quizSectionStart);
      setLearnStep(0);
      setUnitXp(0);
      setReviewResult(null);
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
      setReviewResult(null);
      resetQuizState();
      return;
    }

    setMode('learn');
    setCurrentIndex(nextStart);
    setLearnStep(0);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
  };

  const handleQuizNext = () => {
    if (!answerChecked) return;

    const isPass = matchMistakes === 0 && matchedPairIds.length === matchPairs.length;
    const gainedXp = isPass ? 1 : 0;
    const nextXp = Math.min(unitXp + gainedXp, TOTAL_XP_PER_COURSE);
    if (isPass) {
      setUnitXp(nextXp);
    }

    if (learnStep >= LEARN_QUESTIONS_PER_UNIT) {
      const passedByScore = nextXp >= PASS_SCORE;
      if (!passedByScore) {
        setStreak(0);
      }
      setReviewResult({
        correct: nextXp,
        total: TOTAL_XP_PER_COURSE,
        passed: passedByScore,
      });
      setMode('result');
      resetQuizState();
      return;
    }

    setMode('learn');
    resetQuizState();
    if (isPass && learnStep < LEARN_QUESTIONS_PER_UNIT) {
      const nextOffset = (learnStep * LESSONS_PER_BATCH) % Math.max(sectionTotal, 1);
      setCurrentIndex(sectionStart + nextOffset);
    } else {
      setStreak(0);
    }
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

  if (!profileName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,#f1ffe2_0%,#eef8ff_55%,#f5f7fa_100%)]">
        <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-7 w-full max-w-md">
          <h1 className="text-2xl font-extrabold text-[#3c3c3c] mb-2">Welcome</h1>
          <p className="text-sm text-gray-500 mb-5">Enter your name to create a local profile.</p>
          <input
            value={profileInput}
            onChange={(event) => {
              setProfileInput(event.target.value);
              if (profileError) setProfileError(null);
            }}
            onKeyDown={(event) => event.key === 'Enter' && applyProfileName()}
            placeholder="Username (no spaces)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58cc02] outline-none font-semibold text-[#3c3c3c]"
          />
          {(profileError || hasProfileWhitespace) && (
            <p className="mt-2 text-xs font-bold text-[#b91c1c]">Username cannot contain spaces.</p>
          )}
          <button
            onClick={applyProfileName}
            disabled={!isProfileInputValid}
            className={`w-full mt-4 py-3 rounded-xl font-extrabold uppercase tracking-wide transition-all ${
              isProfileInputValid
                ? 'bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const translationLabel = defaultLanguage === 'burmese' ? 'Burmese (Current)' : 'English';
  const pronunciationStyleLabel =
    defaultLanguage === 'burmese' ? 'Burmese style (Current)' : 'English style (Pinyin for Chinese)';
  const unitsPerLevel = CURRICULUM.find((item) => item.level === currentLevel)?.topics.length || 5;
  const currentUnitProgress = Math.min(learnStep, LEARN_QUESTIONS_PER_UNIT) / LEARN_QUESTIONS_PER_UNIT;
  const levelProgressUnitsRaw = Math.min(unitsPerLevel, Math.max(0, currentUnit - 1 + currentUnitProgress));
  const levelProgressPercent = Math.round((levelProgressUnitsRaw / Math.max(unitsPerLevel, 1)) * 100);
  const levelProgressLabel = `${levelProgressUnitsRaw.toFixed(1)}/${unitsPerLevel}`;
  const isLevelsView = sidebarTab === 'levels';
  const isProfileView = sidebarTab === 'profile';
  const isLessonView = sidebarTab === 'lesson';
  const isSettingsView = sidebarTab === 'settings';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f1ffe2_0%,#eef8ff_55%,#f5f7fa_100%)] md:flex">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r-2 border-[#dbe8cb] p-5 z-40 transform transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem(RELOAD_TO_LESSON_KEY, 'true');
              } catch {
                // Ignore sessionStorage failures and proceed.
              }
              window.location.reload();
            }}
            className="flex items-center gap-2 text-lg font-extrabold text-[#3c3c3c] uppercase tracking-wide hover:opacity-80 transition-opacity"
            aria-label="Reload page"
          >
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
          </button>
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
            onClick={() => {
              setSidebarTab('lesson');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'lesson'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Lesson
          </button>
          <button
            onClick={() => {
              setSidebarTab('levels');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'levels'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Units
          </button>
          <button
            onClick={() => {
              setSidebarTab('settings');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'settings'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => {
              setSidebarTab('profile');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide border-2 transition-all ${
              sidebarTab === 'profile'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow hover:brightness-110'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
        </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen pb-36 md:pb-0">
        {isLessonView && (
          <ProgressBar unitCurrent={unitFlowCurrent} unitTotal={unitFlowTotal} />
        )}

        <main
          className={`flex-1 flex justify-center p-4 md:p-6 ${
            isLessonView ? 'items-start pt-1 md:items-center md:pt-6' : 'items-start pt-6 md:pt-8'
          }`}
        >
          {isProfileView ? (
            <div className="w-full max-w-2xl space-y-4">
              <section className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-5 md:p-7">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#58cc02] border-2 border-[#46a302] text-white flex items-center justify-center text-2xl font-extrabold">
                    U
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-[#3c3c3c]">Welcome back</h2>
                    <p className="text-sm text-gray-500 font-bold">{profileName}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-3">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wide text-[#2f7d01]">
                    <span>Level Progress</span>
                    <span>Level {currentLevel}</span>
                  </div>
                  <div className="mt-2 h-3 bg-[#d9ecc8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
                      style={{ width: `${levelProgressPercent}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-[11px] text-[#6a6a6a] font-bold uppercase tracking-wide">
                    {levelProgressLabel} units completed ({levelProgressPercent}%)
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-wide mb-2">Switch Profile</p>
                  <div className="flex gap-2">
                    <input
                      value={profileInput}
                      onChange={(event) => {
                        setProfileInput(event.target.value);
                        if (profileError) setProfileError(null);
                      }}
                      onKeyDown={(event) => event.key === 'Enter' && applyProfileName()}
                      placeholder="Username (no spaces)"
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#58cc02] outline-none text-sm font-semibold text-[#3c3c3c]"
                    />
                    <button
                      onClick={applyProfileName}
                      disabled={!isProfileInputValid}
                      className={`px-4 rounded-xl text-xs font-extrabold uppercase tracking-wide border-2 transition-all ${
                        isProfileInputValid
                          ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                  </div>
                  {(profileError || hasProfileWhitespace) && (
                    <p className="mt-2 text-xs font-bold text-[#b91c1c]">Username cannot contain spaces.</p>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border-2 border-[#c5eb9f] bg-[#f7ffef] p-4">
                  <p className="text-[11px] text-[#2f7d01] font-extrabold uppercase tracking-wide">Current Course</p>
                  <p className="text-3xl font-extrabold text-[#3c3c3c] mt-1">{currentCourseCode}</p>
                </div>
                <div className="rounded-2xl border-2 border-[#c5eb9f] bg-[#f7ffef] p-4">
                  <p className="text-[11px] text-[#2f7d01] font-extrabold uppercase tracking-wide">Unlocked Units</p>
                  <p className="text-3xl font-extrabold text-[#3c3c3c] mt-1">{unlockedLevel}/{totalLevels}</p>
                </div>
                <div className="rounded-2xl border-2 border-[#ffe5b4] bg-[#fff8ea] p-4">
                  <p className="text-[11px] text-[#f59e0b] font-extrabold uppercase tracking-wide">Streak</p>
                  <p className="text-3xl font-extrabold text-[#3c3c3c] mt-1">{streak}</p>
                </div>
              </section>

            </div>
          ) : isLevelsView ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-6 md:p-8 w-full max-w-2xl">
              <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-4">Levels</h2>

              {STAGE_ORDER.map((stage) => {
                const stageLevels = CURRICULUM.filter((item) => item.stage === stage);
                if (stageLevels.length === 0) return null;
                const stageUi = STAGE_META[stage];

                return (
                  <div key={stage} className="mb-5 last:mb-0">
                    <p className={`text-xs font-extrabold uppercase tracking-wide mb-2 ${stageUi.titleClass}`}>
                      {stageUi.label}
                    </p>
                    <div className="space-y-3">
                      {stageLevels.map((item) => (
                        <div
                          key={item.level}
                          className={`w-full text-left rounded-xl border-2 px-3 py-2.5 ${stageUi.levelCardClass}`}
                        >
                          <div className="w-full flex items-start justify-between gap-3">
                            <p className="text-base font-extrabold text-[#3c3c3c]">
                              Level {item.level} - {item.title}
                            </p>
                          </div>
                          <div className="mt-2.5 space-y-2">
                            {item.topics.map((topic, topicIdx) => {
                              const isTopicAvailable = lessons.some(
                                (lesson) => lesson.level === item.level && lesson.unit === topicIdx + 1,
                              );
                              const courseCode = `${item.level}.${topicIdx + 1}`;
                              return (
                                <button
                                  key={topic}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    goToLevelUnit(item.level, topicIdx);
                                  }}
                                  disabled={!isTopicAvailable || mode === 'quiz'}
                                  className={`w-full text-left rounded-lg border px-3 py-2 text-xs font-bold text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${stageUi.topicCardClass}`}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center min-w-5 h-5 rounded-md text-[10px] font-extrabold mr-2 ${stageUi.badgeClass}`}
                                  >
                                    {courseCode}
                                  </span>
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : isSettingsView ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-6 md:p-8 w-full max-w-2xl">
              <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-4">Settings</h2>
              <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4 mb-3">
                <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Default Language</p>
                <p className="text-sm text-gray-600 mt-1 mb-3">Select one: Burmese (default) or English.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage('burmese')}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                      defaultLanguage === 'burmese'
                        ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                        : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                    }`}
                  >
                    Burmese (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage('english')}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                      defaultLanguage === 'english'
                        ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                        : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4 mb-3">
                <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Learn Language</p>
                <p className="text-sm text-gray-600 mt-1 mb-3">Choose your target learning language.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLearnLanguage('english')}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                      learnLanguage === 'english'
                        ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                        : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLearnLanguage('chinese')}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                      learnLanguage === 'chinese'
                        ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                        : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                    }`}
                  >
                    Chinese
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4 mb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Pronunciation</p>
                    <p className="text-sm text-gray-600 mt-1">Show pronunciation row in lessons.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPronunciationEnabled((prev) => !prev)}
                    className={`px-4 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                      isPronunciationEnabled
                        ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                        : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                    }`}
                  >
                    {isPronunciationEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4">
                <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Current Mapping</p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="text-gray-600 font-bold">
                    <span className="text-[#2f7d01] uppercase tracking-wide">Translation:</span> {translationLabel}
                  </p>
                  <p className="text-gray-600 font-bold">
                    <span className="text-[#2f7d01] uppercase tracking-wide">Pronunciation:</span> {pronunciationStyleLabel}
                  </p>
                </div>
              </div>
            </div>
          ) : mode === 'quiz' ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl">
              <div className="w-full mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#58cc02]">
                  Course {currentCourseCode} • {getLevelTitle(currentLevel)}
                </p>
                <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-lg border-2 border-[#9ad56a] bg-[#f7ffef] text-[#2f7d01] text-[11px] font-extrabold uppercase tracking-wide">
                  XP: {unitXp}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-medium text-[#3c3c3c] mb-1">Match each sentence</h2>
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#58cc02] mb-4">
                Quick Review • 3 Matches
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  {matchPairs.map((pair) => {
                    const isMatched = matchedPairIds.includes(pair.id);
                    const isSelected = selectedPromptId === pair.id;
                    return (
                      <button
                        key={`prompt-${pair.id}`}
                        onClick={() => handleSelectPrompt(pair.id)}
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
                        onClick={() => handleSelectAnswer(pair.id)}
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
                Matched: {matchedPairIds.length}/{Math.max(matchPairs.length, MATCH_PAIRS_PER_REVIEW)}
                {isMatchReviewComplete && (matchMistakes === 0 ? ' • Perfect' : ` • Mistakes: ${matchMistakes}`)}
              </p>
            </div>
          ) : mode === 'result' && reviewResult ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-[#3c3c3c] mb-3">Review Complete</h2>
              <p className="text-lg font-extrabold text-[#2f7d01] mb-1">
                Review Score: {unitXp}/{TOTAL_XP_PER_COURSE}
              </p>
              <p className={`text-sm font-bold mb-6 ${reviewResult.passed ? 'text-[#2f7d01]' : 'text-[#b91c1c]'}`}>
                {reviewResult.passed ? 'Passed' : 'Needs more practice'}
              </p>
              <button
                onClick={handleResultContinue}
                className="w-full py-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-lg uppercase tracking-wider duo-button-shadow hover:brightness-110 active:scale-95 transition-all"
              >
                {reviewResult.passed ? 'Continue' : 'Retry Unit'}
              </button>
            </div>
          ) : mode === 'completed' ? (
            <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl text-center">
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
              className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl flex flex-col items-center"
            >
              <div className="w-full mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#58cc02]">
                  Course {currentCourseCode} • {getLevelTitle(currentLevel)}
                </p>
                <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-lg border-2 border-[#9ad56a] bg-[#f7ffef] text-[#2f7d01] text-[11px] font-extrabold uppercase tracking-wide">
                  XP: {unitXp}
                </span>
              </div>
              <div className="w-full space-y-2">
                {currentBatchEntries.map(({ lesson, lessonIndex }, idx) => (
                  <div key={`${lesson.english}-${currentIndex + idx}`}>
                    {(() => {
                      const englishTranslation = englishReferenceLessons[lessonIndex]?.english || lesson.english;
                      const translatedText = defaultLanguage === 'burmese' ? lesson.burmese : englishTranslation;
                      return (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-2.5 py-2">
                      <AudioButton text={lesson.english} compact />
                      <div className="text-left leading-tight">
                        <p className="text-base md:text-lg font-medium text-[#3c3c3c]">{lesson.english}</p>
                        <p className="text-base md:text-lg font-normal text-[#58cc02]">{translatedText}</p>
                        {isPronunciationEnabled && (
                          <p className="text-sm md:text-base font-normal text-gray-500">{lesson.pronunciation}</p>
                        )}
                      </div>
                    </div>
                      );
                    })()}
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
                  {(() => {
                    const nextStep = Math.min(LEARN_QUESTIONS_PER_UNIT, learnStep + 1);
                    if (!QUICK_REVIEW_CHECKPOINTS.includes(nextStep)) return 'Next';
                    return 'Quick Review';
                  })()}
                </button>
              </>
            )}
            {mode === 'quiz' && (
              <button
                onClick={handleQuizNext}
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
        )}

        {
          <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-gray-100">
            <div className="grid grid-cols-3 gap-1 p-2">
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
            </div>
          </nav>
        }
      </div>
    </div>
  );
};

export default App;

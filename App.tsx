import React, { useEffect, useState } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { LessonData, ProgressState } from './types';
import { useProfileProgress } from './hooks/useProfileProgress';
import { useLessonFlow } from './hooks/useLessonFlow';
import { isPassingScore } from './utils/reviewScoring';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { LessonView } from './components/views/LessonView';
import { MatchReviewView } from './components/views/MatchReviewView';
import { ResultView } from './components/views/ResultView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { VoicePreference } from './components/AudioButton';

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
const TEXT_SCALE_PERCENT_KEY = 'lingo_burmese_text_scale_percent';
const VOICE_PREFERENCE_KEY = 'lingo_burmese_voice_preference';
const BOLD_TEXT_ENABLED_KEY = 'lingo_burmese_bold_text_enabled';
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
type ReviewResult = {
  correct: number;
  total: number;
  passed: boolean;
};

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
  const clampTextScale = (value: number) => Math.min(120, Math.max(90, value));
  const {
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    setProfileInput,
    applyProfileName,
  } = useProfileProgress(PROFILE_NAME_KEY);
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
      return localStorage.getItem(PRONUNCIATION_ENABLED_KEY) === 'true';
    } catch {
      return false;
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
  const [textScalePercent, setTextScalePercent] = useState<number>(() => {
    try {
      return clampTextScale(Number(localStorage.getItem(TEXT_SCALE_PERCENT_KEY) || 100));
    } catch {
      return 100;
    }
  });
  const [voicePreference, setVoicePreference] = useState<VoicePreference>(() => {
    try {
      const value = localStorage.getItem(VOICE_PREFERENCE_KEY);
      if (value === 'google_female' || value === 'system_default' || value === 'young_female') {
        return value;
      }
      return 'young_female';
    } catch {
      return 'young_female';
    }
  });
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BOLD_TEXT_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [hasHydratedProfile, setHasHydratedProfile] = useState(false);
  const [learnStep, setLearnStep] = useState(0);
  const [unitXp, setUnitXp] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [quizSectionStart, setQuizSectionStart] = useState(0);
  const [quizSectionEnd, setQuizSectionEnd] = useState(0);
  const {
    answerChecked,
    matchPairs,
    matchAnswerOptions,
    selectedPromptId,
    selectedAnswerId,
    matchedPairIds,
    matchMistakes,
    isMatchReviewComplete,
    resetQuizState,
    startQuizForLevel,
    handleSelectPrompt,
    handleSelectAnswer,
  } = useLessonFlow(MATCH_PAIRS_PER_REVIEW);
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

  const handleApplyProfileName = () => {
    applyProfileName(() => {
      setHasHydratedProfile(false);
      setMode('learn');
      resetQuizState();
      setUnitXp(0);
      setReviewResult(null);
      setSidebarTab('lesson');
      setIsSidebarOpen(false);
    });
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
    let cancelled = false;

    const hydrateProfileProgress = async () => {
      const saved = localStorage.getItem(progressStorageKey) || localStorage.getItem(PROGRESS_KEY);
      const restoredIndex = saved ? (JSON.parse(saved) as ProgressState).currentIndex : 0;
      const safeLocalIndex = Math.min(Math.max(restoredIndex, 0), lessons.length - 1);

      const savedUnlocked = Number(localStorage.getItem(unlockedStorageKey) || localStorage.getItem(UNLOCKED_LEVEL_KEY) || 1);
      const inferredUnlocked = lessons[safeLocalIndex]?.level || 1;
      const safeLocalUnlocked = Math.min(totalLevels, Math.max(savedUnlocked, inferredUnlocked, 1));
      const safeLocalStreak = Math.max(0, Number(localStorage.getItem(streakStorageKey) || localStorage.getItem(STREAK_KEY) || 0));

      if (cancelled) return;
      setCurrentIndex(safeLocalIndex);
      setUnlockedLevel(safeLocalUnlocked);
      setStreak(safeLocalStreak);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/progress?profileName=${encodeURIComponent(profileName)}`,
        );
        if (response.ok) {
          const remote = await response.json();
          const remoteIndex = Math.min(
            Math.max(0, Number(remote.currentIndex) || 0),
            lessons.length - 1,
          );
          const remoteUnlocked = Math.min(
            totalLevels,
            Math.max(1, Number(remote.unlockedLevel) || 1),
          );
          const remoteStreak = Math.max(0, Number(remote.streak) || 0);
          if (cancelled) return;
          setCurrentIndex(remoteIndex);
          setUnlockedLevel(remoteUnlocked);
          setStreak(remoteStreak);
          if (remote.learnLanguage === 'english' || remote.learnLanguage === 'chinese') {
            setLearnLanguage(remote.learnLanguage);
          }
          if (remote.defaultLanguage === 'english' || remote.defaultLanguage === 'burmese') {
            setDefaultLanguage(remote.defaultLanguage);
          }
          if (typeof remote.isPronunciationEnabled === 'boolean') {
            setIsPronunciationEnabled(remote.isPronunciationEnabled);
          }
        }
      } catch {
        // DB sync is optional; localStorage remains the fallback.
      } finally {
        if (!cancelled) setHasHydratedProfile(true);
      }
    };

    hydrateProfileProgress();
    return () => {
      cancelled = true;
    };
  }, [
    apiBaseUrl,
    lessons,
    profileName,
    progressStorageKey,
    streakStorageKey,
    totalLevels,
    unlockedStorageKey,
  ]);

  useEffect(() => {
    if (profileName) {
      setHasHydratedProfile(false);
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
    if (!profileName || lessons.length === 0 || !hasHydratedProfile) return;

    const payload = {
      profileName,
      currentIndex,
      unlockedLevel,
      streak,
      learnLanguage,
      defaultLanguage,
      isPronunciationEnabled,
    };

    void fetch(`${apiBaseUrl}/api/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      // DB sync is optional; localStorage remains the fallback.
    });
  }, [
    apiBaseUrl,
    currentIndex,
    defaultLanguage,
    hasHydratedProfile,
    isPronunciationEnabled,
    learnLanguage,
    lessons.length,
    profileName,
    streak,
    unlockedLevel,
  ]);

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
    localStorage.setItem(TEXT_SCALE_PERCENT_KEY, String(textScalePercent));
    document.documentElement.style.fontSize = `${textScalePercent}%`;
  }, [textScalePercent]);

  useEffect(() => {
    localStorage.setItem(VOICE_PREFERENCE_KEY, voicePreference);
  }, [voicePreference]);

  useEffect(() => {
    localStorage.setItem(BOLD_TEXT_ENABLED_KEY, String(isBoldTextEnabled));
  }, [isBoldTextEnabled]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sidebarTab]);

  const handleNext = () => {
    if (isNextDisabled || mode !== 'learn') return;

    setIsNextDisabled(true);
    const nextStep = learnStep + 1;
    setLearnStep(nextStep);

    const needsCheckpoint = QUICK_REVIEW_CHECKPOINTS.includes(nextStep);
    if (needsCheckpoint) {
      setQuizSectionStart(sectionStart);
      setQuizSectionEnd(sectionEnd);
      startQuizForLevel(lessons, sectionStart, sectionEnd);
      setMode('quiz');
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
      const passedByScore = isPassingScore(nextXp, PASS_SCORE);
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
            onChange={(event) => setProfileInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleApplyProfileName()}
            placeholder="Username (no spaces)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58cc02] outline-none font-semibold text-[#3c3c3c]"
          />
          {(profileError || hasProfileWhitespace) && (
            <p className="mt-2 text-xs font-bold text-[#b91c1c]">Username cannot contain spaces.</p>
          )}
          <button
            onClick={handleApplyProfileName}
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
  const currentLevelTitle = getLevelTitle(currentLevel);
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
            Road Map
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
            <ProfileView
              profileName={profileName}
              currentLevel={currentLevel}
              levelProgressPercent={levelProgressPercent}
              levelProgressLabel={levelProgressLabel}
              profileInput={profileInput}
              profileError={profileError}
              hasProfileWhitespace={hasProfileWhitespace}
              isProfileInputValid={isProfileInputValid}
              currentCourseCode={currentCourseCode}
              unlockedLevel={unlockedLevel}
              totalLevels={totalLevels}
              streak={streak}
              onProfileInputChange={setProfileInput}
              onApplyProfileName={handleApplyProfileName}
            />
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
            <SettingsView
              defaultLanguage={defaultLanguage}
              learnLanguage={learnLanguage}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              textScalePercent={textScalePercent}
              canDecreaseTextSize={textScalePercent > 90}
              canIncreaseTextSize={textScalePercent < 120}
              voicePreference={voicePreference}
              translationLabel={translationLabel}
              pronunciationStyleLabel={pronunciationStyleLabel}
              onDefaultLanguageChange={setDefaultLanguage}
              onLearnLanguageChange={setLearnLanguage}
              onTogglePronunciation={() => setIsPronunciationEnabled((prev) => !prev)}
              onToggleBoldText={() => setIsBoldTextEnabled((prev) => !prev)}
              onDecreaseTextSize={() =>
                setTextScalePercent((prev) => clampTextScale(prev - 5))
              }
              onIncreaseTextSize={() =>
                setTextScalePercent((prev) => clampTextScale(prev + 5))
              }
              onVoicePreferenceChange={setVoicePreference}
            />
          ) : mode === 'quiz' ? (
            <MatchReviewView
              currentCourseCode={currentCourseCode}
              currentLevelTitle={currentLevelTitle}
              unitXp={unitXp}
              matchPairs={matchPairs}
              matchAnswerOptions={matchAnswerOptions}
              matchedPairIds={matchedPairIds}
              selectedPromptId={selectedPromptId}
              selectedAnswerId={selectedAnswerId}
              answerChecked={answerChecked}
              matchMistakes={matchMistakes}
              matchPairsPerReview={MATCH_PAIRS_PER_REVIEW}
              isMatchReviewComplete={isMatchReviewComplete}
              onSelectPrompt={handleSelectPrompt}
              onSelectAnswer={handleSelectAnswer}
            />
          ) : mode === 'result' && reviewResult ? (
            <ResultView
              reviewResult={reviewResult}
              unitXp={unitXp}
              totalXp={TOTAL_XP_PER_COURSE}
              onContinue={handleResultContinue}
            />
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
            <LessonView
              currentCourseCode={currentCourseCode}
              currentLevelTitle={currentLevelTitle}
              unitXp={unitXp}
              currentIndex={currentIndex}
              currentBatchEntries={currentBatchEntries}
              currentBatchLessonsCount={currentBatchLessons.length}
              englishReferenceLessons={englishReferenceLessons}
              defaultLanguage={defaultLanguage}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              voicePreference={voicePreference}
            />
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

        <MobileBottomNav
          activeTab={sidebarTab}
          onTabChange={(tab) => {
            setSidebarTab(tab);
            setIsSidebarOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default App;

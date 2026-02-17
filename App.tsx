import React, { useState } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { LessonData } from './types';
import { useProfileProgress } from './hooks/useProfileProgress';
import { useLessonFlow } from './hooks/useLessonFlow';
import { useProfileProgressSync } from './hooks/useProfileProgressSync';
import { useSettingsPersistence } from './hooks/useSettingsPersistence';
import { useLessonData } from './hooks/useLessonData';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppPreferences } from './hooks/useAppPreferences';
import { isPassingScore } from './utils/reviewScoring';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { LessonView } from './components/views/LessonView';
import { MatchReviewView } from './components/views/MatchReviewView';
import { ResultView } from './components/views/ResultView';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  AppMode,
  buildStageUnitsFromLessons,
  clampTextScale,
  CURRICULUM,
  getLevelTitle,
  LEARN_QUESTIONS_PER_UNIT,
  LESSONS_PER_BATCH,
  MATCH_PAIRS_PER_REVIEW,
  PASS_SCORE,
  PROFILE_NAME_KEY,
  PROGRESS_KEY,
  QUICK_REVIEW_CHECKPOINTS,
  resolveStageCode,
  ReviewResult,
  STREAK_KEY,
  toProfileStorageId,
  TOTAL_XP_PER_COURSE,
  UNLOCKED_LEVEL_KEY,
} from './config/appConfig';
import { LevelsView } from './components/views/LevelsView';
import { AppSidebar } from './components/layout/AppSidebar';
import {
  CompletedView,
  LessonsUnavailableView,
  LoadingView,
  WelcomeView,
} from './components/views/AppStateViews';

const App: React.FC = () => {
  const {
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    setProfileInput,
    applyProfileName,
  } = useProfileProgress(PROFILE_NAME_KEY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>('learn');
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const {
    isSidebarOpen,
    sidebarTab,
    setIsSidebarOpen,
    setSidebarTab,
    closeSidebar,
    selectTab,
    reloadApp,
  } = useAppNavigation();
  const {
    isPronunciationEnabled,
    setIsPronunciationEnabled,
    learnLanguage,
    setLearnLanguage,
    defaultLanguage,
    setDefaultLanguage,
    textScalePercent,
    setTextScalePercent,
    voicePreference,
    setVoicePreference,
    isBoldTextEnabled,
    setIsBoldTextEnabled,
  } = useAppPreferences();
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [learnStep, setLearnStep] = useState(0);
  const [unitXp, setUnitXp] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [quizSectionStart, setQuizSectionStart] = useState(0);
  const [quizSectionEnd, setQuizSectionEnd] = useState(0);
  const [isLeaveQuizModalOpen, setIsLeaveQuizModalOpen] = useState(false);
  const [pendingUnitTarget, setPendingUnitTarget] = useState<{ level: number; unit: number } | null>(
    null,
  );
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
  const { lessons, englishReferenceLessons, loading, errorMessage } = useLessonData(
    apiBaseUrl,
    learnLanguage,
  );
  const profileStorageId = profileName ? toProfileStorageId(profileName) : '';
  const progressStorageKey = profileStorageId ? `${PROGRESS_KEY}:${profileStorageId}` : PROGRESS_KEY;
  const unlockedStorageKey = profileStorageId ? `${UNLOCKED_LEVEL_KEY}:${profileStorageId}` : UNLOCKED_LEVEL_KEY;
  const streakStorageKey = profileStorageId ? `${STREAK_KEY}:${profileStorageId}` : STREAK_KEY;

  const { markHydrationStale } = useProfileProgressSync({
    apiBaseUrl,
    lessons,
    profileName,
    mode,
    currentIndex,
    unlockedLevel,
    streak,
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    totalLevels: CURRICULUM.length,
    progressStorageKey,
    unlockedStorageKey,
    streakStorageKey,
    setCurrentIndex,
    setUnlockedLevel,
    setStreak,
    setLearnLanguage,
    setDefaultLanguage,
    setIsPronunciationEnabled,
  });

  useSettingsPersistence({
    learnLanguage,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    voicePreference,
    isBoldTextEnabled,
  });

  const totalLevels = CURRICULUM.length;
  const leaveQuizConfirmMessage =
    defaultLanguage === 'burmese'
      ? 'Quick Review မှ ထွက်မလား? ဒီ review အတွင်း တိုးတက်မှုတွေ ပျက်သွားပါမယ်။'
      : 'Leave quick review? Progress in this review will be lost.';
  const leaveQuizModalTitle = defaultLanguage === 'burmese' ? 'Quick Review မှ ထွက်ရန်' : 'Leave quick review?';
  const leaveQuizCancelLabel = defaultLanguage === 'burmese' ? 'မထွက်တော့ပါ' : 'Cancel';
  const leaveQuizConfirmLabel =
    defaultLanguage === 'burmese' ? 'ထွက်မယ်' : 'Leave quick review';
  const activeLevelIndex =
    mode === 'quiz' || mode === 'result'
      ? quizSectionStart
      : Math.min(currentIndex, Math.max(lessons.length - 1, 0));
  const fallbackLevel = Math.floor(activeLevelIndex / LEARN_QUESTIONS_PER_UNIT) + 1;
  const currentLevel = lessons[activeLevelIndex]?.level || fallbackLevel;
  const currentUnit = lessons[activeLevelIndex]?.unit || 1;
  const currentStage = resolveStageCode(currentLevel, lessons[activeLevelIndex]?.stage);
  const currentStageUnits = buildStageUnitsFromLessons(lessons).filter((entry) => entry.stage === currentStage);
  const currentStageUnitNumber =
    currentStageUnits.find((entry) => entry.level === currentLevel && entry.unit === currentUnit)
      ?.stageUnitNumber || 1;
  const currentCourseCode = `${currentStage} Unit ${currentStageUnitNumber}`;
  const levelIndexes = lessons.reduce<number[]>((acc, lesson, idx) => {
    if (lesson.level === currentLevel && lesson.unit === currentUnit) acc.push(idx);
    return acc;
  }, []);
  const sectionStart = levelIndexes.length > 0 ? levelIndexes[0] : Math.max(0, activeLevelIndex);
  const sectionEnd = levelIndexes.length > 0 ? levelIndexes[levelIndexes.length - 1] : Math.max(0, activeLevelIndex);
  const sectionTotal = Math.max(1, sectionEnd - sectionStart + 1);
  const unitFlowTotal = LEARN_QUESTIONS_PER_UNIT;
  const batchStartOffset =
    mode === 'learn' ? (learnStep * LESSONS_PER_BATCH) % Math.max(sectionTotal, 1) : 0;
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
  const unitFlowCurrent = Math.min(learnStep, LEARN_QUESTIONS_PER_UNIT);

  const handleApplyProfileName = () => {
    applyProfileName(() => {
      markHydrationStale();
      setMode('learn');
      resetQuizState();
      setUnitXp(0);
      setReviewResult(null);
      setSidebarTab('lesson');
      setIsSidebarOpen(false);
    });
  };

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

  const navigateToLevelUnit = (level: number, unit: number) => {
    const safeLevel = Math.min(Math.max(level, 1), totalLevels);
    const safeUnit = Math.max(1, unit);
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

  const goToLevelUnit = (level: number, unit: number) => {
    if (mode === 'quiz') {
      setPendingUnitTarget({ level, unit });
      setIsLeaveQuizModalOpen(true);
      return;
    }
    navigateToLevelUnit(level, unit);
  };

  const handleLeaveQuizCancel = () => {
    setIsLeaveQuizModalOpen(false);
    setPendingUnitTarget(null);
  };

  const handleLeaveQuizConfirm = () => {
    if (pendingUnitTarget) {
      navigateToLevelUnit(pendingUnitTarget.level, pendingUnitTarget.unit);
    }
    setIsLeaveQuizModalOpen(false);
    setPendingUnitTarget(null);
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
    return <LoadingView />;
  }

  if (errorMessage || lessons.length === 0) {
    return <LessonsUnavailableView errorMessage={errorMessage} apiBaseUrl={apiBaseUrl} />;
  }

  if (!profileName) {
    return (
      <WelcomeView
        profileInput={profileInput}
        profileError={profileError}
        hasProfileWhitespace={hasProfileWhitespace}
        isProfileInputValid={isProfileInputValid}
        onProfileInputChange={setProfileInput}
        onApplyProfileName={handleApplyProfileName}
      />
    );
  }

  const translationLabel = defaultLanguage === 'burmese' ? 'Burmese (Current)' : 'English';
  const pronunciationStyleLabel =
    defaultLanguage === 'burmese' ? 'Burmese style (Current)' : 'English style (Pinyin for Chinese)';
  const currentLevelTitle = getLevelTitle(currentLevel);
  const unitsPerLevel = new Set(
    lessons.filter((lesson) => lesson.level === currentLevel).map((lesson) => lesson.unit),
  ).size || 1;
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
      {isLeaveQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={handleLeaveQuizCancel}
            aria-label="Close leave quick review dialog"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-quiz-title"
            className="relative w-full max-w-sm rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-xl"
          >
            <h3 id="leave-quiz-title" className="text-lg font-extrabold text-[#3c3c3c]">
              {leaveQuizModalTitle}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{leaveQuizConfirmMessage}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleLeaveQuizCancel}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-gray-600 duo-secondary-shadow"
              >
                {leaveQuizCancelLabel}
              </button>
              <button
                type="button"
                onClick={handleLeaveQuizConfirm}
                className="flex-1 rounded-xl border-2 border-[#46a302] bg-[#58cc02] px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white duo-button-shadow"
              >
                {leaveQuizConfirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <button
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        sidebarTab={sidebarTab}
        onClose={closeSidebar}
        onSelectTab={selectTab}
        onReload={reloadApp}
      />

      <div className="flex-1 flex flex-col min-h-screen pb-36 md:pb-0">
        {isLessonView && <ProgressBar unitCurrent={unitFlowCurrent} unitTotal={unitFlowTotal} />}

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
            <LevelsView
              lessons={lessons}
              defaultLanguage={defaultLanguage}
              onSelectUnit={goToLevelUnit}
            />
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
              onDecreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev - 5))}
              onIncreaseTextSize={() => setTextScalePercent((prev) => clampTextScale(prev + 5))}
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
            <CompletedView onRestart={handleReview} />
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
          onTabChange={selectTab}
        />
      </div>
    </div>
  );
};

export default App;

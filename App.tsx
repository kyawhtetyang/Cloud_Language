import React, { useMemo, useState } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { LessonData } from './types';
import { useProfileProgress } from './hooks/useProfileProgress';
import { useLessonFlow } from './hooks/useLessonFlow';
import { useProfileProgressSync } from './hooks/useProfileProgressSync';
import { useSettingsPersistence } from './hooks/useSettingsPersistence';
import { useLessonData } from './hooks/useLessonData';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppPreferences } from './hooks/useAppPreferences';
import { useLessonUnitState } from './hooks/useLessonUnitState';
import { isPassingScore } from './utils/reviewScoring';
import { buildLessonReferenceKey } from './utils/lessonReference';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { LessonView } from './components/views/LessonView';
import { MatchReviewView } from './components/views/MatchReviewView';
import { ResultView } from './components/views/ResultView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LessonActionFooter } from './components/LessonActionFooter';
import { LeaveQuizModal } from './components/modals/LeaveQuizModal';
import {
  AppMode,
  clampTextScale,
  getLearningFlowConfig,
  MATCH_PAIRS_PER_REVIEW,
  PASS_SCORE,
  PROFILE_NAME_KEY,
  PROGRESS_KEY,
  ReviewResult,
  STREAK_KEY,
  toProfileStorageId,
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
    chineseTrack,
    setChineseTrack,
    defaultLanguage,
    setDefaultLanguage,
    textScalePercent,
    setTextScalePercent,
    voicePreference,
    setVoicePreference,
    isBoldTextEnabled,
    setIsBoldTextEnabled,
    isRandomLessonOrderEnabled,
    setIsRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    setIsReviewQuestionsRemoved,
    hasHydratedSettings,
  } = useAppPreferences(profileName ? toProfileStorageId(profileName) : '');
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
  const [randomOrderVersion, setRandomOrderVersion] = useState(0);
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
    chineseTrack,
  );
  const flowConfig = useMemo(
    () => getLearningFlowConfig(learnLanguage, chineseTrack),
    [learnLanguage, chineseTrack],
  );
  const unitFlowTotal = flowConfig.questionsPerUnit;
  const lessonsPerBatch = flowConfig.lessonsPerBatch;
  const quickReviewCheckpoints = flowConfig.quickReviewCheckpoints;
  const totalXpPerCourse = flowConfig.quickReviewCheckpoints.length;
  const totalLevels = useMemo(
    () => lessons.reduce((max, lesson) => Math.max(max, lesson.level), 1),
    [lessons],
  );
  const englishReferenceByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const lesson of englishReferenceLessons) {
      map.set(buildLessonReferenceKey(lesson), lesson.english);
    }
    return map;
  }, [englishReferenceLessons]);
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
    chineseTrack,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    voicePreference,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    totalLevels,
    progressStorageKey,
    unlockedStorageKey,
    streakStorageKey,
    setCurrentIndex,
    setUnlockedLevel,
    setStreak,
    setLearnLanguage,
    setChineseTrack,
    setDefaultLanguage,
    setIsPronunciationEnabled,
    setTextScalePercent,
    setVoicePreference,
    setIsBoldTextEnabled,
    setIsRandomLessonOrderEnabled,
    setIsReviewQuestionsRemoved,
  });

  useSettingsPersistence({
    profileStorageId,
    enabled: Boolean(profileName) && hasHydratedSettings,
    learnLanguage,
    chineseTrack,
    defaultLanguage,
    isPronunciationEnabled,
    textScalePercent,
    voicePreference,
    isBoldTextEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
  });

  const leaveQuizConfirmMessage =
    defaultLanguage === 'burmese'
      ? 'Quick Review မှ ထွက်မလား? ဒီ review အတွင်း တိုးတက်မှုတွေ ပျက်သွားပါမယ်။'
      : 'Leave quick review? Progress in this review will be lost.';
  const leaveQuizModalTitle = defaultLanguage === 'burmese' ? 'Quick Review မှ ထွက်ရန်' : 'Leave quick review?';
  const leaveQuizCancelLabel = defaultLanguage === 'burmese' ? 'မထွက်တော့ပါ' : 'Cancel';
  const leaveQuizConfirmLabel =
    defaultLanguage === 'burmese' ? 'ထွက်မယ်' : 'Leave quick review';
  const {
    currentLevel,
    currentUnit,
    currentCourseCode,
    currentLevelTitle,
    orderedUnitIndexes,
    sectionStart,
    sectionEnd,
    sectionTotal,
    unitFlowCurrent,
    currentBatchEntries,
    currentBatchLessonsCount,
  } = useLessonUnitState({
    lessons,
    mode,
    currentIndex,
    quizSectionStart,
    learnStep,
    lessonsPerBatch,
    questionsPerUnit: unitFlowTotal,
    isRandomLessonOrderEnabled,
    randomOrderVersion,
  });

  const handleApplyProfileName = () => {
    applyProfileName(() => {
      markHydrationStale();
      setMode('learn');
      resetQuizState();
      setUnitXp(0);
      setReviewResult(null);
      setSidebarTab('lesson');
      setRandomOrderVersion((prev) => prev + 1);
      setIsSidebarOpen(false);
    });
  };

  const handleNext = () => {
    if (isNextDisabled || mode !== 'learn') return;

    setIsNextDisabled(true);
    const nextStep = learnStep + 1;
    setLearnStep(nextStep);

    const isCheckpointStep = quickReviewCheckpoints.includes(nextStep);

    if (isReviewQuestionsRemoved && isCheckpointStep) {
      if (nextStep >= unitFlowTotal) {
        const passedLevel = lessons[sectionStart]?.level || 1;
        const nextUnlocked = Math.min(totalLevels, passedLevel + 1);
        setUnlockedLevel((prev) => Math.max(prev, nextUnlocked));
        setStreak((prev) => prev + 1);

        const nextStart = sectionEnd + 1;
        if (nextStart >= lessons.length) {
          setMode('completed');
          setUnlockedLevel(totalLevels);
          setReviewResult(null);
          resetQuizState();
          setIsNextDisabled(false);
          return;
        }

        setMode('learn');
        setCurrentIndex(nextStart);
        setLearnStep(0);
        setRandomOrderVersion((prev) => prev + 1);
        setUnitXp(0);
        setReviewResult(null);
        resetQuizState();
      } else {
        const nextOffset = (nextStep * lessonsPerBatch) % sectionTotal;
        setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
      }
      setIsNextDisabled(false);
      return;
    }

    const needsCheckpoint = isCheckpointStep;
    if (needsCheckpoint) {
      const previousCheckpoint =
        quickReviewCheckpoints.filter((checkpoint) => checkpoint < nextStep).at(-1) || 0;
      const reviewSourceIndexes = Array.from(
        { length: (nextStep - previousCheckpoint) * lessonsPerBatch },
        (_, idx) => {
          const offset = ((previousCheckpoint * lessonsPerBatch) + idx) % sectionTotal;
          return orderedUnitIndexes[offset] ?? sectionStart;
        },
      );
      const reviewSourceLessons = reviewSourceIndexes
        .map((index) => lessons[index])
        .filter((lesson): lesson is LessonData => Boolean(lesson));

      setQuizSectionStart(sectionStart);
      setQuizSectionEnd(sectionEnd);
      if (reviewSourceLessons.length > 0) {
        startQuizForLevel(reviewSourceLessons, 0, reviewSourceLessons.length - 1);
      } else {
        startQuizForLevel(lessons, sectionStart, sectionEnd);
      }
      setMode('quiz');
    } else {
      const nextOffset = (nextStep * lessonsPerBatch) % sectionTotal;
      setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
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
    setRandomOrderVersion((prev) => prev + 1);
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
    setRandomOrderVersion((prev) => prev + 1);
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
      setRandomOrderVersion((prev) => prev + 1);
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
    setRandomOrderVersion((prev) => prev + 1);
    setUnitXp(0);
    setReviewResult(null);
    resetQuizState();
  };

  const handleQuizNext = () => {
    if (!answerChecked) return;

    const isPass = matchMistakes === 0 && matchedPairIds.length === matchPairs.length;
    const gainedXp = isPass ? 1 : 0;
    const nextXp = Math.min(unitXp + gainedXp, totalXpPerCourse);
    if (isPass) {
      setUnitXp(nextXp);
    }

    if (learnStep >= unitFlowTotal) {
      const passedByScore = isPassingScore(nextXp, PASS_SCORE);
      if (!passedByScore) {
        setStreak(0);
      }
      setReviewResult({
        correct: nextXp,
        total: totalXpPerCourse,
        passed: passedByScore,
      });
      setMode('result');
      resetQuizState();
      return;
    }

    setMode('learn');
    resetQuizState();
    if (isPass && learnStep < unitFlowTotal) {
      const nextOffset = (learnStep * lessonsPerBatch) % sectionTotal;
      setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
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
  const unitsPerLevel = new Set(
    lessons.filter((lesson) => lesson.level === currentLevel).map((lesson) => lesson.unit),
  ).size || 1;
  const currentUnitProgress = Math.min(learnStep, unitFlowTotal) / unitFlowTotal;
  const levelProgressUnitsRaw = Math.min(unitsPerLevel, Math.max(0, currentUnit - 1 + currentUnitProgress));
  const levelProgressPercent = Math.round((levelProgressUnitsRaw / Math.max(unitsPerLevel, 1)) * 100);
  const levelProgressLabel = `${levelProgressUnitsRaw.toFixed(1)}/${unitsPerLevel}`;
  const isLevelsView = sidebarTab === 'levels';
  const isProfileView = sidebarTab === 'profile';
  const isLessonView = sidebarTab === 'lesson';
  const isSettingsView = sidebarTab === 'settings';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f1ffe2_0%,#eef8ff_55%,#f5f7fa_100%)] md:flex">
      <LeaveQuizModal
        isOpen={isLeaveQuizModalOpen}
        title={leaveQuizModalTitle}
        message={leaveQuizConfirmMessage}
        cancelLabel={leaveQuizCancelLabel}
        confirmLabel={leaveQuizConfirmLabel}
        onCancel={handleLeaveQuizCancel}
        onConfirm={handleLeaveQuizConfirm}
      />

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
              chineseTrack={chineseTrack}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              isRandomLessonOrderEnabled={isRandomLessonOrderEnabled}
              isReviewQuestionsRemoved={isReviewQuestionsRemoved}
              textScalePercent={textScalePercent}
              canDecreaseTextSize={textScalePercent > 90}
              canIncreaseTextSize={textScalePercent < 120}
              voicePreference={voicePreference}
              translationLabel={translationLabel}
              pronunciationStyleLabel={pronunciationStyleLabel}
              onDefaultLanguageChange={setDefaultLanguage}
              onLearnLanguageChange={setLearnLanguage}
              onChineseTrackChange={setChineseTrack}
              onTogglePronunciation={() => setIsPronunciationEnabled((prev) => !prev)}
              onToggleBoldText={() => setIsBoldTextEnabled((prev) => !prev)}
              onToggleRandomLessonOrder={() => {
                setIsRandomLessonOrderEnabled((prev) => !prev);
                setRandomOrderVersion((prev) => prev + 1);
              }}
              onToggleReviewQuestions={() => setIsReviewQuestionsRemoved((prev) => !prev)}
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
              totalXp={totalXpPerCourse}
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
              currentBatchLessonsCount={currentBatchLessonsCount}
              englishReferenceLessons={englishReferenceLessons}
              englishReferenceByKey={englishReferenceByKey}
              defaultLanguage={defaultLanguage}
              isPronunciationEnabled={isPronunciationEnabled}
              isBoldTextEnabled={isBoldTextEnabled}
              voicePreference={voicePreference}
            />
          )}
        </main>

        {isLessonView && (
          <LessonActionFooter
            mode={mode}
            isNextDisabled={isNextDisabled}
            learnStep={learnStep}
            questionsPerUnit={unitFlowTotal}
            quickReviewCheckpoints={quickReviewCheckpoints}
            isReviewQuestionsRemoved={isReviewQuestionsRemoved}
            isMatchReviewComplete={isMatchReviewComplete}
            onNext={handleNext}
            onQuizSubmit={handleQuizNext}
          />
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

import React from 'react';
import { cancelSpeech, speakText, VoicePreference } from '../AudioButton';
import { LessonData } from '../../types';
import { STAGE_META, resolveStageCode } from '../../config/appConfig';
import { buildLessonReferenceKey } from '../../utils/lessonReference';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type LessonViewProps = {
  onBackToRoadmap?: () => void;
  progressLabel?: string;
  currentCourseCode: string;
  currentLevelTitle: string;
  unitXp: number;
  currentIndex: number;
  currentBatchEntries: LessonEntry[];
  currentBatchLessonsCount: number;
  englishReferenceLessons: LessonData[];
  englishReferenceByKey: Map<string, string>;
  defaultLanguage: 'burmese' | 'english';
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  voicePreference: VoicePreference;
};

export const LessonView: React.FC<LessonViewProps> = ({
  onBackToRoadmap,
  progressLabel,
  currentCourseCode,
  currentLevelTitle,
  unitXp,
  currentIndex,
  currentBatchEntries,
  currentBatchLessonsCount,
  englishReferenceLessons,
  englishReferenceByKey,
  defaultLanguage,
  isPronunciationEnabled,
  isBoldTextEnabled,
  voicePreference,
}) => {
  const leadLesson = currentBatchEntries[0]?.lesson;
  const level = leadLesson?.level || 1;
  const unit = leadLesson?.unit || 1;
  const stage = resolveStageCode(level, leadLesson?.stage);
  const stageUi = STAGE_META[stage];

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-3 w-full border-b border-gray-100 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {onBackToRoadmap && (
              <button
                type="button"
                onClick={onBackToRoadmap}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                <span aria-hidden="true">←</span>
                Back
              </button>
            )}
            <p className={`truncate text-xs font-black uppercase tracking-[0.12em] ${stageUi.titleClass}`}>
              {stage} U{unit}
            </p>
          </div>
          {progressLabel && (
            <p className="shrink-0 text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">
              {progressLabel}
            </p>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_6px_22px_rgba(0,0,0,0.07)] md:p-4">
        <div className="grid gap-2.5">
          {currentBatchEntries.map(({ lesson, lessonIndex }, idx) => (
            <div key={`${lesson.english}-${currentIndex + idx}`}>
              {(() => {
                const lessonKey = buildLessonReferenceKey(lesson);
                const englishTranslation =
                  englishReferenceByKey.get(lessonKey) || englishReferenceLessons[lessonIndex]?.english || lesson.english;
                const translatedText = defaultLanguage === 'burmese' ? lesson.burmese : englishTranslation;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      cancelSpeech();
                      void speakText(lesson.english, voicePreference);
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left flex items-center gap-3 transition-all hover:brightness-[0.99] active:scale-[0.99] ${stageUi.topicCardClass}`}
                    aria-label={`Play audio for ${lesson.english}`}
                    title="Tap to hear pronunciation"
                  >
                    <div className="text-left leading-tight">
                      {isPronunciationEnabled && (
                        <p className={`text-sm md:text-base text-gray-500 ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                          {lesson.pronunciation}
                        </p>
                      )}
                      <p className={`text-base md:text-lg text-[#3c3c3c] ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}>
                        {lesson.english}
                      </p>
                      <p className={`text-base md:text-lg text-[#58cc02] ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                        {translatedText}
                      </p>
                    </div>
                  </button>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

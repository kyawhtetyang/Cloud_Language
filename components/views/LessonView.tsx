import React, { useEffect, useRef, useState } from 'react';
import { cancelSpeech, speakText, VoicePreference } from '../AudioButton';
import { LessonData } from '../../types';
import { resolveStageCode } from '../../config/appConfig';
import { buildLessonReferenceKey } from '../../utils/lessonReference';
import { localizeRoadmapTopic } from '../../config/roadmapI18n';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type LessonViewProps = {
  onBackToRoadmap?: () => void;
  progressLabel?: string;
  currentIndex: number;
  currentBatchEntries: LessonEntry[];
  allBatchGroups?: LessonEntry[][];
  currentStep?: number;
  isReading?: boolean;
  onSelectStep?: (step: number) => void;
  englishReferenceLessons: LessonData[];
  englishReferenceByKey: Map<string, string>;
  defaultLanguage: 'burmese' | 'english';
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  voicePreference: VoicePreference;
  defaultLayoutMode?: 'paged' | 'list';
  onLayoutModeChange?: (mode: 'paged' | 'list') => void;
};

export const LessonView: React.FC<LessonViewProps> = ({
  onBackToRoadmap,
  progressLabel,
  currentIndex,
  currentBatchEntries,
  allBatchGroups,
  currentStep,
  isReading,
  onSelectStep,
  englishReferenceLessons,
  englishReferenceByKey,
  defaultLanguage,
  isPronunciationEnabled,
  isBoldTextEnabled,
  voicePreference,
  defaultLayoutMode = 'list',
  onLayoutModeChange,
}) => {
  const [lessonLayout, setLessonLayout] = useState<'paged' | 'list'>(defaultLayoutMode);
  const batchRefs = useRef<Array<HTMLDivElement | null>>([]);
  const leadLesson = currentBatchEntries[0]?.lesson;
  const level = leadLesson?.level || 1;
  const unit = leadLesson?.unit || 1;
  const stage = resolveStageCode(level, leadLesson?.stage);
  const topicTitle = leadLesson?.topic
    ? localizeRoadmapTopic(leadLesson.topic, defaultLanguage)
    : defaultLanguage === 'burmese'
      ? `ယူနစ် ${unit}`
      : `Unit ${unit}`;

  useEffect(() => {
    if (lessonLayout !== 'list') return;
    if (typeof currentStep !== 'number' || currentStep < 0) return;
    const node = batchRefs.current[currentStep];
    if (!node) return;
    if (typeof node.scrollIntoView !== 'function') return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep, lessonLayout]);

  useEffect(() => {
    onLayoutModeChange?.(lessonLayout);
  }, [lessonLayout, onLayoutModeChange]);

  useEffect(() => {
    setLessonLayout(defaultLayoutMode);
  }, [defaultLayoutMode]);

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
            <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-lesson-accent">
              {stage} U{unit}
            </p>
          </div>
          {progressLabel && (
            <p className="shrink-0 text-xs font-black uppercase tracking-[0.12em] text-gray-500">
              {progressLabel}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-ink-strong md:text-base">
            {topicTitle}
          </p>
          <div className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-white p-1">
            <button
              type="button"
              onClick={() => setLessonLayout('paged')}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide transition-colors ${
                lessonLayout === 'paged' ? 'btn-selected-flat' : 'border-transparent bg-transparent text-gray-600'
              }`}
            >
              Paged
            </button>
            <button
              type="button"
              onClick={() => setLessonLayout('list')}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide transition-colors ${
                lessonLayout === 'list' ? 'btn-selected-flat' : 'border-transparent bg-transparent text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>
      <div className={`overflow-hidden rounded-2xl ${
        lessonLayout === 'list'
          ? 'bg-transparent border-0 shadow-none'
          : 'border border-gray-200 bg-white shadow-[0_6px_22px_rgba(0,0,0,0.07)]'
      }`}>
        {lessonLayout === 'list' && allBatchGroups && allBatchGroups.length > 0 ? (
          <div className="space-y-2 p-2">
            {allBatchGroups.map((entries, batchIdx) => (
              <div
                key={`batch-${batchIdx}`}
                ref={(node) => {
                  batchRefs.current[batchIdx] = node;
                }}
                role="button"
                tabIndex={0}
                onClick={() => onSelectStep?.(batchIdx)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectStep?.(batchIdx);
                  }
                }}
                className={`relative rounded-xl border p-1.5 transition-all ${
                  batchIdx === (currentStep ?? -1)
                    ? 'lesson-batch-selected'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {batchIdx === (currentStep ?? -1) && (
                  <span className="absolute inset-y-1.5 left-0 w-1.5 rounded-r-full bg-brand" aria-hidden="true" />
                )}
                <div className="flex items-center justify-between px-2 pb-1">
                  <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                    {batchIdx + 1}/10
                  </p>
                  {batchIdx === (currentStep ?? -1) ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-paler px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brand-ink">
                      {isReading ? 'Playing' : 'Selected'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Tap to select
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {entries.map(({ lesson, lessonIndex }, idx) => {
                    const lessonKey = buildLessonReferenceKey(lesson);
                    const englishTranslation =
                      englishReferenceByKey.get(lessonKey) || englishReferenceLessons[lessonIndex]?.english || lesson.english;
                    const translatedText = defaultLanguage === 'burmese' ? lesson.burmese : englishTranslation;
                    return (
                      <button
                        key={`${lesson.english}-${batchIdx}-${idx}`}
                        type="button"
                        onClick={() => {
                          onSelectStep?.(batchIdx);
                          cancelSpeech();
                          void speakText(lesson.english, voicePreference);
                        }}
                        className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50 active:scale-[0.99]"
                        aria-label={`Play audio for ${lesson.english}`}
                        title="Tap to hear pronunciation"
                      >
                        <div className="text-left leading-tight">
                          {isPronunciationEnabled && (
                            <p className={`text-sm md:text-base text-gray-400 ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                              {lesson.pronunciation}
                            </p>
                          )}
                          <p className={`text-base md:text-lg text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}>
                            {lesson.english}
                          </p>
                          <p className={`text-brand text-base md:text-lg ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                            {translatedText}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 p-1.5">
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
                      className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50 active:scale-[0.99]"
                      aria-label={`Play audio for ${lesson.english}`}
                      title="Tap to hear pronunciation"
                    >
                      <div className="text-left leading-tight">
                        {isPronunciationEnabled && (
                          <p className={`text-sm md:text-base text-gray-400 ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                            {lesson.pronunciation}
                          </p>
                        )}
                        <p className={`text-base md:text-lg text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}>
                          {lesson.english}
                        </p>
                        <p className={`text-brand text-base md:text-lg ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                          {translatedText}
                        </p>
                      </div>
                    </button>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

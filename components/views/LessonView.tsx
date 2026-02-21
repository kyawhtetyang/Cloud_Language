import React, { useEffect, useRef, useState } from 'react';
import { cancelSpeech, speakText } from '../AudioButton';
import { LessonData } from '../../types';
import { getPlayableLessonText, LearnLanguage, resolveStageCode, VoiceProvider } from '../../config/appConfig';
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
  learnLanguage: LearnLanguage;
  voiceProvider: VoiceProvider;
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
  learnLanguage,
  voiceProvider,
  defaultLayoutMode = 'list',
  onLayoutModeChange,
}) => {
  const [lessonLayout, setLessonLayout] = useState<'paged' | 'list'>(defaultLayoutMode);
  const [localSelectedGroup, setLocalSelectedGroup] = useState<number | null>(null);
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
  const totalGroups = allBatchGroups?.length ?? 0;
  const selectedGroupIndex =
    typeof currentStep === 'number' && currentStep >= 0 ? currentStep : (localSelectedGroup ?? 0);
  const activeGroup = selectedGroupIndex + 1;

  useEffect(() => {
    if (typeof currentStep === 'number' && currentStep >= 0) {
      setLocalSelectedGroup(currentStep);
    }
  }, [currentStep]);

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
      <div className="mb-3 w-full border-b border-[var(--border-subtle)] pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {onBackToRoadmap && (
              <button
                type="button"
                onClick={onBackToRoadmap}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <span aria-hidden="true">←</span>
                Back
              </button>
            )}
            <p className="truncate text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
              {stage} U{unit}
            </p>
          </div>
          <p className="shrink-0 text-xs font-semibold tracking-wide text-[var(--text-muted)]">
            {lessonLayout === 'list' && totalGroups > 0
              ? `Group ${Math.min(activeGroup, totalGroups)} of ${totalGroups}`
              : (progressLabel ?? '')}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-ink-strong md:text-base">
            {topicTitle}
          </p>
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-1">
            <button
              type="button"
              onClick={() => setLessonLayout('paged')}
              className={`min-h-[36px] rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                lessonLayout === 'paged'
                  ? 'btn-selected-flat'
                  : 'border-transparent bg-transparent text-[var(--text-secondary)]'
              }`}
            >
              Paged
            </button>
            <button
              type="button"
              onClick={() => setLessonLayout('list')}
              className={`min-h-[36px] rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                lessonLayout === 'list'
                  ? 'btn-selected-flat'
                  : 'border-transparent bg-transparent text-[var(--text-secondary)]'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden bg-transparent">
        {lessonLayout === 'list' && allBatchGroups && allBatchGroups.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {allBatchGroups.map((entries, batchIdx) => {
              const isBatchSelected = batchIdx === selectedGroupIndex;
              return (
                <div
                key={`batch-${batchIdx}`}
                ref={(node) => {
                  batchRefs.current[batchIdx] = node;
                }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setLocalSelectedGroup(batchIdx);
                  onSelectStep?.(batchIdx);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setLocalSelectedGroup(batchIdx);
                    onSelectStep?.(batchIdx);
                  }
                }}
                className={`relative px-0 py-1.5 transition-all ${
                  isBatchSelected
                    ? 'rounded-xl border border-[var(--border-strong)] ring-1 ring-[var(--color-selection-selected-ring)]'
                    : 'bg-transparent'
                }`}
              >
                {isBatchSelected && (
                  <span className="pointer-events-none absolute right-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-1.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                    {batchIdx + 1}
                  </span>
                )}
                <div className="space-y-1.5 px-1 pb-1">
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
                          setLocalSelectedGroup(batchIdx);
                          onSelectStep?.(batchIdx);
                          cancelSpeech();
                          const speakValue = getPlayableLessonText(lesson);
                          if (!speakValue) return;
                          void speakText(speakValue, {
                            learnLanguage,
                            unitId: lesson.unitId ?? lesson.unit,
                            audioUrl: lesson.audioPath,
                            voiceProvider,
                          });
                        }}
                        className="selection-hover w-full rounded-lg px-3 py-3 text-left transition-colors"
                        aria-label={`Play audio for ${lesson.english}`}
                        title="Tap to hear pronunciation"
                      >
                        <div className="text-left leading-tight">
                          {isPronunciationEnabled && (
                            <p
                              className={`text-sm md:text-base text-[var(--text-secondary)] ${isBoldTextEnabled ? 'font-semibold' : 'font-normal'}`}
                            >
                              {lesson.pronunciation}
                            </p>
                          )}
                          <p className={`text-base md:text-lg text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}>
                            {lesson.english}
                          </p>
                          <p className={`text-base md:text-lg text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                            {translatedText}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] px-0">
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
                        const speakValue = getPlayableLessonText(lesson);
                        if (!speakValue) return;
                        void speakText(speakValue, {
                          learnLanguage,
                          unitId: lesson.unitId ?? lesson.unit,
                          audioUrl: lesson.audioPath,
                          voiceProvider,
                        });
                      }}
                      className="selection-hover w-full px-3 py-3 text-left transition-colors"
                      aria-label={`Play audio for ${lesson.english}`}
                      title="Tap to hear pronunciation"
                    >
                      <div className="text-left leading-tight">
                        {isPronunciationEnabled && (
                          <p
                            className={`text-sm md:text-base text-[var(--text-secondary)] ${isBoldTextEnabled ? 'font-semibold' : 'font-normal'}`}
                          >
                            {lesson.pronunciation}
                          </p>
                        )}
                        <p className={`text-base md:text-lg text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}>
                          {lesson.english}
                        </p>
                        <p className={`text-ink text-base md:text-lg ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
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

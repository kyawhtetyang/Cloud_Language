import React, { useEffect, useRef, useState } from 'react';
import { cancelSpeech, speakText } from '../AudioButton';
import { LessonData } from '../../types';
import {
  getPlayableLessonText,
  LearnLanguage,
  resolveLessonTranslationText,
  VoiceProvider,
} from '../../config/appConfig';
import { buildLessonReferenceKey } from '../../utils/lessonReference';
import { localizeRoadmapTopic } from '../../config/roadmapI18n';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type TokenizedHighlightText = {
  tokens: string[];
  joiner: string;
};

type TextMatchRange = {
  start: number;
  end: number;
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
  englishReferenceByKey: Map<string, string>;
  defaultLanguage: 'burmese' | 'english';
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  learnLanguage: LearnLanguage;
  voiceProvider: VoiceProvider;
  defaultLayoutMode?: 'paged' | 'list';
  onLayoutModeChange?: (mode: 'paged' | 'list') => void;
  savedHighlightPhrasesByLessonKey?: Map<string, string[]>;
  onSaveLessonHighlight?: (lesson: LessonData, selectedText: string) => boolean;
};

const LONG_PRESS_MS = 480;
const HIGHLIGHT_TIP_DISMISSED_KEY = 'lingo_burmese_highlight_tip_dismissed_v3';
const TOUCH_HIT_X_OFFSETS = [0, -16, 16];
const TOUCH_HIT_Y_OFFSETS = [0, -24, -40, -56, -72];
const VOCAB_HIGHLIGHT_STYLE: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--color-danger)',
};
const LESSON_ROW_NO_SELECT_STYLE: React.CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
};

function tokenizeLessonTextForHighlight(rawText: string): TokenizedHighlightText {
  const text = String(rawText || '').trim();
  if (!text) return { tokens: [], joiner: ' ' };

  if (/\s/.test(text)) {
    return {
      tokens: text.split(/\s+/).filter(Boolean),
      joiner: ' ',
    };
  }

  if (/[\u4e00-\u9fff]/.test(text)) {
    return {
      tokens: Array.from(text).filter((char) => !/\s/.test(char)),
      joiner: '',
    };
  }

  return { tokens: [text], joiner: ' ' };
}

function findHighlightRanges(text: string, phrases: string[]): TextMatchRange[] {
  const normalizedText = String(text || '');
  if (!normalizedText) return [];
  if (!phrases || phrases.length === 0) return [];

  const lowerText = normalizedText.toLocaleLowerCase();
  const candidateRanges: TextMatchRange[] = [];

  for (const phrase of phrases) {
    const trimmedPhrase = String(phrase || '').trim();
    if (!trimmedPhrase) continue;
    const lowerPhrase = trimmedPhrase.toLocaleLowerCase();

    let fromIndex = 0;
    while (fromIndex < lowerText.length) {
      const foundAt = lowerText.indexOf(lowerPhrase, fromIndex);
      if (foundAt < 0) break;
      candidateRanges.push({ start: foundAt, end: foundAt + lowerPhrase.length });
      fromIndex = foundAt + Math.max(1, lowerPhrase.length);
    }
  }

  candidateRanges.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const acceptedRanges: TextMatchRange[] = [];
  let latestEnd = 0;
  for (const range of candidateRanges) {
    if (range.start < latestEnd) continue;
    acceptedRanges.push(range);
    latestEnd = range.end;
  }
  return acceptedRanges;
}

function renderHighlightedText(text: string, phrases: string[]): React.ReactNode {
  const ranges = findHighlightRanges(text, phrases);
  if (ranges.length === 0) return text;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (cursor < range.start) {
      nodes.push(text.slice(cursor, range.start));
    }
    nodes.push(
      <mark
        key={`hl-${range.start}-${range.end}-${index}`}
        className="rounded px-0.5"
        style={VOCAB_HIGHLIGHT_STYLE}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export const LessonView: React.FC<LessonViewProps> = ({
  onBackToRoadmap,
  progressLabel,
  currentIndex,
  currentBatchEntries,
  allBatchGroups,
  currentStep,
  isReading,
  onSelectStep,
  englishReferenceByKey,
  defaultLanguage,
  isPronunciationEnabled,
  isBoldTextEnabled,
  learnLanguage,
  voiceProvider,
  defaultLayoutMode = 'list',
  onLayoutModeChange,
  savedHighlightPhrasesByLessonKey,
  onSaveLessonHighlight,
}) => {
  const [lessonLayout, setLessonLayout] = useState<'paged' | 'list'>(defaultLayoutMode);
  const [localSelectedGroup, setLocalSelectedGroup] = useState<number | null>(null);
  const [highlightModeRowKey, setHighlightModeRowKey] = useState<string | null>(null);
  const [dragStartTokenIndex, setDragStartTokenIndex] = useState<number | null>(null);
  const [dragEndTokenIndex, setDragEndTokenIndex] = useState<number | null>(null);
  const [showHighlightTip, setShowHighlightTip] = useState(false);
  const batchRefs = useRef<Array<HTMLDivElement | null>>([]);
  const longPressTimerRef = useRef<number | null>(null);
  const suppressRowClickRef = useRef<string | null>(null);
  const pendingPressPointRef = useRef<{ rowKey: string; x: number; y: number } | null>(null);

  const leadLesson = currentBatchEntries[0]?.lesson;
  const level = leadLesson?.level || 1;
  const unit = leadLesson?.unit || 1;
  const unitCode = `${Math.max(1, level)}.${Math.max(1, unit)}`;
  const topicTitle = leadLesson?.topic
    ? localizeRoadmapTopic(leadLesson.topic, defaultLanguage)
    : defaultLanguage === 'burmese'
      ? `ယူနစ် ${unit}`
      : `Unit ${unit}`;
  const totalGroups = allBatchGroups?.length ?? 0;
  const selectedGroupIndex =
    typeof currentStep === 'number' && currentStep >= 0 ? currentStep : (localSelectedGroup ?? 0);
  const activeGroup = selectedGroupIndex + 1;
  const topRightProgressLabel =
    lessonLayout === 'list' && totalGroups > 0
      ? `${Math.min(activeGroup, totalGroups)}/${totalGroups}`
      : (progressLabel ?? '');

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = null;
  };

  const closeHighlightMode = () => {
    setHighlightModeRowKey(null);
    setDragStartTokenIndex(null);
    setDragEndTokenIndex(null);
  };

  const dismissHighlightTip = () => {
    setShowHighlightTip(false);
    try {
      localStorage.setItem(HIGHLIGHT_TIP_DISMISSED_KEY, '1');
    } catch {
      // localStorage can fail in private mode or restricted environments.
    }
  };

  const getTokenIndexAtPoint = (rowKey: string, x: number, y: number): number | null => {
    if (typeof document === 'undefined') return null;
    for (const yOffset of TOUCH_HIT_Y_OFFSETS) {
      for (const xOffset of TOUCH_HIT_X_OFFSETS) {
        const probeX = x + xOffset;
        const probeY = y + yOffset;
        const elementAtPoint = document.elementFromPoint(probeX, probeY);
        if (!elementAtPoint) continue;
        const tokenElement = elementAtPoint.closest(`[data-highlight-row="${rowKey}"][data-token-index]`) as HTMLElement | null;
        if (!tokenElement) continue;
        const tokenIndexRaw = tokenElement.dataset.tokenIndex;
        if (!tokenIndexRaw) continue;
        const tokenIndex = Number(tokenIndexRaw);
        if (Number.isInteger(tokenIndex)) return tokenIndex;
      }
    }
    return null;
  };

  const updateDragSelectionByPoint = (rowKey: string, x: number, y: number) => {
    if (highlightModeRowKey !== rowKey) return;
    const tokenIndex = getTokenIndexAtPoint(rowKey, x, y);
    if (tokenIndex === null) return;

    setDragStartTokenIndex((previousStart) => {
      if (previousStart === null) {
        setDragEndTokenIndex(tokenIndex);
        return tokenIndex;
      }
      setDragEndTokenIndex(tokenIndex);
      return previousStart;
    });
  };

  const getDraftSelectionPhrase = (lessonText: string): string => {
    const tokenized = tokenizeLessonTextForHighlight(lessonText);
    if (tokenized.tokens.length === 0) return '';
    if (dragStartTokenIndex === null || dragEndTokenIndex === null) return '';
    const from = Math.min(dragStartTokenIndex, dragEndTokenIndex);
    const to = Math.max(dragStartTokenIndex, dragEndTokenIndex);
    return tokenized.tokens.slice(from, to + 1).join(tokenized.joiner).trim();
  };

  const saveDraftSelection = (lesson: LessonData) => {
    const phrase = getDraftSelectionPhrase(lesson.english);
    if (!phrase) return;
    onSaveLessonHighlight?.(lesson, phrase);
    closeHighlightMode();
  };

  const startLongPress = (rowKey: string, x: number, y: number) => {
    if (typeof window === 'undefined') return;
    clearLongPressTimer();
    pendingPressPointRef.current = { rowKey, x, y };
    longPressTimerRef.current = window.setTimeout(() => {
      setHighlightModeRowKey(rowKey);
      setDragStartTokenIndex(null);
      setDragEndTokenIndex(null);
      suppressRowClickRef.current = rowKey;
      clearLongPressTimer();
      window.requestAnimationFrame(() => {
        const pending = pendingPressPointRef.current;
        if (!pending || pending.rowKey !== rowKey) return;
        updateDragSelectionByPoint(rowKey, pending.x, pending.y);
      });
    }, LONG_PRESS_MS);
  };

  const playLesson = (lesson: LessonData) => {
    cancelSpeech();
    const speakValue = getPlayableLessonText(lesson);
    if (!speakValue) return;
    void speakText(speakValue, {
      learnLanguage,
      unitId: lesson.unitId ?? lesson.unit,
      audioUrl: lesson.audioPath,
      voiceProvider,
    });
  };

  const handleRowClick = (lesson: LessonData, rowKey: string, onBeforePlay?: () => void) => {
    if (suppressRowClickRef.current === rowKey) {
      suppressRowClickRef.current = null;
      return;
    }
    if (highlightModeRowKey) return;
    onBeforePlay?.();
    playLesson(lesson);
  };

  const renderInteractiveSelectionText = (lessonText: string, rowKey: string): React.ReactNode => {
    const tokenized = tokenizeLessonTextForHighlight(lessonText);
    const isWordSeparatedLanguage = tokenized.joiner === ' ';

    let selectedFrom: number | null = null;
    let selectedTo: number | null = null;
    if (highlightModeRowKey === rowKey && dragStartTokenIndex !== null && dragEndTokenIndex !== null) {
      selectedFrom = Math.min(dragStartTokenIndex, dragEndTokenIndex);
      selectedTo = Math.max(dragStartTokenIndex, dragEndTokenIndex);
    }

    return (
      <span className={`inline-flex flex-wrap ${isWordSeparatedLanguage ? 'gap-1.5' : 'gap-0.5'}`}>
        {tokenized.tokens.map((token, index) => {
          const isSelected =
            selectedFrom !== null && selectedTo !== null && index >= selectedFrom && index <= selectedTo;
          return (
            <span
              key={`${rowKey}-token-${index}`}
              data-highlight-row={rowKey}
              data-token-index={index}
              className="inline-flex min-h-7 items-center rounded px-1.5 py-0.5"
              style={isSelected ? VOCAB_HIGHLIGHT_STYLE : undefined}
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  const renderLessonRow = (
    lesson: LessonData,
    rowKey: string,
    onBeforePlay?: () => void,
  ) => {
    const lessonKey = buildLessonReferenceKey(lesson);
    const translatedText = resolveLessonTranslationText({
      lessonEnglish: lesson.english,
      lessonBurmese: lesson.burmese,
      defaultLanguage,
      learnLanguage,
      englishReferenceText: englishReferenceByKey.get(lessonKey),
    });
    const savedPhrases = savedHighlightPhrasesByLessonKey?.get(lessonKey) ?? [];
    const isInteractiveSelecting = highlightModeRowKey === rowKey;
    const selectedPhraseDraft = isInteractiveSelecting ? getDraftSelectionPhrase(lesson.english) : '';

    return (
      <div key={rowKey}>
        <button
          type="button"
          onMouseDown={(event) => {
            if (highlightModeRowKey === rowKey) {
              updateDragSelectionByPoint(rowKey, event.clientX, event.clientY);
              return;
            }
            startLongPress(rowKey, event.clientX, event.clientY);
          }}
          onMouseMove={(event) => {
            if (highlightModeRowKey !== rowKey || event.buttons !== 1) return;
            updateDragSelectionByPoint(rowKey, event.clientX, event.clientY);
          }}
          onMouseUp={() => {
            clearLongPressTimer();
            pendingPressPointRef.current = null;
          }}
          onMouseLeave={() => {
            if (highlightModeRowKey !== rowKey) {
              clearLongPressTimer();
              pendingPressPointRef.current = null;
            }
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            if (highlightModeRowKey === rowKey) {
              updateDragSelectionByPoint(rowKey, touch.clientX, touch.clientY);
              return;
            }
            startLongPress(rowKey, touch.clientX, touch.clientY);
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            if (highlightModeRowKey !== rowKey) {
              clearLongPressTimer();
              pendingPressPointRef.current = null;
              return;
            }
            if (event.cancelable) event.preventDefault();
            updateDragSelectionByPoint(rowKey, touch.clientX, touch.clientY);
          }}
          onTouchEnd={() => {
            clearLongPressTimer();
            pendingPressPointRef.current = null;
          }}
          onTouchCancel={() => {
            clearLongPressTimer();
            pendingPressPointRef.current = null;
            closeHighlightMode();
          }}
          onClick={() => {
            handleRowClick(lesson, rowKey, onBeforePlay);
          }}
          className="selection-hover w-full rounded-lg px-3 py-3 text-left transition-colors"
          style={LESSON_ROW_NO_SELECT_STYLE}
          aria-label={`Play audio for ${lesson.english}`}
          title="Tap to hear pronunciation. Tap and hold, then drag to highlight phrase."
        >
          <div className="text-left leading-tight">
            {isPronunciationEnabled && (
              <p
                className={`text-xs md:text-sm text-[var(--text-secondary)] ${isBoldTextEnabled ? 'font-semibold' : 'font-normal'}`}
              >
                {lesson.pronunciation}
              </p>
            )}
            <p className={`text-base md:text-lg text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}>
              {isInteractiveSelecting
                ? renderInteractiveSelectionText(lesson.english, rowKey)
                : renderHighlightedText(lesson.english, savedPhrases)}
            </p>
            <p className={`text-sm md:text-base text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
              {translatedText}
            </p>
          </div>
        </button>
        {isInteractiveSelecting && (
          <div className="mx-3 mb-2 mt-1 flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-2 py-1.5">
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {selectedPhraseDraft ? `Selected: ${selectedPhraseDraft}` : 'Drag across words to select phrase'}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeHighlightMode();
                }}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-default)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  saveDraftSelection(lesson);
                }}
                disabled={!selectedPhraseDraft}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  selectedPhraseDraft
                    ? 'selection-selected-badge'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-muted)]'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (typeof currentStep === 'number' && currentStep >= 0) {
      setLocalSelectedGroup(currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    if (lessonLayout !== 'list') return;
    if (!isReading) return;
    if (typeof currentStep !== 'number' || currentStep < 0) return;
    const node = batchRefs.current[currentStep];
    if (!node) return;
    if (typeof node.scrollIntoView !== 'function') return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep, lessonLayout, isReading]);

  useEffect(() => {
    onLayoutModeChange?.(lessonLayout);
  }, [lessonLayout, onLayoutModeChange]);

  useEffect(() => {
    setLessonLayout(defaultLayoutMode);
  }, [defaultLayoutMode]);

  useEffect(() => {
    closeHighlightMode();
  }, [currentStep, lessonLayout]);

  useEffect(() => () => clearLongPressTimer(), []);

  useEffect(() => {
    try {
      setShowHighlightTip(localStorage.getItem(HIGHLIGHT_TIP_DISMISSED_KEY) !== '1');
    } catch {
      setShowHighlightTip(true);
    }
  }, []);

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-3 w-full border-b border-[var(--border-subtle)] pb-2">
        <div className="top-toolbar-row flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {onBackToRoadmap && (
              <button
                type="button"
                onClick={onBackToRoadmap}
                aria-label="Back"
                className="top-toolbar-icon inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-base font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <span aria-hidden="true">←</span>
              </button>
            )}
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">{unitCode}</p>
              <p className="truncate text-sm font-bold text-ink-strong md:text-base">
                {topicTitle}
              </p>
            </div>
          </div>
          <p className="shrink-0 text-xs font-semibold tracking-wide text-[var(--text-muted)]">
            {topRightProgressLabel}
          </p>
        </div>
        {showHighlightTip && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-2.5 py-1.5">
            <p className="text-xs text-[var(--text-secondary)]">
              Tip: Tap and hold, drag to select, then tap Save.
            </p>
            <button
              type="button"
              onClick={dismissHighlightTip}
              className="selection-selected-badge shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
            >
              Got it
            </button>
          </div>
        )}
      </div>
      <div className="overflow-hidden bg-transparent">
        {lessonLayout === 'list' && allBatchGroups && allBatchGroups.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {allBatchGroups.map((entries, batchIdx) => {
              const isBatchSelected = batchIdx === selectedGroupIndex;
              const shouldShowBatchSelectionBox = isBatchSelected && Boolean(isReading);
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
                  className="relative rounded-xl bg-transparent px-0 py-1.5 transition-all"
                >
                  {shouldShowBatchSelectionBox && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-xl border border-[var(--border-strong)] ring-1 ring-[var(--color-selection-selected-ring)]"
                    />
                  )}
                  {shouldShowBatchSelectionBox && (
                    <span className="pointer-events-none absolute right-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-1.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                      {batchIdx + 1}
                    </span>
                  )}
                  <div className="space-y-1.5 px-1 pb-1">
                    {entries.map(({ lesson }, idx) => {
                      const rowKey = `${lesson.english}-${batchIdx}-${idx}`;
                      return renderLessonRow(lesson, rowKey, () => {
                        setLocalSelectedGroup(batchIdx);
                        onSelectStep?.(batchIdx);
                      });
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] px-0">
            {currentBatchEntries.map(({ lesson }, idx) => {
              const rowKey = `${lesson.english}-${currentIndex + idx}`;
              return renderLessonRow(lesson, rowKey);
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DefaultLanguage,
  getLessonOrderIndex,
  getLessonUnitId,
  LearnLanguage,
  resolveLessonTranslationText,
} from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { getPillButtonClass } from '../../config/buttonUi';
import { LESSON_LONG_PRESS_MS } from '../../config/interactionConfig';
import { LessonData } from '../../types';
import { buildLessonReferenceKey } from '../../utils/lessonReference';
import { VIEW_DESKTOP_PANEL_CLASS } from './viewShared';

type FeedViewProps = {
  lessons: LessonData[];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  profileStorageId: string;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  textScalePercent: number;
  englishReferenceByKey: Map<string, string>;
  highlightPhrasesByLessonKey: Map<string, string[]>;
  activeSpeakingLessonIndex: number | null;
  onPlayLesson: (lesson: LessonData, lessonIndex: number) => void;
  onStopAudio: () => Promise<void>;
  onSaveLessonHighlight: (lesson: LessonData, selectedText: string) => boolean;
  onClearLessonHighlight: (lesson: LessonData) => boolean;
};

type FeedSignals = {
  knownByLessonKey: Record<string, number>;
  hardByLessonKey: Record<string, number>;
  unitListeningDoneByUnitKey: Record<string, number>;
};

type FeedEntry = {
  lesson: LessonData;
  lessonIndex: number;
  lessonKey: string;
  unitKey: string;
  knownCount: number;
  hardCount: number;
  listeningCount: number;
};

type TokenizedHighlightText = {
  tokens: string[];
  joiner: string;
};

type TextMatchRange = {
  start: number;
  end: number;
};

const FEED_SIGNAL_KEY = 'lingo_burmese_feed_signals';

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
const ACTIVE_SPEAKING_TEXT_STYLE: React.CSSProperties = {
  color: 'var(--color-brand)',
};

const FEED_TEXT: Record<
  DefaultLanguage,
  {
    followingLabel: string;
    forYouLabel: string;
    emptyLabel: string;
  }
> = {
  english: {
    followingLabel: 'Following',
    forYouLabel: 'For You',
    emptyLabel: 'No lessons available for feed.',
  },
  burmese: {
    followingLabel: 'Following',
    forYouLabel: 'For You',
    emptyLabel: 'Feed အတွက် သင်ခန်းစာမရှိသေးပါ။',
  },
  vietnamese: {
    followingLabel: 'Đang theo dõi',
    forYouLabel: 'Dành cho bạn',
    emptyLabel: 'Không có bài học cho feed.',
  },
};

function toStorageKey(profileStorageId: string, learnLanguage: LearnLanguage): string {
  const profile = profileStorageId || 'guest';
  return `${FEED_SIGNAL_KEY}:${profile}:${learnLanguage}`;
}

function parseSignals(raw: string | null): FeedSignals {
  if (!raw) {
    return {
      knownByLessonKey: {},
      hardByLessonKey: {},
      unitListeningDoneByUnitKey: {},
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FeedSignals>;
    return {
      knownByLessonKey: parsed.knownByLessonKey || {},
      hardByLessonKey: parsed.hardByLessonKey || {},
      unitListeningDoneByUnitKey: parsed.unitListeningDoneByUnitKey || {},
    };
  } catch {
    return {
      knownByLessonKey: {},
      hardByLessonKey: {},
      unitListeningDoneByUnitKey: {},
    };
  }
}

function bumpCounter(source: Record<string, number>, key: string): Record<string, number> {
  const next = { ...source };
  next[key] = Math.max(0, (next[key] || 0) + 1);
  return next;
}

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

export const FeedView: React.FC<FeedViewProps> = ({
  lessons,
  defaultLanguage,
  learnLanguage,
  profileStorageId,
  isPronunciationEnabled,
  isBoldTextEnabled,
  textScalePercent,
  englishReferenceByKey,
  highlightPhrasesByLessonKey,
  activeSpeakingLessonIndex,
  onPlayLesson,
  onStopAudio,
  onSaveLessonHighlight,
  onClearLessonHighlight,
}) => {
  const text = FEED_TEXT[defaultLanguage];
  const appText = getAppText(defaultLanguage);
  const signalsStorageKey = useMemo(
    () => toStorageKey(profileStorageId, learnLanguage),
    [profileStorageId, learnLanguage],
  );

  const [signals, setSignals] = useState<FeedSignals>(() => parseSignals(localStorage.getItem(signalsStorageKey)));
  const [currentPos, setCurrentPos] = useState(0);
  const [highlightModeRowKey, setHighlightModeRowKey] = useState<string | null>(null);
  const [dragStartTokenIndex, setDragStartTokenIndex] = useState<number | null>(null);
  const [dragEndTokenIndex, setDragEndTokenIndex] = useState<number | null>(null);
  const [pressedRowKey, setPressedRowKey] = useState<string | null>(null);

  const onPlayLessonRef = useRef(onPlayLesson);
  const longPressTimerRef = useRef<number | null>(null);
  const suppressRowClickRef = useRef<string | null>(null);
  const pendingPressPointRef = useRef<{ rowKey: string; x: number; y: number } | null>(null);

  const lessonTextScale = Number.isFinite(textScalePercent)
    ? Math.min(1.2, Math.max(0.9, textScalePercent / 100))
    : 1;
  const lessonTextScaleStyle = { '--lesson-text-scale': String(lessonTextScale) } as React.CSSProperties;

  useEffect(() => {
    onPlayLessonRef.current = onPlayLesson;
  }, [onPlayLesson]);

  useEffect(() => {
    setSignals(parseSignals(localStorage.getItem(signalsStorageKey)));
    setCurrentPos(0);
    setHighlightModeRowKey(null);
    setDragStartTokenIndex(null);
    setDragEndTokenIndex(null);
  }, [signalsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(signalsStorageKey, JSON.stringify(signals));
    } catch {
      // Ignore localStorage failures for feed scoring.
    }
  }, [signals, signalsStorageKey]);

  const entries = useMemo<FeedEntry[]>(() => {
    return lessons
      .map((lesson, lessonIndex) => {
        const lessonKey = buildLessonReferenceKey(lesson);
        const unitKey = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
        const knownCount = signals.knownByLessonKey[lessonKey] || 0;
        const hardCount = signals.hardByLessonKey[lessonKey] || 0;
        const listeningCount = signals.unitListeningDoneByUnitKey[unitKey] || 0;

        return {
          lesson,
          lessonIndex,
          lessonKey,
          unitKey,
          knownCount,
          hardCount,
          listeningCount,
        };
      })
      .sort((a, b) => a.lessonIndex - b.lessonIndex);
  }, [lessons, signals]);

  const clampedPos = Math.max(0, Math.min(entries.length - 1, currentPos));
  const currentEntry = entries[clampedPos] || null;
  const visibleEntries = useMemo<FeedEntry[]>(() => {
    if (entries.length === 0) return [];
    const count = Math.min(3, entries.length);
    const next: FeedEntry[] = [];
    for (let offset = 0; offset < count; offset += 1) {
      next.push(entries[(clampedPos + offset) % entries.length]);
    }
    return next;
  }, [entries, clampedPos]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const closeHighlightMode = () => {
    setHighlightModeRowKey(null);
    setDragStartTokenIndex(null);
    setDragEndTokenIndex(null);
    setPressedRowKey(null);
  };

  const getTokenIndexAtPoint = (rowKey: string, x: number, y: number): number | null => {
    if (typeof document === 'undefined') return null;
    for (const yOffset of TOUCH_HIT_Y_OFFSETS) {
      for (const xOffset of TOUCH_HIT_X_OFFSETS) {
        const probeX = x + xOffset;
        const probeY = y + yOffset;
        const elementAtPoint = document.elementFromPoint(probeX, probeY);
        if (!elementAtPoint) continue;
        const tokenElement = elementAtPoint.closest(
          `[data-highlight-row="${rowKey}"][data-token-index]`,
        ) as HTMLElement | null;
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
    onSaveLessonHighlight(lesson, phrase);
    closeHighlightMode();
  };

  const clearSavedSelection = (lesson: LessonData) => {
    onClearLessonHighlight(lesson);
    closeHighlightMode();
  };

  const selectWholeSentence = (lessonText: string) => {
    const tokenized = tokenizeLessonTextForHighlight(lessonText);
    if (tokenized.tokens.length === 0) return;
    setDragStartTokenIndex(0);
    setDragEndTokenIndex(tokenized.tokens.length - 1);
  };

  const startLongPress = (rowKey: string, x: number, y: number) => {
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
    }, LESSON_LONG_PRESS_MS);
  };

  const handleRowClick = (lesson: LessonData, lessonIndex: number, rowKey: string) => {
    if (suppressRowClickRef.current === rowKey) {
      suppressRowClickRef.current = null;
      return;
    }
    if (highlightModeRowKey) return;
    onPlayLesson(lesson, lessonIndex);
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

  useEffect(() => {
    if (!currentEntry) return;
    closeHighlightMode();
    const timer = window.setTimeout(() => {
      setSignals((prev) => ({
        ...prev,
        unitListeningDoneByUnitKey: bumpCounter(prev.unitListeningDoneByUnitKey, currentEntry.unitKey),
      }));
      onPlayLessonRef.current(currentEntry.lesson, currentEntry.lessonIndex);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [currentEntry?.lessonIndex]);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
      void onStopAudio();
    };
  }, [onStopAudio]);

  if (!currentEntry) {
    return (
      <section className="mx-auto flex h-[80vh] w-full max-w-4xl items-center justify-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-6">
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{text.emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className="relative mx-auto h-[100svh] w-full max-w-[440px] text-ink md:max-w-3xl md:p-4">
      <div className={`relative h-full w-full overflow-hidden border-x border-[var(--border-subtle)] bg-[var(--surface-subtle)] ${VIEW_DESKTOP_PANEL_CLASS}`}>
        <div
          className="relative h-full w-full select-none bg-[radial-gradient(circle_at_50%_0%,var(--surface-default),var(--surface-subtle)_55%,var(--surface-muted)_100%)] focus:outline-none"
        >
          <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-4">
            <div className="mx-auto flex max-w-[240px] items-center justify-center gap-6 text-sm font-bold text-[var(--text-secondary)]">
              <span>{text.followingLabel}</span>
              <span className="border-b-2 border-[var(--color-brand)] pb-1 text-ink">{text.forYouLabel}</span>
            </div>
          </div>

          <div className="absolute left-4 right-4 top-24 bottom-24 z-20 flex flex-col justify-center gap-6">
            {visibleEntries.map((entry, index) => {
              const entryLesson = entry.lesson;
              const entryTranslationText = resolveLessonTranslationText({
                lessonEnglish: entryLesson.english,
                lessonBurmese: entryLesson.burmese,
                lessonTranslations: entryLesson.translations || null,
                defaultLanguage,
                learnLanguage,
                englishReferenceText: englishReferenceByKey.get(entry.lessonKey),
              });
              const entryPronunciationText = String(entryLesson.pronunciation || '').trim() || '-';
              const isEntryPlaying = activeSpeakingLessonIndex === entry.lessonIndex;
              const opacityClass = index === 0 ? 'opacity-100' : 'opacity-75';
              const rowKey = `${entry.lessonKey}:${entry.lessonIndex}`;
              const savedPhrases = highlightPhrasesByLessonKey.get(entry.lessonKey) || [];
              const isInteractiveSelecting = highlightModeRowKey === rowKey;
              const isPressed = pressedRowKey === rowKey;
              const selectedPhraseDraft = isInteractiveSelecting
                ? getDraftSelectionPhrase(entryLesson.english)
                : '';
              const hasSavedPhrases = savedPhrases.length > 0;
              const canSelectWholeSentence = tokenizeLessonTextForHighlight(entryLesson.english).tokens.length > 0;

              return (
                <div key={`${entry.lessonKey}:${entry.lessonIndex}`} className={opacityClass}>
                  <button
                    type="button"
                    className={`selection-hover w-full cursor-pointer rounded-lg px-3 py-3 text-left transition-colors hover:bg-[var(--color-selection-hover-bg)] active:bg-[var(--color-selection-hover-bg)] focus-visible:bg-[var(--color-selection-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] ${isPressed ? 'bg-[var(--color-selection-hover-bg)]' : ''}`}
                    style={{ ...LESSON_ROW_NO_SELECT_STYLE, ...lessonTextScaleStyle }}
                    onMouseDown={(event) => {
                      setPressedRowKey(rowKey);
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
                      setPressedRowKey((previous) => (previous === rowKey ? null : previous));
                      clearLongPressTimer();
                      pendingPressPointRef.current = null;
                    }}
                    onMouseLeave={() => {
                      setPressedRowKey((previous) => (previous === rowKey ? null : previous));
                      if (highlightModeRowKey !== rowKey) {
                        clearLongPressTimer();
                        pendingPressPointRef.current = null;
                      }
                    }}
                    onTouchStart={(event) => {
                      setPressedRowKey(rowKey);
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
                      setPressedRowKey((previous) => (previous === rowKey ? null : previous));
                      clearLongPressTimer();
                      pendingPressPointRef.current = null;
                    }}
                    onTouchCancel={() => {
                      setPressedRowKey((previous) => (previous === rowKey ? null : previous));
                      clearLongPressTimer();
                      pendingPressPointRef.current = null;
                      closeHighlightMode();
                    }}
                    onClick={() => {
                      setPressedRowKey((previous) => (previous === rowKey ? null : previous));
                      handleRowClick(entryLesson, entry.lessonIndex, rowKey);
                    }}
                    aria-label={`${appText.lesson.playAudioAriaPrefix} ${entryLesson.english}`}
                    title={appText.lesson.highlightHintTitle}
                  >
                    <div className="text-left leading-tight">
                      {isPronunciationEnabled && (
                        <p
                          className={`lesson-row-pronunciation text-[var(--text-secondary)] ${isBoldTextEnabled ? 'font-semibold' : 'font-normal'}`}
                        >
                          {entryPronunciationText}
                        </p>
                      )}
                      <p
                        className={`lesson-row-source text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}
                        style={isEntryPlaying ? ACTIVE_SPEAKING_TEXT_STYLE : undefined}
                      >
                        {isInteractiveSelecting
                          ? renderInteractiveSelectionText(entryLesson.english, rowKey)
                          : renderHighlightedText(entryLesson.english, savedPhrases)}
                      </p>
                      <p
                        className={`lesson-row-translation text-ink ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}
                        style={isEntryPlaying ? ACTIVE_SPEAKING_TEXT_STYLE : undefined}
                      >
                        {entryTranslationText}
                      </p>
                    </div>
                  </button>
                  {isInteractiveSelecting && (
                    <div className="mx-3 mb-2 mt-1 flex items-center justify-end gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            closeHighlightMode();
                          }}
                          className={getPillButtonClass('default')}
                        >
                          {appText.lesson.highlightCancelLabel}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            clearSavedSelection(entryLesson);
                          }}
                          disabled={!hasSavedPhrases}
                          className={getPillButtonClass(hasSavedPhrases ? 'selected' : 'muted')}
                        >
                          {appText.lesson.highlightClearLabel}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            selectWholeSentence(entryLesson.english);
                          }}
                          disabled={!canSelectWholeSentence}
                          className={getPillButtonClass(canSelectWholeSentence ? 'selected' : 'muted')}
                        >
                          {appText.lesson.highlightAllLabel}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            saveDraftSelection(entryLesson);
                          }}
                          disabled={!selectedPhraseDraft}
                          className={getPillButtonClass(selectedPhraseDraft ? 'selected' : 'muted')}
                        >
                          {appText.lesson.highlightSaveLabel}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedView;

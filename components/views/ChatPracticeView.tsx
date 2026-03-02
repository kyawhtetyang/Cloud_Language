import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DefaultLanguage } from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { VIEW_PAGE_CLASS } from './viewShared';
import { BUTTON_UI, getActionButtonClass } from '../../config/buttonUi';

type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
  status: 'none' | 'match' | 'retry';
};

type ChatPracticeViewProps = {
  defaultLanguage: DefaultLanguage;
  highlightPhrasesByLessonKey: Map<string, string[]>;
  onComposerFocusChange?: (isFocused: boolean) => void;
};

function normalizePhrase(value: string): string {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeForCompare(value: string): string {
  return normalizePhrase(value)
    .normalize('NFKC')
    .replace(/[’`´]/g, '\'')
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');
}

function buildRankedHighlightPhrases(highlightPhrasesByLessonKey: Map<string, string[]>): string[] {
  const countByPhrase = new Map<string, number>();
  for (const phrases of highlightPhrasesByLessonKey.values()) {
    for (const rawPhrase of phrases) {
      const phrase = normalizePhrase(rawPhrase);
      if (!phrase) continue;
      countByPhrase.set(phrase, (countByPhrase.get(phrase) || 0) + 1);
    }
  }

  return Array.from(countByPhrase.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      if (b[0].length !== a[0].length) return b[0].length - a[0].length;
      return a[0].localeCompare(b[0], undefined, { sensitivity: 'base' });
    })
    .map(([phrase]) => phrase);
}

function pickRandomPhraseIndex(phrases: string[], excludeIndex?: number): number {
  if (phrases.length <= 1) return 0;
  const selectableIndexes = phrases
    .map((_, index) => index)
    .filter((index) => index !== excludeIndex);
  if (selectableIndexes.length === 0) return 0;
  const randomIndex = Math.floor(Math.random() * selectableIndexes.length);
  return selectableIndexes[randomIndex] ?? selectableIndexes[0];
}

export const ChatPracticeView: React.FC<ChatPracticeViewProps> = ({
  defaultLanguage,
  highlightPhrasesByLessonKey,
  onComposerFocusChange,
}) => {
  const appText = getAppText(defaultLanguage);
  const rankedPhrases = useMemo(
    () => buildRankedHighlightPhrases(highlightPhrasesByLessonKey),
    [highlightPhrasesByLessonKey],
  );
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const messagesBottomRef = useRef<HTMLDivElement | null>(null);

  const activePhrase = rankedPhrases[activePhraseIndex] || '';
  const hasPhrasePool = rankedPhrases.length > 0;

  useEffect(() => {
    if (!hasPhrasePool) {
      setActivePhraseIndex(0);
      setMessages([]);
      return;
    }
    const initialPhraseIndex = pickRandomPhraseIndex(rankedPhrases);
    setActivePhraseIndex(initialPhraseIndex);
    setMessages([
      {
        role: 'assistant',
        text: rankedPhrases[initialPhraseIndex],
        status: 'none',
      },
    ]);
  }, [hasPhrasePool, rankedPhrases]);

  useEffect(() => () => onComposerFocusChange?.(false), [onComposerFocusChange]);

  useEffect(() => {
    const container = messagesScrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          const activeContainer = messagesScrollRef.current;
          if (!activeContainer) return;
          activeContainer.scrollTop = activeContainer.scrollHeight;
        });
      }
      return;
    }
    const anchor = messagesBottomRef.current;
    if (!anchor || typeof anchor.scrollIntoView !== 'function') return;
    anchor.scrollIntoView({ block: 'end' });
  }, [messages]);

  const submitDraft = () => {
    const normalizedDraft = normalizePhrase(draft);
    if (!normalizedDraft) return;
    if (!activePhrase) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          text: normalizedDraft,
          status: 'none',
        },
        {
          role: 'assistant',
          text: appText.appState.lessonsUnavailableDefaultMessage,
          status: 'none',
        },
      ]);
      setDraft('');
      return;
    }

    const isMatch = normalizeForCompare(normalizedDraft) === normalizeForCompare(activePhrase);
    const nextPhraseIndex = isMatch && rankedPhrases.length > 0
      ? pickRandomPhraseIndex(rankedPhrases, activePhraseIndex)
      : activePhraseIndex;
    const nextPhrase = rankedPhrases[nextPhraseIndex] || activePhrase;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: normalizedDraft,
        status: isMatch ? 'match' : 'retry',
      },
      {
        role: 'assistant',
        text: nextPhrase,
        status: 'none',
      },
    ]);
    setDraft('');
    setActivePhraseIndex(nextPhraseIndex);
  };

  const resetPractice = () => {
    if (!hasPhrasePool) {
      setMessages([]);
      setDraft('');
      return;
    }
    const initialPhraseIndex = pickRandomPhraseIndex(rankedPhrases);
    setMessages([
      {
        role: 'assistant',
        text: rankedPhrases[initialPhraseIndex],
        status: 'none',
      },
    ]);
    setDraft('');
    setActivePhraseIndex(initialPhraseIndex);
  };

  return (
    <div className={`${VIEW_PAGE_CLASS} h-full min-h-0 overflow-hidden`}>
      <section className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-0 py-3">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            {appText.navigation.feedLabel}
          </h3>
          <button
            type="button"
            onClick={resetPractice}
            className={getActionButtonClass({ variant: 'secondary', size: 'sm' })}
          >
            {appText.appState.reloadLabel}
          </button>
        </div>

        <div ref={messagesScrollRef} className="min-h-0 flex-1 overflow-y-auto px-0 py-3 pb-32 md:pb-44">
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isAssistant = message.role === 'assistant';
              const bubbleClass = isAssistant
                ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)]'
                : 'bg-[var(--surface-active)] text-[var(--text-primary)]';
              const statusLabel = message.status === 'match' ? '✓' : message.status === 'retry' ? '✗' : '';
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm font-semibold ${bubbleClass}`}>
                    <div className="flex items-center gap-2">
                      {statusLabel && <span className="text-xs font-extrabold">{statusLabel}</span>}
                      <span>{message.text}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {!hasPhrasePool && (
              <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] px-3 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                {appText.appState.lessonsUnavailableDefaultMessage}
              </div>
            )}
            <div ref={messagesBottomRef} />
          </div>
        </div>

        <div
          className={`fixed left-0 right-0 z-20 px-3 ${BUTTON_UI.bottomBarDesktopAnchor} ${
            isComposerFocused
              ? 'bottom-[calc(env(safe-area-inset-bottom)+8px)]'
              : 'bottom-[calc(64px+env(safe-area-inset-bottom)+8px)]'
          }`}
        >
          <div className="mx-auto w-full max-w-3xl px-0 py-0">
            <div className="flex items-center gap-2">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onFocus={() => {
                  setIsComposerFocused(true);
                  onComposerFocusChange?.(true);
                }}
                onBlur={() => {
                  setIsComposerFocused(false);
                  onComposerFocusChange?.(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submitDraft();
                  }
                }}
                inputMode="text"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                name="chat_message"
                rows={1}
                className="min-h-11 max-h-28 min-w-0 flex-1 resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-2 text-base font-semibold text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-strong)] disabled:opacity-60 md:text-sm"
              />
              <button
                type="button"
                onClick={submitDraft}
                disabled={!normalizePhrase(draft)}
                className={getActionButtonClass({
                  variant: 'primary',
                  size: 'sm',
                  disabled: !normalizePhrase(draft),
                })}
              >
                {appText.profile.saveLabel}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

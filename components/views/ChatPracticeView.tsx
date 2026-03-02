import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DefaultLanguage } from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { VIEW_PAGE_CLASS } from './viewShared';
import { getActionButtonClass } from '../../config/buttonUi';

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
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesBottomRef = useRef<HTMLDivElement | null>(null);

  const activePhrase = rankedPhrases[activePhraseIndex] || '';
  const hasPhrasePool = rankedPhrases.length > 0;

  useEffect(() => {
    if (!hasPhrasePool) {
      setActivePhraseIndex(0);
      setMessages([]);
      return;
    }
    setActivePhraseIndex(0);
    setMessages([
      {
        role: 'assistant',
        text: rankedPhrases[0],
        status: 'none',
      },
    ]);
  }, [hasPhrasePool, rankedPhrases]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [hasPhrasePool]);

  useEffect(() => () => onComposerFocusChange?.(false), [onComposerFocusChange]);

  useEffect(() => {
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
      ? (activePhraseIndex + 1) % rankedPhrases.length
      : activePhraseIndex;
    const nextPhrase = rankedPhrases[nextPhraseIndex] || activePhrase;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: normalizedDraft,
        status: 'none',
      },
      {
        role: 'assistant',
        text: nextPhrase,
        status: isMatch ? 'match' : 'retry',
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
    setMessages([
      {
        role: 'assistant',
        text: rankedPhrases[0],
        status: 'none',
      },
    ]);
    setDraft('');
    setActivePhraseIndex(0);
  };

  return (
    <div className={`${VIEW_PAGE_CLASS} h-full min-h-0`}>
      <section className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
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

        <div className="flex-1 overflow-y-auto px-3 py-3 pb-32 md:pb-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {rankedPhrases.slice(0, 6).map((phrase) => (
              <span
                key={phrase}
                className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]"
              >
                {phrase}
              </span>
            ))}
          </div>

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
          className={`fixed left-0 right-0 z-20 px-3 md:static md:z-auto md:px-0 ${
            isComposerFocused
              ? 'bottom-[calc(env(safe-area-inset-bottom)+8px)]'
              : 'bottom-[calc(64px+env(safe-area-inset-bottom)+8px)]'
          }`}
        >
          <div className="mx-auto w-full max-w-3xl px-0 py-0">
            <div className="flex items-center gap-2">
              <input
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
                  if (event.key === 'Enter') {
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
                className="min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-2 text-base font-semibold text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-strong)] disabled:opacity-60 md:text-sm"
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

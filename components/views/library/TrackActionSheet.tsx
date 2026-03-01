import React from 'react';

type TrackActionSheetProps = {
  isOpen: boolean;
  closeAriaLabel: string;
  trackTitle: string;
  trackUnitCode: string;
  openLessonLabel: string;
  onClose: () => void;
  onOpenLesson: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
};

export const TrackActionSheet: React.FC<TrackActionSheetProps> = ({
  isOpen,
  closeAriaLabel,
  trackTitle,
  trackUnitCode,
  openLessonLabel,
  onClose,
  onOpenLesson,
  onToggleBookmark,
  isBookmarked,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:z-[60]">
      <button
        type="button"
        aria-label={closeAriaLabel}
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-[var(--border-subtle)] bg-[var(--surface-default)] px-4 pb-6 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.28)]">
        <div className="mx-auto mb-3 h-1 w-11 rounded-full bg-[var(--border-subtle)]" />
        <div className="mb-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-2">
          <p className="truncate text-base font-semibold text-ink">{trackTitle}</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--text-muted)]">{trackUnitCode}</p>
        </div>
        <div className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
          <button
            type="button"
            onClick={onOpenLesson}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-ink transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span>{openLessonLabel}</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onToggleBookmark}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-ink transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span>Bookmark</span>
            {isBookmarked ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M6 3h12v18l-6-4-6 4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h12v18l-6-4-6 4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_PAGE_CLASS,
} from './viewShared';
import { BUTTON_UI } from '../../config/buttonUi';
import { AppTextPack } from '../../config/appI18n';

type ProfileAlbumCard = {
  key: string;
  title: string;
  meta: string;
  coverUrl: string | null;
  totalUnitCount: number;
  downloadedUnitCount: number;
  onOpen: () => void;
};

type ProfileViewProps = {
  profileName: string;
  progressPercent: number;
  progressLabel: string;
  profileText: AppTextPack['profile'];
  currentCourseCode: string;
  downloadedLessonsCount?: number;
  albumCards?: ProfileAlbumCard[];
  onOpenCurrentCourse: () => void;
  onOpenDownloadedLessons?: () => void;
  onOpenSettings: () => void;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileName,
  progressPercent,
  progressLabel,
  profileText,
  currentCourseCode,
  downloadedLessonsCount = 0,
  albumCards = [],
  onOpenCurrentCourse,
  onOpenDownloadedLessons,
  onOpenSettings,
}) => {
  const [bookShelf, setBookShelf] = React.useState<'all' | 'downloaded'>('all');
  const normalizedProgress = Number.isFinite(progressPercent)
    ? Math.min(100, Math.max(0, progressPercent))
    : 0;
  const visualProgress = normalizedProgress > 0 ? normalizedProgress : 2;
  const visibleAlbumCards = bookShelf === 'downloaded'
    ? albumCards.filter((card) => card.downloadedUnitCount > 0)
    : albumCards;

  const listDividerClass = 'border-t border-[var(--border-subtle)]';

  return (
    <div className={`${VIEW_PAGE_CLASS} space-y-4 md:px-0`}>
      <section>
        <div>
          <div className="flex items-start justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 btn-selected text-2xl font-extrabold">
                U
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">{profileText.welcomeBackTitle}</h2>
                <p className={`${VIEW_BODY_TEXT_CLASS} font-semibold`}>{profileName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className={BUTTON_UI.iconNavButton}
              aria-label={profileText.openSettingsAriaLabel}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </button>
          </div>
          <div className={listDividerClass} />
          <div className="py-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-ink-subtle">
              <span>{progressLabel}</span>
              <span>{normalizedProgress}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border border-brand-border bg-brand-track">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${visualProgress}%`,
                  minWidth: '10px',
                  opacity: 1,
                  background:
                    'linear-gradient(90deg, var(--dark-accent-primary, var(--color-brand)), var(--dark-accent-primary, var(--color-brand-dark)))',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBookShelf('all')}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                bookShelf === 'all'
                  ? 'border-[var(--border-strong)] bg-[var(--surface-active)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <p className="truncate text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
                {profileText.currentCourseLabel}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-ink">{currentCourseCode}</p>
            </button>
            <button
              type="button"
              onClick={() => setBookShelf('downloaded')}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                bookShelf === 'downloaded'
                  ? 'border-[var(--border-strong)] bg-[var(--surface-active)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <p className="truncate text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
                {profileText.downloadedLessonsLabel}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">{Math.max(0, downloadedLessonsCount).toLocaleString()}</p>
            </button>
          </div>

          {visibleAlbumCards.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:grid-cols-6 md:gap-2">
              {visibleAlbumCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={card.onOpen}
                  aria-label={`${card.title} ${card.meta}`}
                  className="overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-left transition-transform hover:scale-[1.01] active:scale-[0.99] rounded-none md:rounded-xl"
                >
                  <div className="relative aspect-[3/4]">
                    {card.coverUrl ? (
                      <img
                        src={card.coverUrl}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-br from-[var(--surface-active)] via-[var(--surface-subtle)] to-[var(--surface-default)]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <p className="truncate text-xs font-extrabold tracking-tight text-white">{card.title}</p>
                      <p className="truncate text-[11px] font-semibold text-white/90">{card.meta}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-1 py-3 text-sm font-semibold text-[var(--text-muted)]">
              {profileText.downloadedLessonsLabel}: 0
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

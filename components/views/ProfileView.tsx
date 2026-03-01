import React from 'react';
import type { DefaultLanguage } from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { localizeLibraryTopic } from '../../config/libraryI18n';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_PAGE_CLASS,
} from './viewShared';
import { BUTTON_UI } from '../../config/buttonUi';
import { AppTextPack } from '../../config/appI18n';
import type { AlbumUnitEntry } from './library/libraryTypes';
import { LIBRARY_STATE_STYLE } from './library/libraryUiTokens';
import { TrackActionSheet } from './library/TrackActionSheet';
import { UnitRow } from './library/UnitRow';
import { getMobileNavIconWrapClass } from '../../config/buttonUi';
import { useAnchoredMenu } from './library/useAnchoredMenu';

const PROFILE_CARD_ICON_CLASS = 'h-[22px] w-[22px]';
const PROFILE_CARD_ICON_STROKE = 1.9;

const CurrentCourseIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className={PROFILE_CARD_ICON_CLASS}
    fill="none"
    stroke="currentColor"
    strokeWidth={PROFILE_CARD_ICON_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M13 2 5 13h6l-1 9 9-13h-6z" />
  </svg>
);

const BookmarkedAlbumsIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className={PROFILE_CARD_ICON_CLASS}
    fill="none"
    stroke="currentColor"
    strokeWidth={PROFILE_CARD_ICON_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

const BookmarkedLessonsIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className={PROFILE_CARD_ICON_CLASS}
    fill="none"
    stroke="currentColor"
    strokeWidth={PROFILE_CARD_ICON_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3h12v18l-6-4-6 4z" />
    <path d="M9 8.5h6" />
    <path d="M9 11.5h5" />
    <path d="M9 14.5h4" />
  </svg>
);

type ProfileAlbumCard = {
  key: string;
  title: string;
  meta: string;
  coverUrl: string | null;
  totalUnitCount: number;
  bookmarkedUnitCount: number;
  isCurrentCourse: boolean;
  isBookmarked: boolean;
  onOpen: () => void;
};

type ProfileBookmarkedLessonRow = {
  key: string;
  albumKey: string | null;
  entry: AlbumUnitEntry;
  isCompleted: boolean;
  isBookmarked: boolean;
  onPlay: () => void;
  onOpen: () => void;
  onToggleBookmark: () => void;
};

type ProfileViewProps = {
  profileName: string;
  progressPercent: number;
  progressLabel: string;
  profileText: AppTextPack['profile'];
  defaultLanguage: DefaultLanguage;
  unitPrefixLabel: string;
  activeUnitKey?: string;
  currentCourseCode: string;
  bookmarkedAlbumsCount?: number;
  bookmarkedLessonsCount?: number;
  bookmarkedLessonRows?: ProfileBookmarkedLessonRow[];
  albumCards?: ProfileAlbumCard[];
  onOpenSettings: () => void;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileName,
  progressPercent,
  progressLabel,
  profileText,
  defaultLanguage,
  unitPrefixLabel,
  activeUnitKey,
  currentCourseCode,
  bookmarkedAlbumsCount = 0,
  bookmarkedLessonsCount = 0,
  bookmarkedLessonRows = [],
  albumCards = [],
  onOpenSettings,
}) => {
  const libraryText = getAppText(defaultLanguage).library;
  const [bookShelf, setBookShelf] = React.useState<'current_course' | 'bookmarked_albums' | 'bookmarked_lessons'>('current_course');
  const {
    activeItem: activeActionTrack,
    isOpen: isTrackActionMenuOpen,
    openMenu: openTrackActionMenu,
    closeMenu: closeTrackActionMenu,
  } = useAnchoredMenu<ProfileBookmarkedLessonRow>();
  const normalizedProgress = Number.isFinite(progressPercent)
    ? Math.min(100, Math.max(0, progressPercent))
    : 0;
  const visualProgress = normalizedProgress > 0 ? normalizedProgress : 2;
  const currentCourseAlbumCards = albumCards.filter((card) => card.isCurrentCourse);
  const bookmarkedAlbumCards = albumCards.filter((card) => card.isBookmarked);
  const visibleAlbumCards = bookShelf === 'current_course' ? currentCourseAlbumCards : bookmarkedAlbumCards;
  const activeTrackUnitCode = activeActionTrack
    ? `${Math.max(1, activeActionTrack.entry.level)}.${Math.max(1, activeActionTrack.entry.unit)}`
    : '';

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
          <div className="mb-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setBookShelf('current_course')}
              aria-label={profileText.currentCourseLabel}
              title={`${profileText.currentCourseLabel}: ${currentCourseCode}`}
              className={`h-12 rounded-xl border px-3 text-left transition-colors ${
                bookShelf === 'current_course'
                  ? 'border-[var(--border-strong)] bg-[var(--surface-active)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className={getMobileNavIconWrapClass(bookShelf === 'current_course')}>
                  <CurrentCourseIcon />
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setBookShelf('bookmarked_albums')}
              aria-label={profileText.downloadedLessonsLabel}
              title={`${profileText.downloadedLessonsLabel}: ${Math.max(0, bookmarkedAlbumsCount).toLocaleString()}`}
              className={`h-12 rounded-xl border px-3 text-left transition-colors ${
                bookShelf === 'bookmarked_albums'
                  ? 'border-[var(--border-strong)] bg-[var(--surface-active)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className={getMobileNavIconWrapClass(bookShelf === 'bookmarked_albums')}>
                  <BookmarkedAlbumsIcon />
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setBookShelf('bookmarked_lessons')}
              aria-label={profileText.downloadedUnitsTracksLabel}
              title={`${profileText.downloadedUnitsTracksLabel}: ${Math.max(0, bookmarkedLessonsCount).toLocaleString()}`}
              className={`h-12 rounded-xl border px-3 text-left transition-colors ${
                bookShelf === 'bookmarked_lessons'
                  ? 'border-[var(--border-strong)] bg-[var(--surface-active)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className={getMobileNavIconWrapClass(bookShelf === 'bookmarked_lessons')}>
                  <BookmarkedLessonsIcon />
                </span>
              </div>
            </button>
          </div>

          {bookShelf === 'bookmarked_lessons' ? (
            bookmarkedLessonRows.length > 0 ? (
              <div className="divide-y divide-[var(--border-subtle)]">
                {bookmarkedLessonRows.map((track) => (
                  <UnitRow
                    key={track.key}
                    entry={track.entry}
                    albumKey={track.albumKey}
                    unitPrefixLabel={unitPrefixLabel}
                    defaultLanguage={defaultLanguage}
                    activeUnitKey={activeUnitKey}
                    isCompleted={track.isCompleted}
                    badgeDefaultClass={LIBRARY_STATE_STYLE.badgeDefault}
                    badgeActiveClass={LIBRARY_STATE_STYLE.badgeActive}
                    badgeCompletedClass={LIBRARY_STATE_STYLE.badgeCompleted}
                    accentClass="text-[var(--text-muted)]"
                    actionButtonMode="menu"
                    onPlayUnit={() => track.onPlay()}
                    onOpenUnit={() => track.onOpen()}
                    onOpenActionMenu={() => openTrackActionMenu(track)}
                  />
                ))}
              </div>
            ) : (
              <p className="px-1 py-3 text-sm font-semibold text-[var(--text-muted)]">
                {profileText.downloadedUnitsTracksLabel}: 0
              </p>
            )
          ) : visibleAlbumCards.length > 0 ? (
            <div className="grid grid-cols-3 gap-0 md:grid-cols-6 md:gap-2">
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
              {bookShelf === 'bookmarked_albums'
                ? `${profileText.downloadedLessonsLabel}: 0`
                : `${profileText.currentCourseLabel}: 0`}
            </p>
          )}
        </div>
      </section>

      <TrackActionSheet
        isOpen={isTrackActionMenuOpen}
        closeAriaLabel={libraryText.backToAlbumsAriaLabel}
        trackTitle={activeActionTrack ? localizeLibraryTopic(activeActionTrack.entry.topic, defaultLanguage) : ''}
        trackUnitCode={activeTrackUnitCode}
        openLessonLabel={libraryText.openLessonTitle}
        onClose={closeTrackActionMenu}
        onOpenLesson={() => {
          if (!activeActionTrack) return;
          activeActionTrack.onOpen();
          closeTrackActionMenu();
        }}
        onToggleBookmark={() => {
          if (!activeActionTrack) return;
          activeActionTrack.onToggleBookmark();
          closeTrackActionMenu();
        }}
        isBookmarked={activeActionTrack?.isBookmarked ?? false}
      />
    </div>
  );
};

import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { getAppText } from '../../../config/appI18n';
import { localizeLibraryTopic } from '../../../config/libraryI18n';
import { VIEW_PAGE_CLASS } from '../viewShared';
import type { AlbumGroup, AlbumUnitEntry } from './libraryTypes';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';
import { TrackActionSheet } from './TrackActionSheet';
import { UnitRow } from './UnitRow';
import { BUTTON_UI } from '../../../config/buttonUi';

type AlbumDetailProps = {
  album: AlbumGroup;
  albumKey: string | null;
  albumTitle: string;
  playAllLabel: string;
  unitPrefixLabel: string;
  defaultLanguage: DefaultLanguage;
  activeUnitKey?: string;
  completedUnitKeys?: Set<string>;
  accentClass: string;
  badgeDefaultClass: string;
  badgeActiveClass: string;
  badgeCompletedClass: string;
  onBack: () => void;
  onPlayAlbum?: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  onPlayUnit?: (level: number, unit: number, albumKey?: string | null) => void;
  onOpenUnit: (level: number, unit: number, albumKey?: string | null) => void;
  isUnitBookmarked?: (level: number, unit: number) => boolean;
  onToggleUnitBookmark?: (level: number, unit: number) => void;
  isAlbumBookmarked?: boolean;
  onToggleAlbumBookmark?: () => void;
  formatAlbumMeta: (group: AlbumGroup) => string;
  onTouchStart: React.TouchEventHandler<HTMLElement>;
  onTouchMove: React.TouchEventHandler<HTMLElement>;
  onTouchEnd: React.TouchEventHandler<HTMLElement>;
  onTouchCancel: React.TouchEventHandler<HTMLElement>;
};

export const AlbumDetail: React.FC<AlbumDetailProps> = ({
  album,
  albumKey,
  albumTitle,
  playAllLabel,
  unitPrefixLabel,
  defaultLanguage,
  activeUnitKey,
  completedUnitKeys,
  accentClass,
  badgeDefaultClass,
  badgeActiveClass,
  badgeCompletedClass,
  onBack,
  onPlayAlbum,
  onPlayUnit,
  onOpenUnit,
  isUnitBookmarked,
  onToggleUnitBookmark,
  isAlbumBookmarked = false,
  onToggleAlbumBookmark,
  formatAlbumMeta,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
}) => {
  const libraryText = getAppText(defaultLanguage).library;
  const [activeActionUnit, setActiveActionUnit] = React.useState<AlbumUnitEntry | null>(null);
  const activeUnitCode = activeActionUnit ? `${Math.max(1, activeActionUnit.level)}.${Math.max(1, activeActionUnit.unit)}` : '';
  const isActionUnitBookmarked = activeActionUnit
    ? Boolean(isUnitBookmarked?.(activeActionUnit.level, activeActionUnit.unit))
    : false;

  const closeActionMenu = () => setActiveActionUnit(null);

  const handleOpenActionMenu = (level: number, unit: number) => {
    const target = album.units.find((entry) => entry.level === level && entry.unit === unit) || null;
    setActiveActionUnit(target);
  };

  const handleToggleBookmark = () => {
    if (!activeActionUnit) return;
    onToggleUnitBookmark?.(activeActionUnit.level, activeActionUnit.unit);
    closeActionMenu();
  };

  const handleOpenLesson = () => {
    if (!activeActionUnit) return;
    onOpenUnit(activeActionUnit.level, activeActionUnit.unit, albumKey);
    closeActionMenu();
  };

  return (
    <div
      className={VIEW_PAGE_CLASS}
      data-testid="album-detail-view"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className={LIBRARY_UI_TOKENS.searchWrap}>
        <div className="top-toolbar-row flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              aria-label={libraryText.backToAlbumsAriaLabel}
              className={`${BUTTON_UI.iconNavButton} ${BUTTON_UI.iconNavGlyph}`}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <p className="truncate text-sm font-semibold text-ink-strong md:text-base">{albumTitle}</p>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden ${LIBRARY_UI_TOKENS.sectionWrap}`}>
        <div className="border-b border-[var(--border-subtle)] px-0 py-2.5">
          <div className="flex items-center gap-3">
            <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
              <div className="absolute inset-y-0 left-0 z-10 w-2 bg-black/12" aria-hidden="true" />
              <img
                src={album.coverUrl}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight text-ink-strong">{albumTitle}</h3>
              <p className="mt-0.5 text-sm font-semibold text-ink-muted">{formatAlbumMeta(album)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onPlayAlbum?.(
                      album.units.map((entry) => ({ level: entry.level, unit: entry.unit })),
                      albumKey,
                    )
                  }
                  className={LIBRARY_UI_TOKENS.iconButton}
                  aria-label={playAllLabel}
                  title={playAllLabel}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 7.5v9l7-4.5z" fill="currentColor" stroke="none" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={onToggleAlbumBookmark}
                  className={isAlbumBookmarked
                    ? `${BUTTON_UI.iconCircleButtonBase} ${BUTTON_UI.iconCircleButtonActive}`
                    : LIBRARY_UI_TOKENS.iconButton}
                  aria-label="Bookmark album"
                  title="Bookmark album"
                >
                  {isAlbumBookmarked ? (
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
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {album.units.map((entry) => (
            <UnitRow
              key={`${entry.stage}-${entry.level}-${entry.unit}`}
              entry={entry}
              albumKey={albumKey}
              unitPrefixLabel={unitPrefixLabel}
              defaultLanguage={defaultLanguage}
              activeUnitKey={activeUnitKey}
              isCompleted={completedUnitKeys?.has(`${entry.level}:${entry.unit}`) ?? false}
              badgeDefaultClass={badgeDefaultClass}
              badgeActiveClass={badgeActiveClass}
              badgeCompletedClass={badgeCompletedClass}
              accentClass={accentClass}
              actionButtonMode="menu"
              onPlayUnit={onPlayUnit}
              onOpenUnit={onOpenUnit}
              onOpenActionMenu={handleOpenActionMenu}
            />
          ))}
        </div>
      </div>

      <TrackActionSheet
        isOpen={Boolean(activeActionUnit)}
        closeAriaLabel={libraryText.backToAlbumsAriaLabel}
        trackTitle={activeActionUnit ? localizeLibraryTopic(activeActionUnit.topic, defaultLanguage) : ''}
        trackUnitCode={activeUnitCode}
        openLessonLabel={libraryText.openLessonTitle}
        onClose={closeActionMenu}
        onOpenLesson={handleOpenLesson}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={isActionUnitBookmarked}
      />
    </div>
  );
};

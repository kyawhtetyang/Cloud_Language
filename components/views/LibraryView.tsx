import React, { useState } from 'react';
import { LessonData } from '../../types';
import {
  DEFAULT_LIBRARY_VIEW_MODE,
  DefaultLanguage,
  LearnLanguage,
  LibraryViewMode,
  StageCode,
} from '../../config/appConfig';
import { getLibraryText, localizeLibraryTopic } from '../../config/libraryI18n';
import { getAppText } from '../../config/appI18n';
import { VIEW_PAGE_CLASS } from './viewShared';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { AlbumHeader } from './library/AlbumHeader';
import { AlbumList } from './library/AlbumList';
import { AlbumDetail } from './library/AlbumDetail';
import { LIBRARY_STATE_STYLE } from './library/libraryUiTokens';
import type { AlbumGroup } from './library/libraryTypes';
import { getIconCircleButtonClass } from '../../config/buttonUi';
import { buildLibraryUnitKey, useLibraryCollections } from './library/useLibraryCollections';

type LibraryViewProps = {
  lessons: LessonData[];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  onSelectUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onReadAlbum?: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  selectedAlbumKey?: string | null;
  viewMode?: LibraryViewMode;
  onSelectedAlbumKeyChange?: (key: string | null) => void;
  completedUnitKeys?: Set<string>;
  activeUnitKey?: string;
  downloadedUnitKeys?: Set<string>;
  isUnitDownloading?: (level: number, unit: number) => boolean;
  onDownloadUnit?: (level: number, unit: number) => Promise<void> | void;
  onRemoveUnitDownload?: (level: number, unit: number) => Promise<void> | void;
};

function shortenLabel(text: string, max = 56): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

async function handleAlbumDownloadAction(
  group: AlbumGroup,
  downloadedUnitKeys: Set<string> | undefined,
  isGroupDownloaded: boolean,
  onDownloadUnit?: (level: number, unit: number) => Promise<void> | void,
  onRemoveUnitDownload?: (level: number, unit: number) => Promise<void> | void,
): Promise<void> {
  if (!onDownloadUnit) return;

  if (isGroupDownloaded && onRemoveUnitDownload) {
    await Promise.all(
      group.units.map((entry) => Promise.resolve(onRemoveUnitDownload(entry.level, entry.unit))),
    );
    return;
  }

  const pendingEntries = group.units.filter(
    (entry) => !downloadedUnitKeys?.has(buildLibraryUnitKey(entry.level, entry.unit)),
  );
  await Promise.all(
    pendingEntries.map((entry) => Promise.resolve(onDownloadUnit(entry.level, entry.unit))),
  );
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  lessons,
  defaultLanguage,
  learnLanguage,
  onSelectUnit,
  onReadAlbum,
  selectedAlbumKey,
  viewMode = DEFAULT_LIBRARY_VIEW_MODE,
  onSelectedAlbumKeyChange,
  completedUnitKeys,
  activeUnitKey,
  downloadedUnitKeys,
  isUnitDownloading,
  onDownloadUnit,
  onRemoveUnitDownload,
}) => {
  const [internalSelectedAlbumKey, setInternalSelectedAlbumKey] = useState<string | null>(null);
  const [libraryQuery, setLibraryQuery] = useState('');
  const activeSelectedAlbumKey = selectedAlbumKey === undefined ? internalSelectedAlbumKey : selectedAlbumKey;
  const setSelectedAlbumKey = (key: string | null) => {
    if (onSelectedAlbumKeyChange) {
      onSelectedAlbumKeyChange(key);
      return;
    }
    setInternalSelectedAlbumKey(key);
  };

  const text = getLibraryText(defaultLanguage);
  const appText = getAppText(defaultLanguage);
  const libraryText = appText.library;
  const playAllLabel = libraryText.playAllLabel;

  const {
    filteredCollectionSections,
    hasFilteredResults,
    selectedAlbum,
  } = useLibraryCollections({
    lessons,
    defaultLanguage,
    learnLanguage,
    viewMode,
    downloadedUnitKeys,
    selectedAlbumKey: activeSelectedAlbumKey,
    libraryQuery,
    collectionFallbackPrefix: libraryText.collectionFallbackPrefix,
    untitledSourceLabel: libraryText.untitledSourceLabel,
  });

  const albumSwipeBackHandlers = useSwipeBack(
    selectedAlbum ? () => setSelectedAlbumKey(null) : null,
  );

  const formatUnitCode = (level: number, unit: number): string => (
    `${Math.max(1, level)}.${Math.max(1, unit)}`
  );

  const formatAlbumMeta = (stage: StageCode, groupIndex: number, unitCount: number, group?: AlbumGroup): string => {
    if (group && group.units.length > 0) {
      const first = group.units[0];
      const last = group.units[group.units.length - 1];
      return `${formatUnitCode(first.level, first.unit)}–${formatUnitCode(last.level, last.unit)}`;
    }
    const unitWord = unitCount === 1 ? libraryText.unitSingularLabel : libraryText.unitPluralLabel;
    return `${stage} · G${groupIndex + 1} (${unitCount} ${unitWord})`;
  };

  const renderDownloadButton = (group: AlbumGroup) => {
    if (!onDownloadUnit) return null;

    const groupUnitKeys = group.units.map((entry) => buildLibraryUnitKey(entry.level, entry.unit));
    const downloadedCount = groupUnitKeys.filter((key) => downloadedUnitKeys?.has(key)).length;
    const isGroupDownloaded = downloadedCount === group.units.length && group.units.length > 0;
    const isGroupPartial = downloadedCount > 0 && downloadedCount < group.units.length;
    const isGroupDownloading = group.units.some((entry) => Boolean(isUnitDownloading?.(entry.level, entry.unit)));
    const groupDownloadLabel = isGroupDownloading
      ? libraryText.downloadingLabel
      : isGroupDownloaded
        ? libraryText.offlineReadyLabel
        : isGroupPartial
          ? libraryText.downloadedLabel
          : libraryText.downloadLabel;

    return (
      <button
        type="button"
        onClick={() => {
          if (isGroupDownloaded && onRemoveUnitDownload) {
            const shouldRemove = window.confirm(libraryText.removeDownloadedConfirmMessage);
            if (!shouldRemove) return;
          }
          void handleAlbumDownloadAction(group, downloadedUnitKeys, isGroupDownloaded, onDownloadUnit, onRemoveUnitDownload);
        }}
        disabled={isGroupDownloading}
        aria-label={groupDownloadLabel}
        title={groupDownloadLabel}
        className={getIconCircleButtonClass(
          isGroupDownloading
            ? 'loading'
            : (isGroupDownloaded || isGroupPartial)
              ? 'active'
              : 'default',
        )}
      >
        {isGroupDownloading ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : isGroupDownloaded ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path d="M20 7L10 17l-6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : isGroupPartial ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path d="M4 12h16M12 4v16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    );
  };

  if (selectedAlbum) {
    const albumTitle = shortenLabel(localizeLibraryTopic(selectedAlbum.firstTopicConcise, defaultLanguage), 58);

    return (
      <AlbumDetail
        album={selectedAlbum}
        albumKey={activeSelectedAlbumKey}
        albumTitle={albumTitle}
        playAllLabel={playAllLabel}
        unitPrefixLabel={text.unitPrefix}
        defaultLanguage={defaultLanguage}
        activeUnitKey={activeUnitKey}
        completedUnitKeys={completedUnitKeys}
        accentClass="text-[var(--text-muted)]"
        badgeDefaultClass={LIBRARY_STATE_STYLE.badgeDefault}
        badgeActiveClass={LIBRARY_STATE_STYLE.badgeActive}
        badgeCompletedClass={LIBRARY_STATE_STYLE.badgeCompleted}
        onBack={() => setSelectedAlbumKey(null)}
        onPlayAlbum={onReadAlbum}
        onPlayUnit={(level, unit, albumKey) => onReadAlbum?.([{ level, unit }], albumKey)}
        onOpenUnit={onSelectUnit}
        renderDownloadButton={renderDownloadButton}
        formatAlbumMeta={(group) =>
          formatAlbumMeta(group.stage, group.groupIndex, group.units.length, group)
        }
        onTouchStart={albumSwipeBackHandlers.onTouchStart}
        onTouchMove={albumSwipeBackHandlers.onTouchMove}
        onTouchEnd={albumSwipeBackHandlers.onTouchEnd}
        onTouchCancel={albumSwipeBackHandlers.onTouchCancel}
      />
    );
  }

  return (
    <div className={VIEW_PAGE_CLASS}>
      <AlbumHeader
        query={libraryQuery}
        defaultLanguage={defaultLanguage}
        onQueryChange={setLibraryQuery}
      />

      {!hasFilteredResults && (
        <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-4 text-sm text-[var(--text-secondary)]">
          {libraryText.noAlbumsMatch}
        </div>
      )}

      <AlbumList
        sections={filteredCollectionSections}
        defaultLanguage={defaultLanguage}
        onOpenAlbum={setSelectedAlbumKey}
        formatAlbumMeta={(group) =>
          formatAlbumMeta(group.stage, group.groupIndex, group.units.length, group)
        }
      />
    </div>
  );
};

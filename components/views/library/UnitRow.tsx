import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { localizeRoadmapTopic } from '../../../config/roadmapI18n';
import type { AlbumUnitEntry } from './libraryTypes';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';

type UnitRowProps = {
  entry: AlbumUnitEntry;
  albumKey: string | null;
  unitPrefixLabel: string;
  defaultLanguage: DefaultLanguage;
  activeUnitKey?: string;
  isCompleted: boolean;
  badgeDefaultClass: string;
  badgeActiveClass: string;
  badgeCompletedClass: string;
  accentClass: string;
  onPlayUnit?: (level: number, unit: number, albumKey?: string | null) => void;
  onOpenUnit: (level: number, unit: number, albumKey?: string | null) => void;
};

function formatUnitCode(level: number, unit: number): string {
  return `${Math.max(1, level)}.${Math.max(1, unit)}`;
}

export const UnitRow: React.FC<UnitRowProps> = ({
  entry,
  albumKey,
  unitPrefixLabel,
  defaultLanguage,
  activeUnitKey,
  isCompleted,
  badgeDefaultClass,
  badgeActiveClass,
  badgeCompletedClass,
  accentClass,
  onPlayUnit,
  onOpenUnit,
}) => {
  const unitKey = `${entry.level}:${entry.unit}`;
  const isActive = activeUnitKey === unitKey;
  const badgeClass = isActive
    ? badgeActiveClass
    : isCompleted
      ? badgeCompletedClass
      : badgeDefaultClass;

  return (
    <div
      onClick={() => onPlayUnit?.(entry.level, entry.unit, albumKey)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onPlayUnit?.(entry.level, entry.unit, albumKey);
      }}
      role="button"
      tabIndex={0}
      className={`${LIBRARY_UI_TOKENS.unitRowBase} ${isActive ? LIBRARY_UI_TOKENS.unitRowActive : ''}`}
    >
      <div className="grid w-full grid-cols-[auto,1fr,20px] items-center gap-2">
        <div
          className={`inline-flex h-7 min-w-[46px] items-center justify-center rounded-md px-1.5 text-[11px] font-bold ${badgeClass}`}
        >
          <span aria-label={isCompleted ? 'Completed unit' : `${unitPrefixLabel} ${formatUnitCode(entry.level, entry.unit)}`}>
            {isCompleted ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M20 7L10 17l-6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              formatUnitCode(entry.level, entry.unit)
            )}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-ink">
            {localizeRoadmapTopic(entry.topic, defaultLanguage)}
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenUnit(entry.level, entry.unit, albumKey);
          }}
          className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${accentClass} hover:bg-[var(--surface-hover)]`}
          aria-label={`Open lesson ${formatUnitCode(entry.level, entry.unit)}`}
          title="Open lesson"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

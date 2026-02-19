import React from 'react';
import { LessonData } from '../../types';
import {
  buildStageUnitsFromLessons,
  DefaultLanguage,
  STAGE_META,
  STAGE_ORDER,
  StageCode,
} from '../../config/appConfig';
import { getRoadmapText, localizeRoadmapTopic } from '../../config/roadmapI18n';

type LevelsViewProps = {
  lessons: LessonData[];
  defaultLanguage: DefaultLanguage;
  onSelectUnit: (level: number, unit: number) => void;
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

function chunkUnits<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildUnitKey(level: number, unit: number): string {
  return `${level}:${unit}`;
}

export const LevelsView: React.FC<LevelsViewProps> = ({
  lessons,
  defaultLanguage,
  onSelectUnit,
  completedUnitKeys,
  activeUnitKey,
  downloadedUnitKeys,
  isUnitDownloading,
  onDownloadUnit,
  onRemoveUnitDownload,
}) => {
  const text = getRoadmapText(defaultLanguage);
  const stageUnits = buildStageUnitsFromLessons(lessons);
  const unitsByStage = STAGE_ORDER.reduce<Record<StageCode, typeof stageUnits>>((acc, stage) => {
    acc[stage] = stageUnits.filter((item) => item.stage === stage);
    return acc;
  }, { A1: [], A2: [], B1: [], B2: [] });

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#3c3c3c] mb-4">{text.roadmap}</h2>

      {STAGE_ORDER.map((stage) => {
        const stageRows = unitsByStage[stage];
        if (stageRows.length === 0) return null;
        const stageUi = STAGE_META[stage];
        const groupedStageRows = chunkUnits(stageRows, 5);

        return (
          <div key={stage} className="mb-5 last:mb-0">
            <p className={`text-sm md:text-base font-extrabold uppercase tracking-wide mb-2 ${stageUi.titleClass}`}>
              {text.stageLabels[stage]}
            </p>
            <div className="space-y-3">
                      {groupedStageRows.map((group, groupIndex) => {
                const groupUnitKeys = group.map((entry) => buildUnitKey(entry.level, entry.unit));
                const downloadedCount = groupUnitKeys.filter((key) => downloadedUnitKeys?.has(key)).length;
                const isGroupDownloaded = downloadedCount === group.length && group.length > 0;
                const isGroupPartial = downloadedCount > 0 && downloadedCount < group.length;
                const isGroupDownloading = group.some((entry) =>
                  Boolean(isUnitDownloading?.(entry.level, entry.unit)),
                );
                const groupDownloadLabel = isGroupDownloading
                  ? 'Downloading group'
                  : isGroupDownloaded
                    ? 'Group downloaded'
                    : isGroupPartial
                      ? 'Download remaining units in group'
                      : 'Download group';
                const firstTopic = group[0]
                  ? localizeRoadmapTopic(group[0].topic, defaultLanguage)
                  : '';
                return (
                  <div
                    key={`${stage}-group-${groupIndex}`}
                    className={`w-full rounded-xl border-2 px-3 py-2.5 ${stageUi.levelCardClass}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className={`text-sm md:text-[15px] font-extrabold uppercase tracking-wide ${stageUi.titleClass}`}>
                        {shortenLabel(firstTopic)}
                      </p>
                      {onDownloadUnit && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (isGroupDownloaded && onRemoveUnitDownload) {
                              const shouldRemove = window.confirm(
                                'Remove downloaded offline lessons for this group?',
                              );
                              if (!shouldRemove) return;
                              await Promise.all(
                                group.map((entry) =>
                                  Promise.resolve(onRemoveUnitDownload(entry.level, entry.unit)),
                                ),
                              );
                              return;
                            }

                            const pendingEntries = group.filter(
                              (entry) => !downloadedUnitKeys?.has(buildUnitKey(entry.level, entry.unit)),
                            );
                            await Promise.all(
                              pendingEntries.map((entry) =>
                                Promise.resolve(onDownloadUnit(entry.level, entry.unit)),
                              ),
                            );
                          }}
                          disabled={isGroupDownloading}
                          aria-label={groupDownloadLabel}
                          title={groupDownloadLabel}
                          className={`shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-full border transition-all ${
                            isGroupDownloaded
                              ? 'border-[#46a302] bg-[#f0ffe0] text-[#2f7d01]'
                              : isGroupPartial
                                ? 'border-[#f59e0b] bg-[#fff7e8] text-[#a16207]'
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                          } ${isGroupDownloading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                          {isGroupDownloading ? (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="w-4 h-4 animate-spin"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                opacity="0.25"
                              />
                              <path
                                d="M12 3a9 9 0 0 1 9 9"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : isGroupDownloaded ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                              <path
                                d="M20 7L10 17l-6-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : isGroupPartial ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                              <path
                                d="M4 12h16M12 4v16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                              <path
                                d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="mt-1 space-y-2">
                      {group.map((entry) => {
                        const unitKey = buildUnitKey(entry.level, entry.unit);
                        const isCompleted = completedUnitKeys?.has(unitKey) ?? false;
                        const isActive = activeUnitKey === unitKey;
                        const topicCardClass = isCompleted
                          ? 'border-gray-300 bg-gray-100 text-gray-500'
                          : isActive
                            ? 'border-[#46a302] bg-[#f0ffe0] text-[#2f7d01]'
                            : `${stageUi.topicCardClass} text-gray-700`;
                        const badgeClass = isCompleted
                          ? 'bg-gray-200 text-gray-500'
                          : isActive
                            ? 'bg-[#d9f8b7] text-[#2f7d01]'
                            : stageUi.badgeClass;

                        return (
                        <div
                          key={`${entry.stage}-${entry.level}-${entry.unit}`}
                          className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm md:text-[15px] font-bold transition-all ${topicCardClass}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectUnit(entry.level, entry.unit)}
                              className="w-full text-left"
                            >
                              <span
                                className={`inline-flex items-center justify-center h-4 px-1.5 rounded-md text-[9px] font-extrabold mr-1.5 ${badgeClass}`}
                                aria-label={`${text.unitPrefix} ${entry.stageUnitNumber}`}
                            >
                              {entry.stageUnitNumber}
                            </span>
                            {localizeRoadmapTopic(entry.topic, defaultLanguage)}
                          </button>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

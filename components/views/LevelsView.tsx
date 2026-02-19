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

export const LevelsView: React.FC<LevelsViewProps> = ({ lessons, defaultLanguage, onSelectUnit }) => {
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
                const firstTopic = group[0]
                  ? localizeRoadmapTopic(group[0].topic, defaultLanguage)
                  : '';
                return (
                  <div
                    key={`${stage}-group-${groupIndex}`}
                    className={`w-full rounded-xl border-2 px-3 py-2.5 ${stageUi.levelCardClass}`}
                  >
                    <div className="mb-2">
                      <p className={`text-sm md:text-[15px] font-extrabold uppercase tracking-wide ${stageUi.titleClass}`}>
                        {shortenLabel(firstTopic)}
                      </p>
                    </div>
                    <div className="mt-1 space-y-2">
                      {group.map((entry) => (
                        <button
                          key={`${entry.stage}-${entry.level}-${entry.unit}`}
                          type="button"
                          onClick={() => onSelectUnit(entry.level, entry.unit)}
                          className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm md:text-[15px] font-bold text-gray-700 transition-all ${stageUi.topicCardClass}`}
                        >
                          <span
                            className={`inline-flex items-center justify-center h-4 px-1.5 rounded-md text-[9px] font-extrabold mr-1.5 ${stageUi.badgeClass}`}
                            aria-label={`${text.unitPrefix} ${entry.stageUnitNumber}`}
                          >
                            {entry.stageUnitNumber}
                          </span>
                          {localizeRoadmapTopic(entry.topic, defaultLanguage)}
                        </button>
                      ))}
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

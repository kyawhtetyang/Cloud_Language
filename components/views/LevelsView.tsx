import React, { useMemo, useState } from 'react';
import { LessonData } from '../../types';
import {
  buildStageUnitsFromLessons,
  DefaultLanguage,
  getLessonOrderIndex,
  getLessonUnitId,
  LearnLanguage,
  STAGE_ORDER,
  StageCode,
  UNITS_PER_ALBUM,
} from '../../config/appConfig';
import { getRoadmapText, localizeRoadmapTopic, localizeRoadmapTopicConcise } from '../../config/roadmapI18n';

type LevelsViewProps = {
  lessons: LessonData[];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  onSelectUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onReadAlbum?: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  selectedAlbumKey?: string | null;
  onSelectedAlbumKeyChange?: (key: string | null) => void;
  completedUnitKeys?: Set<string>;
  activeUnitKey?: string;
  downloadedUnitKeys?: Set<string>;
  isUnitDownloading?: (level: number, unit: number) => boolean;
  onDownloadUnit?: (level: number, unit: number) => Promise<void> | void;
  onRemoveUnitDownload?: (level: number, unit: number) => Promise<void> | void;
};

type AlbumGroup = {
  key: string;
  stage: StageCode;
  groupIndex: number;
  units: ReturnType<typeof buildStageUnitsFromLessons>[number][];
  firstTopicConcise: string;
  coverUrl: string;
};

type HskCollectionSection = {
  key: string;
  label: string;
  groups: AlbumGroup[];
};

const LIBRARY_HEADER_STYLE = {
  barClass: 'bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]',
  textClass: 'text-[var(--text-secondary)]',
  accentClass: 'text-[var(--text-muted)]',
} as const;

const LIBRARY_STATE_STYLE = {
  rowDefault: 'bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
  rowActive: 'border border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-primary)]',
  rowCompleted: 'bg-[var(--surface-default)] text-[var(--text-muted)]',
  badgeDefault: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]',
  badgeActive: 'border border-[var(--border-strong)] bg-[var(--surface-default)] text-[var(--text-primary)]',
  badgeCompleted: 'bg-[var(--surface-subtle)] text-[var(--text-muted)]',
  downloadDefault: 'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]',
  downloadDone: 'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-secondary)]',
  downloadLoading: 'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-muted)] opacity-70 cursor-wait',
  primaryAction: 'btn-selected',
} as const;

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

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const REAL_PHOTO_POOL = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1515165562835-c3b8c8d1f18f?auto=format&fit=crop&w=600&h=800&q=80',
];

const PHOTO_CATEGORY_POOL: Record<string, string[]> = {
  commerce: [
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&h=800&q=80',
  ],
  family: [
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&h=800&q=80',
  ],
  daily: [
    'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=600&h=800&q=80',
  ],
  map: [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&h=800&q=80',
  ],
  work: [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&h=800&q=80',
  ],
  debate: [
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=600&h=800&q=80',
  ],
};

function getTopicPhotoUrl(topic: string, seed: string): string {
  const lower = topic.toLowerCase();
  let category: keyof typeof PHOTO_CATEGORY_POOL | null = null;
  if (/buy|sell|price|payment|discount|return|exchange|market/.test(lower)) {
    category = 'commerce';
  } else if (/family|friends/.test(lower)) {
    category = 'family';
  } else if (/time|date|daily|weekend|future|past/.test(lower)) {
    category = 'daily';
  } else if (/directions|map/.test(lower)) {
    category = 'map';
  } else if (/meeting|presentation|negotiation|executive|q&a/.test(lower)) {
    category = 'work';
  } else if (/debate|argument|opinions|discussion|viewpoints/.test(lower)) {
    category = 'debate';
  }
  const pool = category ? PHOTO_CATEGORY_POOL[category] : REAL_PHOTO_POOL;
  const pick = stableHash(seed) % pool.length;
  return pool[pick];
}

function getGroupCoverUrl(
  stage: StageCode,
  groupIndex: number,
  topic: string,
  learnLanguage: LearnLanguage,
): string {
  if (/^hsk[1-6]$/i.test(learnLanguage)) {
    return `/api/lesson-cover/${learnLanguage}`;
  }
  return getTopicPhotoUrl(topic, `${stage}:group:${groupIndex + 1}`);
}

function resolveHskLanguageCodeFromCollectionLabel(label: string): LearnLanguage {
  const match = label.match(/hsk\s*([1-6])/i);
  if (!match) return 'hsk1';
  return `hsk${match[1]}` as LearnLanguage;
}

function getConciseTopicTitle(rawTopic: string, defaultLanguage: DefaultLanguage): string {
  return localizeRoadmapTopicConcise(rawTopic, defaultLanguage);
}

function getDisplayAlbumTitle(rawTitle: string, defaultLanguage: DefaultLanguage): string {
  return localizeRoadmapTopic(rawTitle, defaultLanguage);
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
    const shouldRemove = window.confirm('Remove downloaded offline lessons for this group?');
    if (!shouldRemove) return;
    await Promise.all(
      group.units.map((entry) => Promise.resolve(onRemoveUnitDownload(entry.level, entry.unit))),
    );
    return;
  }

  const pendingEntries = group.units.filter(
    (entry) => !downloadedUnitKeys?.has(buildUnitKey(entry.level, entry.unit)),
  );
  await Promise.all(
    pendingEntries.map((entry) => Promise.resolve(onDownloadUnit(entry.level, entry.unit))),
  );
}

export const LevelsView: React.FC<LevelsViewProps> = ({
  lessons,
  defaultLanguage,
  learnLanguage,
  onSelectUnit,
  onReadAlbum,
  selectedAlbumKey,
  onSelectedAlbumKeyChange,
  completedUnitKeys,
  activeUnitKey,
  downloadedUnitKeys,
  isUnitDownloading,
  onDownloadUnit,
  onRemoveUnitDownload,
}) => {
  const isHskSingleLanguage = /^hsk[1-6]$/i.test(learnLanguage);
  // Full backend-driven grouping for all languages.
  const isHskCollectionLanguage = true;
  const isHskLanguage = isHskSingleLanguage || isHskCollectionLanguage;
  const hskStageLabel = isHskSingleLanguage ? `HSK ${learnLanguage.replace(/^hsk/i, '')}` : 'HSK Chinese';
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
  const text = getRoadmapText(defaultLanguage);
  const playAllLabel = defaultLanguage === 'burmese' ? 'အားလုံးဖတ်' : 'Play all';
  const stageUnits = buildStageUnitsFromLessons(lessons);
  const hskCollectionSections = useMemo<HskCollectionSection[]>(() => {
    const byCollection = new Map<string, { sourceOrder: string[]; bySource: Map<string, AlbumGroup['units']> }>();
    for (const lesson of lessons) {
      const level = getLessonOrderIndex(lesson);
      const unit = getLessonUnitId(lesson);
      const collectionLabel = (lesson.collectionLabel || '').trim() || `Collection ${level}`;
      const sourceLabel = (lesson.sourceLabel || '').trim() || 'Untitled';
      if (!byCollection.has(collectionLabel)) {
        byCollection.set(collectionLabel, { sourceOrder: [], bySource: new Map() });
      }
      const collection = byCollection.get(collectionLabel)!;
      if (!collection.bySource.has(sourceLabel)) {
        collection.bySource.set(sourceLabel, []);
        collection.sourceOrder.push(sourceLabel);
      }
      const units = collection.bySource.get(sourceLabel)!;
      if (!units.some((entry) => entry.level === level && entry.unit === unit)) {
        units.push({
          stage: 'A1',
          stageUnitNumber: units.length + 1,
          level,
          unit,
          topic: lesson.topic,
        });
      }
    }
    const collectionLabels = Array.from(byCollection.keys()).sort((a, b) => {
      const aNum = Number((a.match(/^hsk\s*([1-6])$/i)?.[1]) || 0);
      const bNum = Number((b.match(/^hsk\s*([1-6])$/i)?.[1]) || 0);
      if (aNum > 0 && bNum > 0) return aNum - bNum;
      if (aNum > 0) return 1;
      if (bNum > 0) return -1;
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
    return collectionLabels.map((collectionLabel) => {
      const collection = byCollection.get(collectionLabel)!;
      const coverLanguage = /^hsk\s*[1-6]$/i.test(collectionLabel)
        ? resolveHskLanguageCodeFromCollectionLabel(collectionLabel)
        : learnLanguage;
      const groups = collection.sourceOrder.map((sourceLabel, groupIndex) => {
        const units = collection.bySource.get(sourceLabel) || [];
        units.sort((a, b) => (a.level - b.level) || (a.unit - b.unit));
        return {
          key: `hsk-collection-${collectionLabel}-group-${groupIndex}`,
          stage: 'A1' as StageCode,
          groupIndex,
          units,
          firstTopicConcise: sourceLabel,
          coverUrl: getGroupCoverUrl('A1', groupIndex, sourceLabel, coverLanguage),
        };
      });
      return {
        key: collectionLabel.toLowerCase().replace(/\s+/g, '-'),
        label: collectionLabel,
        groups,
      };
    });
  }, [learnLanguage, lessons]);
  const groupsByStage = useMemo(() => {
    if (isHskSingleLanguage) {
      const bySource = new Map<string, AlbumGroup['units']>();
      const sourceOrder: string[] = [];
      for (const lesson of lessons) {
        const sourceLabel = (lesson.sourceLabel || '').trim() || 'Untitled';
        if (!bySource.has(sourceLabel)) {
          bySource.set(sourceLabel, []);
          sourceOrder.push(sourceLabel);
        }
        const bucket = bySource.get(sourceLabel)!;
        const level = getLessonOrderIndex(lesson);
        const unit = getLessonUnitId(lesson);
        if (!bucket.some((entry) => entry.level === level && entry.unit === unit)) {
          bucket.push({
            stage: 'A1',
            stageUnitNumber: bucket.length + 1,
            level,
            unit,
            topic: lesson.topic,
          });
        }
      }
      const hskGroups: AlbumGroup[] = sourceOrder.map((sourceLabel, groupIndex) => {
        const units = bySource.get(sourceLabel) || [];
        units.sort((a, b) => (a.level - b.level) || (a.unit - b.unit));
        return {
          key: `hsk-${learnLanguage}-group-${groupIndex}`,
          stage: 'A1',
          groupIndex,
          units,
          firstTopicConcise: sourceLabel,
          coverUrl: getGroupCoverUrl('A1', groupIndex, sourceLabel, learnLanguage),
        };
      });
      return {
        A1: hskGroups,
        A2: [],
        B1: [],
        B2: [],
      };
    }

    return STAGE_ORDER.reduce<Record<StageCode, AlbumGroup[]>>((acc, stage) => {
      const stageRows = stageUnits.filter((item) => item.stage === stage);
      const grouped = chunkUnits(stageRows, UNITS_PER_ALBUM).map((units, groupIndex) => ({
        key: `${stage}-group-${groupIndex}`,
        stage,
        groupIndex,
        units,
        firstTopicConcise: units[0] ? getConciseTopicTitle(units[0].topic, defaultLanguage) : '',
        coverUrl: getGroupCoverUrl(stage, groupIndex, units[0]?.topic || `${stage} unit`, learnLanguage),
      }));
      acc[stage] = grouped;
      return acc;
    }, { A1: [], A2: [], B1: [], B2: [] });
  }, [defaultLanguage, isHskSingleLanguage, learnLanguage, lessons, stageUnits]);

  const selectedAlbum = useMemo(() => {
    if (!activeSelectedAlbumKey) return null;
    if (isHskCollectionLanguage) {
      for (const section of hskCollectionSections) {
        const found = section.groups.find((group) => group.key === activeSelectedAlbumKey);
        if (found) return found;
      }
      return null;
    }
    for (const stage of STAGE_ORDER) {
      const found = groupsByStage[stage].find((group) => group.key === activeSelectedAlbumKey);
      if (found) return found;
    }
    return null;
  }, [activeSelectedAlbumKey, groupsByStage, hskCollectionSections, isHskCollectionLanguage]);
  const normalizedLibraryQuery = libraryQuery.trim().toLowerCase();
  const filteredGroupsByStage = useMemo(() => {
    if (isHskCollectionLanguage) {
      return { A1: [], A2: [], B1: [], B2: [] } as Record<StageCode, AlbumGroup[]>;
    }
    if (!normalizedLibraryQuery) return groupsByStage;

    return STAGE_ORDER.reduce<Record<StageCode, AlbumGroup[]>>((acc, stage) => {
      acc[stage] = groupsByStage[stage].filter((group) => {
        const localizedGroupTitle = getDisplayAlbumTitle(group.firstTopicConcise, defaultLanguage).toLowerCase();
        if (group.firstTopicConcise.toLowerCase().includes(normalizedLibraryQuery)) return true;
        if (localizedGroupTitle.includes(normalizedLibraryQuery)) return true;
        return group.units.some((unitEntry) => {
          const conciseTopic = getConciseTopicTitle(unitEntry.topic, defaultLanguage).toLowerCase();
          const localizedTopic = localizeRoadmapTopic(unitEntry.topic, defaultLanguage).toLowerCase();
          return conciseTopic.includes(normalizedLibraryQuery) || localizedTopic.includes(normalizedLibraryQuery);
        });
      });
      return acc;
    }, { A1: [], A2: [], B1: [], B2: [] });
  }, [defaultLanguage, groupsByStage, isHskCollectionLanguage, normalizedLibraryQuery]);
  const filteredHskCollectionSections = useMemo(() => {
    if (!normalizedLibraryQuery) return hskCollectionSections;
    return hskCollectionSections
      .map((section) => ({
        ...section,
        groups: section.groups.filter((group) => {
          const localizedGroupTitle = getDisplayAlbumTitle(group.firstTopicConcise, defaultLanguage).toLowerCase();
          if (group.firstTopicConcise.toLowerCase().includes(normalizedLibraryQuery)) return true;
          if (localizedGroupTitle.includes(normalizedLibraryQuery)) return true;
          return group.units.some((unitEntry) => {
            const conciseTopic = getConciseTopicTitle(unitEntry.topic, defaultLanguage).toLowerCase();
            const localizedTopic = localizeRoadmapTopic(unitEntry.topic, defaultLanguage).toLowerCase();
            return conciseTopic.includes(normalizedLibraryQuery) || localizedTopic.includes(normalizedLibraryQuery);
          });
        }),
      }))
      .filter((section) => section.groups.length > 0);
  }, [defaultLanguage, hskCollectionSections, isHskCollectionLanguage, normalizedLibraryQuery]);
  const hasFilteredResults = isHskCollectionLanguage
    ? filteredHskCollectionSections.length > 0
    : STAGE_ORDER.some((stage) => filteredGroupsByStage[stage].length > 0);

  const formatUnitCode = (level: number, unit: number): string => (
    `${Math.max(1, level)}.${Math.max(1, unit)}`
  );

  const formatAlbumMeta = (stage: StageCode, groupIndex: number, unitCount: number, group?: AlbumGroup): string => {
    if (group && group.units.length > 0) {
      const first = group.units[0];
      const last = group.units[group.units.length - 1];
      return `${formatUnitCode(first.level, first.unit)}–${formatUnitCode(last.level, last.unit)}`;
    }
    const unitWord = unitCount === 1 ? 'unit' : 'units';
    return `${stage} · G${groupIndex + 1} (${unitCount} ${unitWord})`;
  };

  const renderDownloadButton = (group: AlbumGroup) => {
    if (!onDownloadUnit) return null;

    const groupUnitKeys = group.units.map((entry) => buildUnitKey(entry.level, entry.unit));
    const downloadedCount = groupUnitKeys.filter((key) => downloadedUnitKeys?.has(key)).length;
    const isGroupDownloaded = downloadedCount === group.units.length && group.units.length > 0;
    const isGroupPartial = downloadedCount > 0 && downloadedCount < group.units.length;
    const isGroupDownloading = group.units.some((entry) => Boolean(isUnitDownloading?.(entry.level, entry.unit)));
    const groupDownloadLabel = isGroupDownloading
      ? 'Downloading'
      : isGroupDownloaded
        ? 'Offline ready'
        : isGroupPartial
          ? 'Downloaded'
          : 'Download';

    return (
      <button
        type="button"
        onClick={() => {
          void handleAlbumDownloadAction(
            group,
            downloadedUnitKeys,
            isGroupDownloaded,
            onDownloadUnit,
            onRemoveUnitDownload,
          );
        }}
        disabled={isGroupDownloading}
        aria-label={groupDownloadLabel}
        title={groupDownloadLabel}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
          isGroupDownloading
            ? 'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-muted)] cursor-wait'
            : (isGroupDownloaded || isGroupPartial)
              ? 'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-secondary)]'
              : 'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
        }`}
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
    const stageHeaderUi = LIBRARY_HEADER_STYLE;
    const albumTitle = shortenLabel(getDisplayAlbumTitle(selectedAlbum.firstTopicConcise, defaultLanguage), 58);

    return (
      <div className="w-full max-w-3xl">
        <div className="mb-3 w-full border-b border-[var(--border-subtle)] pb-2">
          <div className="top-toolbar-row flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAlbumKey(null)}
                aria-label="Back"
                className="top-toolbar-icon inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-base font-normal text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <span aria-hidden="true">←</span>
              </button>
              <p className="truncate text-sm font-normal text-ink-strong md:text-base">
                {albumTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-default)] shadow-sm">
          <div className={`px-3 py-2.5 ${stageHeaderUi.barClass}`}>
            <div className="flex items-center gap-3">
              <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
                <div className="absolute inset-y-0 left-0 z-10 w-2 bg-black/12" aria-hidden="true" />
                <img
                  src={selectedAlbum.coverUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-normal leading-tight text-ink-strong">
                  {albumTitle}
                </h3>
                <p className="mt-0.5 text-sm font-normal text-ink-muted">
                  {formatAlbumMeta(
                    selectedAlbum.stage,
                    selectedAlbum.groupIndex,
                    selectedAlbum.units.length,
                    selectedAlbum,
                  )}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onReadAlbum?.(
                      selectedAlbum.units.map((entry) => ({ level: entry.level, unit: entry.unit })),
                      activeSelectedAlbumKey,
                    )}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
                    aria-label={playAllLabel}
                    title={playAllLabel}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 7.5v9l7-4.5z" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                  {renderDownloadButton(selectedAlbum)}
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {selectedAlbum.units.map((entry) => {
              const unitKey = buildUnitKey(entry.level, entry.unit);
              const isCompleted = completedUnitKeys?.has(unitKey) ?? false;
              const isActive = activeUnitKey === unitKey;
              const badgeClass = isActive
                ? LIBRARY_STATE_STYLE.badgeActive
                : isCompleted
                  ? LIBRARY_STATE_STYLE.badgeCompleted
                  : LIBRARY_STATE_STYLE.badgeDefault;

              return (
                <button
                  key={`${entry.stage}-${entry.level}-${entry.unit}`}
                  type="button"
                  onClick={() => onSelectUnit(entry.level, entry.unit, activeSelectedAlbumKey)}
                  className={`selection-hover w-full min-h-[64px] px-3 py-1.5 text-left transition-colors ${
                    isActive ? 'bg-[var(--surface-active)]' : 'bg-[var(--surface-default)]'
                  }`}
                >
                  <div className="grid grid-cols-[auto,1fr,20px] items-center gap-2">
                    <div className={`inline-flex h-7 min-w-[46px] items-center justify-center rounded-md px-1.5 text-[11px] font-bold ${badgeClass}`}>
                      <span aria-label={isCompleted ? 'Completed unit' : `${text.unitPrefix} ${formatUnitCode(entry.level, entry.unit)}`}>
                        {isCompleted ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                            <path d="M20 7L10 17l-6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          formatUnitCode(entry.level, entry.unit)
                        )}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-normal leading-tight text-ink">
                        {localizeRoadmapTopic(entry.topic, defaultLanguage)}
                      </p>
                    </div>
                    <span className={`flex h-5 w-5 items-center justify-center ${stageHeaderUi.accentClass}`} aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-3 w-full border-b border-[var(--border-subtle)] pb-2">
        <label htmlFor="library-search" className="sr-only">
          Search library
        </label>
        <div className="top-toolbar-row relative flex items-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          >
            🔍
          </span>
          <input
            id="library-search"
            type="search"
            value={libraryQuery}
            onChange={(event) => setLibraryQuery(event.target.value)}
            placeholder={defaultLanguage === 'burmese' ? 'Library ကို ရှာမယ်' : 'Search library'}
            className="top-toolbar-control w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
          />
        </div>
      </div>

      {!hasFilteredResults && (
        <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-4 text-sm text-[var(--text-secondary)]">
          {defaultLanguage === 'burmese' ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော album မရှိသေးပါ။' : 'No albums match your search.'}
        </div>
      )}

      {isHskCollectionLanguage ? (
        filteredHskCollectionSections.map((section) => {
          const stageHeaderUi = LIBRARY_HEADER_STYLE;
          return (
            <div
              key={section.key}
              className="mb-6 last:mb-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-default)] shadow-sm"
            >
              <div className={`px-3 py-2 ${stageHeaderUi.barClass}`}>
                <p className={`text-sm font-normal uppercase tracking-[0.08em] md:text-sm ${stageHeaderUi.textClass}`}>
                  {section.label}
                </p>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {section.groups.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => setSelectedAlbumKey(group.key)}
                    aria-label={`Open group ${group.groupIndex + 1}`}
                    className="selection-hover w-full min-h-[84px] text-left px-3 py-3 transition-colors"
                  >
                    <div className="grid grid-cols-[48px,1fr,20px] items-center gap-3">
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                        <div className="absolute inset-y-0 left-0 z-10 w-1 bg-black/12" aria-hidden="true" />
                        <img
                          src={group.coverUrl}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-normal leading-tight text-ink">
                          {shortenLabel(getDisplayAlbumTitle(group.firstTopicConcise, defaultLanguage), 48)}
                        </p>
                        <p className="mt-1 truncate text-xs font-normal text-[var(--text-muted)]">
                          {formatAlbumMeta('A1', group.groupIndex, group.units.length, group)}
                        </p>
                      </div>
                      <span className={`flex h-5 w-5 items-center justify-center ${stageHeaderUi.accentClass}`} aria-hidden="true">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        STAGE_ORDER.map((stage) => {
          const stageGroups = filteredGroupsByStage[stage];
          if (stageGroups.length === 0) return null;
          const stageHeaderUi = LIBRARY_HEADER_STYLE;

          return (
            <div
              key={stage}
              className="mb-6 last:mb-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-default)] shadow-sm"
            >
              <div className={`px-3 py-2 ${stageHeaderUi.barClass}`}>
                <p className={`text-sm font-normal uppercase tracking-[0.08em] md:text-sm ${stageHeaderUi.textClass}`}>
                  {isHskLanguage ? hskStageLabel : text.stageLabels[stage]}
                </p>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {stageGroups.map((group) => {
                  return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => setSelectedAlbumKey(group.key)}
                    aria-label={`Open group ${group.groupIndex + 1}`}
                    className="selection-hover w-full min-h-[84px] text-left px-3 py-3 transition-colors"
                  >
                    <div className="grid grid-cols-[48px,1fr,20px] items-center gap-3">
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                        <div className="absolute inset-y-0 left-0 z-10 w-1 bg-black/12" aria-hidden="true" />
                        <img
                          src={group.coverUrl}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-normal leading-tight text-ink">
                          {shortenLabel(getDisplayAlbumTitle(group.firstTopicConcise, defaultLanguage), 48)}
                        </p>
                        <p className="mt-1 truncate text-xs font-normal text-[var(--text-muted)]">
                          {formatAlbumMeta(stage, group.groupIndex, group.units.length, group)}
                        </p>
                      </div>
                      <span className={`flex h-5 w-5 items-center justify-center ${stageHeaderUi.accentClass}`} aria-hidden="true">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

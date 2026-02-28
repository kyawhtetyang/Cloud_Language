import { useMemo } from 'react';
import { LessonData } from '../../../types';
import {
  DefaultLanguage,
  getLessonOrderIndex,
  getLessonUnitId,
  LibraryViewMode,
  LearnLanguage,
  StageCode,
} from '../../../config/appConfig';
import { localizeLibraryTopic, localizeLibraryTopicConcise } from '../../../config/libraryI18n';
import type { AlbumCollectionSection, AlbumGroup } from './libraryTypes';

type UseLibraryCollectionsArgs = {
  lessons: LessonData[];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  viewMode: LibraryViewMode;
  downloadedUnitKeys?: Set<string>;
  selectedAlbumKey: string | null;
  libraryQuery: string;
  collectionFallbackPrefix: string;
  untitledSourceLabel: string;
};

export function buildLibraryUnitKey(level: number, unit: number): string {
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
  groupIndex: number,
  topic: string,
  coverLanguageCode: string,
): string {
  if (/^hsk[1-6]$/i.test(coverLanguageCode)) {
    return `/api/lesson-cover/${coverLanguageCode}`;
  }
  return getTopicPhotoUrl(topic, `group:${groupIndex + 1}`);
}

function resolveHskLanguageCodeFromCollectionLabel(label: string): string {
  const match = label.match(/hsk\s*([1-6])/i);
  if (!match) return 'hsk_chinese';
  return `hsk${match[1]}`;
}

function getConciseTopicTitle(rawTopic: string, defaultLanguage: DefaultLanguage): string {
  return localizeLibraryTopicConcise(rawTopic, defaultLanguage);
}

function getDisplayAlbumTitle(rawTitle: string, defaultLanguage: DefaultLanguage): string {
  return localizeLibraryTopic(rawTitle, defaultLanguage);
}

export function useLibraryCollections({
  lessons,
  defaultLanguage,
  learnLanguage,
  viewMode,
  downloadedUnitKeys,
  selectedAlbumKey,
  libraryQuery,
  collectionFallbackPrefix,
  untitledSourceLabel,
}: UseLibraryCollectionsArgs) {
  const collectionSections = useMemo<AlbumCollectionSection[]>(() => {
    const byCollection = new Map<
      string,
      {
        sourceOrder: string[];
        bySource: Map<string, AlbumGroup['units']>;
        levelScheme?: string;
        levelCode?: string;
        levelOrder?: number;
      }
    >();

    for (const lesson of lessons) {
      const level = getLessonOrderIndex(lesson);
      const unit = getLessonUnitId(lesson);
      const collectionLabel = (lesson.collectionLabel || '').trim() || `${collectionFallbackPrefix} ${level}`;
      const sourceLabel = (lesson.sourceLabel || '').trim() || untitledSourceLabel;
      const levelScheme = String(lesson.levelScheme || '').trim().toLowerCase() || undefined;
      const levelCode = String(lesson.levelCode || '').trim().toUpperCase() || undefined;
      const levelOrder = typeof lesson.levelOrder === 'number' ? lesson.levelOrder : undefined;

      if (!byCollection.has(collectionLabel)) {
        byCollection.set(collectionLabel, {
          sourceOrder: [],
          bySource: new Map(),
          levelScheme,
          levelCode,
          levelOrder,
        });
      }

      const collection = byCollection.get(collectionLabel)!;
      if (!collection.levelScheme && levelScheme) collection.levelScheme = levelScheme;
      if (!collection.levelCode && levelCode) collection.levelCode = levelCode;
      if (typeof collection.levelOrder !== 'number' && typeof levelOrder === 'number') {
        collection.levelOrder = levelOrder;
      }

      if (!collection.bySource.has(sourceLabel)) {
        collection.bySource.set(sourceLabel, []);
        collection.sourceOrder.push(sourceLabel);
      }

      const units = collection.bySource.get(sourceLabel)!;
      if (!units.some((entry) => entry.level === level && entry.unit === unit)) {
        units.push({
          stage: 'A1',
          level,
          unit,
          topic: lesson.topic,
        });
      }
    }

    const schemePriority = (scheme: string | undefined): number => {
      if (scheme === 'cefr') return 10;
      if (scheme === 'hsk') return 20;
      if (scheme === 'jlpt') return 30;
      return 40;
    };

    const collectionEntries = Array.from(byCollection.entries()).sort(([labelA, metaA], [labelB, metaB]) => {
      const priorityDiff = schemePriority(metaA.levelScheme) - schemePriority(metaB.levelScheme);
      if (priorityDiff !== 0) return priorityDiff;

      const orderA = typeof metaA.levelOrder === 'number' ? metaA.levelOrder : Number.POSITIVE_INFINITY;
      const orderB = typeof metaB.levelOrder === 'number' ? metaB.levelOrder : Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;

      const aNum = Number((labelA.match(/^hsk\s*([1-9]\d*)$/i)?.[1]) || 0);
      const bNum = Number((labelB.match(/^hsk\s*([1-9]\d*)$/i)?.[1]) || 0);
      if (aNum > 0 && bNum > 0) return aNum - bNum;
      if (aNum > 0) return 1;
      if (bNum > 0) return -1;
      return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
    });

    return collectionEntries.map(([collectionLabel, collection]) => {
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
          coverUrl: getGroupCoverUrl(groupIndex, sourceLabel, coverLanguage),
        };
      });

      return {
        key: `${collection.levelScheme || 'custom'}-${(collection.levelCode || collectionLabel).toLowerCase().replace(/\s+/g, '-')}`,
        label: collectionLabel,
        levelScheme: collection.levelScheme,
        levelCode: collection.levelCode,
        levelOrder: collection.levelOrder,
        groups,
      };
    });
  }, [collectionFallbackPrefix, learnLanguage, lessons, untitledSourceLabel]);

  const libraryModeSections = useMemo<AlbumCollectionSection[]>(() => {
    if (viewMode !== 'downloaded') return collectionSections;
    return collectionSections
      .map((section) => ({
        ...section,
        groups: section.groups
          .map((group) => ({
            ...group,
            units: group.units.filter((entry) => downloadedUnitKeys?.has(buildLibraryUnitKey(entry.level, entry.unit))),
          }))
          .filter((group) => group.units.length > 0),
      }))
      .filter((section) => section.groups.length > 0);
  }, [collectionSections, downloadedUnitKeys, viewMode]);

  const selectedAlbum = useMemo(() => {
    if (!selectedAlbumKey) return null;
    for (const section of libraryModeSections) {
      const found = section.groups.find((group) => group.key === selectedAlbumKey);
      if (found) return found;
    }
    return null;
  }, [libraryModeSections, selectedAlbumKey]);

  const normalizedLibraryQuery = libraryQuery.trim().toLowerCase();
  const filteredCollectionSections = useMemo(() => {
    if (!normalizedLibraryQuery) return libraryModeSections;
    return libraryModeSections
      .map((section) => ({
        ...section,
        groups: section.groups.filter((group) => {
          const localizedGroupTitle = getDisplayAlbumTitle(group.firstTopicConcise, defaultLanguage).toLowerCase();
          if (group.firstTopicConcise.toLowerCase().includes(normalizedLibraryQuery)) return true;
          if (localizedGroupTitle.includes(normalizedLibraryQuery)) return true;
          return group.units.some((unitEntry) => {
            const conciseTopic = getConciseTopicTitle(unitEntry.topic, defaultLanguage).toLowerCase();
            const localizedTopic = localizeLibraryTopic(unitEntry.topic, defaultLanguage).toLowerCase();
            return conciseTopic.includes(normalizedLibraryQuery) || localizedTopic.includes(normalizedLibraryQuery);
          });
        }),
      }))
      .filter((section) => section.groups.length > 0);
  }, [defaultLanguage, libraryModeSections, normalizedLibraryQuery]);

  return {
    filteredCollectionSections,
    hasFilteredResults: filteredCollectionSections.length > 0,
    selectedAlbum,
  };
}

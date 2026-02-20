import React, { useMemo, useState } from 'react';
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
  onSelectUnit: (level: number, unit: number, albumKey?: string | null) => void;
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

const ALBUM_COVER_URLS: Record<StageCode, string[]> = {
  A1: [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=60',
  ],
  A2: [
    'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1484807352052-23338990c6c6?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60',
  ],
  B1: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=60',
  ],
  B2: [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=800&q=60',
  ],
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

function getAlbumCoverUrl(stage: StageCode, groupIndex: number): string {
  const covers = ALBUM_COVER_URLS[stage];
  return covers[groupIndex % covers.length];
}

const TOPIC_COVER_URLS: Record<string, string> = {
  'selling and buying': 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=900&q=60',
  'market conversation': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=60',
  'payment and discount': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=60',
  'return and exchange': 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=900&q=60',
  'price and quantity': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=60',
  'leading meetings': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=60',
  'formal presentations': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=60',
  'negotiation techniques': 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=60',
  'handling q&a sessions': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=60',
  'executive-level communication': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60',
};

const THEME_COVER_POOLS: Array<{ keywords: string[]; urls: string[] }> = [
  {
    keywords: ['alphabet', 'pronunciation', 'word', 'classroom', 'question', 'answer'],
    urls: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=60',
    ],
  },
  {
    keywords: ['greeting', 'introducing', 'family', 'friend', 'conversation', 'discussion', 'turn-taking'],
    urls: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1475724017904-b712052c192a?auto=format&fit=crop&w=900&q=60',
    ],
  },
  {
    keywords: ['daily', 'routine', 'time', 'date', 'future', 'weekend', 'plan', 'story'],
    urls: [
      'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=60',
    ],
  },
  {
    keywords: ['sell', 'buy', 'market', 'price', 'quantity', 'payment', 'discount', 'return', 'exchange'],
    urls: [
      'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=900&q=60',
    ],
  },
  {
    keywords: ['compare', 'opinion', 'advantage', 'disadvantage', 'cause', 'effect', 'explanation', 'process'],
    urls: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=60',
    ],
  },
  {
    keywords: ['advice', 'suggestion', 'request', 'objection', 'problem', 'solution', 'diplomatic'],
    urls: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60',
    ],
  },
  {
    keywords: ['presentation', 'meeting', 'negotiation', 'executive', 'q&a', 'argument', 'debate', 'persuasive'],
    urls: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=60',
    ],
  },
  {
    keywords: ['social', 'critical', 'abstract', 'hypothetical', 'analysis', 'evaluate', 'thinking'],
    urls: [
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1484807352052-23338990c6c6?auto=format&fit=crop&w=900&q=60',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=60',
    ],
  },
];

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getRelevantAlbumCover(topic: string, stage: StageCode, groupIndex: number): string {
  const normalized = topic.trim().toLowerCase();
  if (TOPIC_COVER_URLS[normalized]) {
    return TOPIC_COVER_URLS[normalized];
  }
  for (const pool of THEME_COVER_POOLS) {
    if (pool.keywords.some((keyword) => normalized.includes(keyword))) {
      const pick = stableHash(normalized) % pool.urls.length;
      return pool.urls[pick];
    }
  }

  return getAlbumCoverUrl(stage, groupIndex);
}

function getConciseTopicTitle(rawTopic: string, defaultLanguage: DefaultLanguage): string {
  const topic = rawTopic.trim().toLowerCase();
  const conciseEnglish: Record<string, string> = {
    'alphabet sounds & basic pronunciation': 'Pronunciation',
    'greeting and introducing yourself': 'Greetings',
    'saying name, country, job': 'Name & Intro',
    'yes/no short answers': 'Yes/No',
    'classroom survival phrases': 'Classroom',
    'talking about daily routine': 'Daily Routine',
    'describing people & objects': 'People & Objects',
    'asking simple questions': 'Simple Questions',
    'talking about time & dates': 'Time & Dates',
    'giving simple directions': 'Directions',
    'talking about likes & preferences': 'Likes',
    'talking about family & friends': 'Family & Friends',
    'talking about past weekend': 'Past Weekend',
    'talking about future plans': 'Future Plans',
    'role-play conversations': 'Role-play',
    'selling and buying': 'Buy & Sell',
    'price and quantity': 'Price & Qty',
    'payment and discount': 'Payment',
    'return and exchange': 'Returns',
    'market conversation': 'Market Talk',
    'telling past stories': 'Past Stories',
    'describing experiences': 'Experiences',
    'sequencing events clearly': 'Event Sequence',
    'comparing things': 'Comparisons',
    'giving short explanations': 'Explanations',
    'making requests politely': 'Polite Requests',
    'giving advice': 'Advice',
    'making suggestions': 'Suggestions',
    'handling simple problems': 'Problem Solving',
    'expressing agreement/disagreement': 'Agree/Disagree',
    'giving opinions with reasons': 'Opinions',
    'explaining cause & effect': 'Cause & Effect',
    'describing advantages & disadvantages': 'Pros & Cons',
    'reacting naturally in conversation': 'Natural Reactions',
    'extending answers confidently': 'Extended Answers',
    'talking about achievements': 'Achievements',
    'describing processes': 'Processes',
    'hypothetical situations (if...)': 'If Situations',
    'explaining decisions': 'Decisions',
    'storytelling techniques': 'Storytelling',
    'expressing strong opinions': 'Strong Opinions',
    'supporting arguments': 'Support Arguments',
    'comparing viewpoints': 'Viewpoints',
    'participating in discussions': 'Discussions',
    'managing turn-taking': 'Turn-taking',
    'presenting arguments': 'Present Arguments',
    'convincing others': 'Persuasion',
    'handling objections': 'Objections',
    'structured mini-presentations': 'Mini Presentations',
    'debate practice': 'Debate',
    'hypothetical & abstract topics': 'Abstract Topics',
    'nuanced comparisons': 'Nuanced Compare',
    'clarifying complex ideas': 'Clarify Ideas',
    'paraphrasing smoothly': 'Paraphrasing',
    'emphasis & rhetorical devices': 'Emphasis Skills',
    'analyzing social issues': 'Social Analysis',
    'evaluating arguments': 'Evaluate Arguments',
    'diplomatic disagreement': 'Diplomatic Talk',
    'problem-solution discussions': 'Problem-Solution',
    'critical thinking in speech': 'Critical Thinking',
    'leading meetings': 'Lead Meetings',
    'formal presentations': 'Formal Presenting',
    'negotiation techniques': 'Negotiation',
    'handling q&a sessions': 'Q&A Handling',
    'executive-level communication': 'Executive Comms',
  };
  const conciseBurmese: Record<string, string> = {
    'alphabet sounds & basic pronunciation': 'အသံထွက်',
    'greeting and introducing yourself': 'နှုတ်ဆက်/မိတ်ဆက်',
    'saying name, country, job': 'နာမည်/နိုင်ငံ/အလုပ်',
    'yes/no short answers': 'ဟုတ်/မဟုတ်',
    'classroom survival phrases': 'စာသင်ခန်း',
    'talking about daily routine': 'နေ့စဉ်လုပ်ရိုး',
    'describing people & objects': 'လူ/အရာဖော်ပြ',
    'asking simple questions': 'မေးခွန်းများ',
    'talking about time & dates': 'အချိန်/ရက်စွဲ',
    'giving simple directions': 'လမ်းညွှန်',
    'talking about likes & preferences': 'ကြိုက်နှစ်သက်မှု',
    'talking about family & friends': 'မိသားစု/သူငယ်ချင်း',
    'talking about past weekend': 'ပြီးခဲ့သော ပိတ်ရက်',
    'talking about future plans': 'အနာဂတ်အစီအစဉ်',
    'role-play conversations': 'သရုပ်ဆောင်စကား',
    'selling and buying': 'ရောင်း/ဝယ်',
    'price and quantity': 'စျေးနှုန်း/အရေအတွက်',
    'payment and discount': 'ငွေပေး/လျှော့စျေး',
    'return and exchange': 'ပြန်အပ်/လဲလှယ်',
    'market conversation': 'စျေးကွက်စကား',
    'telling past stories': 'အတိတ်ဇာတ်လမ်း',
    'describing experiences': 'အတွေ့အကြုံဖော်ပြ',
    'sequencing events clearly': 'အစဉ်လိုက်ဖြစ်ရပ်',
    'comparing things': 'နှိုင်းယှဉ်မှု',
    'giving short explanations': 'အတိုရှင်းလင်း',
    'making requests politely': 'ယဉ်ကျေးတောင်းဆို',
    'giving advice': 'အကြံပေး',
    'making suggestions': 'အကြံပြု',
    'handling simple problems': 'ပြဿနာဖြေရှင်း',
    'expressing agreement/disagreement': 'သဘောတူ/မတူ',
    'giving opinions with reasons': 'အမြင်/အကြောင်း',
    'explaining cause & effect': 'အကြောင်း/အကျိုး',
    'describing advantages & disadvantages': 'အားသာ/အားနည်း',
    'reacting naturally in conversation': 'သဘာဝတုံ့ပြန်',
    'extending answers confidently': 'ယုံကြည်ဖြေဆို',
    'talking about achievements': 'အောင်မြင်မှု',
    'describing processes': 'လုပ်ငန်းစဉ်ဖော်ပြ',
    'hypothetical situations (if...)': 'if အခြေအနေ',
    'explaining decisions': 'ဆုံးဖြတ်ချက်',
    'storytelling techniques': 'ဇာတ်လမ်းနည်း',
    'expressing strong opinions': 'တင်းကျပ်အမြင်',
    'supporting arguments': 'အငြင်းအခုံထောက်ခံ',
    'comparing viewpoints': 'အမြင်နှိုင်းယှဉ်',
    'participating in discussions': 'ဆွေးနွေးမှု',
    'managing turn-taking': 'အလှည့်ကျပြော',
    'presenting arguments': 'အကြောင်းပြတင်ပြ',
    'convincing others': 'ယုံကြည်စေခြင်း',
    'handling objections': 'ကန့်ကွက်ဖြေရှင်း',
    'structured mini-presentations': 'အတိုတင်ပြ',
    'debate practice': 'အငြင်းပွားလေ့ကျင့်',
    'hypothetical & abstract topics': 'အယူအဆဆိုင်ရာ',
    'nuanced comparisons': 'အသေးစိတ်နှိုင်းယှဉ်',
    'clarifying complex ideas': 'ရှုပ်ထွေးအယူအဆ',
    'paraphrasing smoothly': 'အဓိပ္ပါယ်တူဖော်ပြ',
    'emphasis & rhetorical devices': 'အလေးပေးနည်း',
    'analyzing social issues': 'လူမှုရေးခွဲခြမ်း',
    'evaluating arguments': 'အငြင်းအခုံအကဲ',
    'diplomatic disagreement': 'သံတမန်သဘောမတူ',
    'problem-solution discussions': 'ပြဿနာ-ဖြေရှင်း',
    'critical thinking in speech': 'ဝေဖန်စဉ်းစား',
    'leading meetings': 'အစည်းအဝေးဦးဆောင်',
    'formal presentations': 'တရားဝင်တင်ပြ',
    'negotiation techniques': 'ညှိနှိုင်းနည်း',
    'handling q&a sessions': 'Q&A ကိုင်တွယ်',
    'executive-level communication': 'အုပ်ချုပ်မှုဆက်သွယ်',
  };
  if (defaultLanguage === 'burmese') {
    return conciseBurmese[topic] || localizeRoadmapTopic(rawTopic, defaultLanguage);
  }
  return conciseEnglish[topic] || localizeRoadmapTopic(rawTopic, defaultLanguage);
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
  onSelectUnit,
  selectedAlbumKey,
  onSelectedAlbumKeyChange,
  completedUnitKeys,
  activeUnitKey,
  downloadedUnitKeys,
  isUnitDownloading,
  onDownloadUnit,
  onRemoveUnitDownload,
}) => {
  const [internalSelectedAlbumKey, setInternalSelectedAlbumKey] = useState<string | null>(null);
  const activeSelectedAlbumKey = selectedAlbumKey === undefined ? internalSelectedAlbumKey : selectedAlbumKey;
  const setSelectedAlbumKey = (key: string | null) => {
    if (onSelectedAlbumKeyChange) {
      onSelectedAlbumKeyChange(key);
      return;
    }
    setInternalSelectedAlbumKey(key);
  };
  const text = getRoadmapText(defaultLanguage);
  const stageUnits = buildStageUnitsFromLessons(lessons);
  const groupsByStage = useMemo(() => {
    return STAGE_ORDER.reduce<Record<StageCode, AlbumGroup[]>>((acc, stage) => {
      const stageRows = stageUnits.filter((item) => item.stage === stage);
      const grouped = chunkUnits(stageRows, 5).map((units, groupIndex) => ({
        key: `${stage}-group-${groupIndex}`,
        stage,
        groupIndex,
        units,
        firstTopicConcise: units[0] ? getConciseTopicTitle(units[0].topic, defaultLanguage) : '',
        coverUrl: units[0] ? getRelevantAlbumCover(units[0].topic, stage, groupIndex) : getAlbumCoverUrl(stage, groupIndex),
      }));
      acc[stage] = grouped;
      return acc;
    }, { A1: [], A2: [], B1: [], B2: [] });
  }, [defaultLanguage, stageUnits]);

  const selectedAlbum = useMemo(() => {
    if (!activeSelectedAlbumKey) return null;
    for (const stage of STAGE_ORDER) {
      const found = groupsByStage[stage].find((group) => group.key === activeSelectedAlbumKey);
      if (found) return found;
    }
    return null;
  }, [activeSelectedAlbumKey, groupsByStage]);

  const renderDownloadButton = (group: AlbumGroup) => {
    if (!onDownloadUnit) return null;

    const groupUnitKeys = group.units.map((entry) => buildUnitKey(entry.level, entry.unit));
    const downloadedCount = groupUnitKeys.filter((key) => downloadedUnitKeys?.has(key)).length;
    const isGroupDownloaded = downloadedCount === group.units.length && group.units.length > 0;
    const isGroupPartial = downloadedCount > 0 && downloadedCount < group.units.length;
    const isGroupDownloading = group.units.some((entry) => Boolean(isUnitDownloading?.(entry.level, entry.unit)));
    const groupDownloadLabel = isGroupDownloading
      ? 'Downloading album'
      : isGroupDownloaded
        ? 'Album downloaded'
        : isGroupPartial
          ? 'Download remaining units in album'
          : 'Download album';

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
        className={`h-8 w-8 inline-flex items-center justify-center rounded-full border transition-all ${
          isGroupDownloaded
            ? 'border-[#46a302] bg-[#f0ffe0] text-[#2f7d01]'
            : isGroupPartial
              ? 'border-[#f59e0b] bg-[#fff7e8] text-[#a16207]'
              : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        } ${isGroupDownloading ? 'opacity-70 cursor-wait' : ''}`}
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
    const stageUi = STAGE_META[selectedAlbum.stage];

    return (
      <div className="w-full max-w-2xl">
        <div className="mb-3 w-full border-b border-gray-100 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlbumKey(null)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                <span aria-hidden="true">←</span>
                Back
              </button>
              <p className={`truncate text-xs font-black uppercase tracking-[0.12em] ${stageUi.titleClass}`}>
                {selectedAlbum.stage} G{selectedAlbum.groupIndex + 1}
              </p>
            </div>
            {renderDownloadButton(selectedAlbum)}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_6px_22px_rgba(0,0,0,0.07)]">
          <div className={`p-4 ${stageUi.levelCardClass}`}>
            <div className="flex items-center gap-3">
              <div className={`relative aspect-square w-[132px] shrink-0 overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br from-white/70 to-black/5 ${stageUi.badgeClass}`}>
                <img
                  src={selectedAlbum.coverUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_25%_20%,white_0%,transparent_55%)]" />
                <div className="absolute bottom-2 left-2 right-2 text-[12px] font-black tracking-wide text-black/75">
                  {selectedAlbum.stage} · {selectedAlbum.groupIndex + 1}
                </div>
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${stageUi.titleClass}`}>
                  {text.groupPrefix} {selectedAlbum.groupIndex + 1}
                </p>
                <h3 className="text-[20px] font-extrabold leading-tight text-[#1d1d1f]">
                  {shortenLabel(selectedAlbum.firstTopicConcise, 58)}
                </h3>
                <p className="mt-0.5 text-[13px] font-medium text-[#86868b]">
                  {selectedAlbum.units.length} {selectedAlbum.units.length > 1 ? 'units' : 'unit'} · {text.stageLabels[selectedAlbum.stage]}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 p-3">
            {selectedAlbum.units.map((entry, albumIndex) => {
              const unitKey = buildUnitKey(entry.level, entry.unit);
              const albumUnitNumber = albumIndex + 1;
              const isCompleted = completedUnitKeys?.has(unitKey) ?? false;
              const isActive = activeUnitKey === unitKey;
              const rowClass = isCompleted
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
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm md:text-[15px] font-bold transition-all ${rowClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10px] font-extrabold ${badgeClass}`}
                      aria-label={`${text.unitPrefix} ${albumUnitNumber}`}
                    >
                      {albumUnitNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectUnit(entry.level, entry.unit, activeSelectedAlbumKey)}
                      className="w-full text-left"
                    >
                      {localizeRoadmapTopic(entry.topic, defaultLanguage)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="mb-4 text-2xl font-extrabold text-[#3c3c3c] md:text-3xl">{text.roadmap}</h2>

      {STAGE_ORDER.map((stage) => {
        const stageGroups = groupsByStage[stage];
        if (stageGroups.length === 0) return null;
        const stageUi = STAGE_META[stage];

        return (
          <div key={stage} className="mb-6 last:mb-0">
            <p className={`mb-2 text-sm font-extrabold uppercase tracking-wide md:text-base ${stageUi.titleClass}`}>
              {text.stageLabels[stage]}
            </p>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-4 md:grid-cols-4">
              {stageGroups.map((group) => (
                <div key={group.key} className="group">
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumKey(group.key)}
                    aria-label={`Open album group ${group.groupIndex + 1}`}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all duration-200 group-hover:border-gray-300 group-hover:bg-gray-50 sm:block">
                      <div className={`relative aspect-square w-[68px] shrink-0 overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br from-white/70 to-black/5 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-transform duration-200 group-hover:scale-[1.015] sm:w-full ${stageUi.badgeClass}`}>
                        <img
                          src={group.coverUrl}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25" />
                        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_25%_20%,white_0%,transparent_55%)]" />
                        <div className="absolute bottom-2 left-2 right-2 text-[11px] font-black tracking-wide text-black/75">
                          {stage} · {group.groupIndex + 1}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 sm:hidden">
                        <p className="truncate text-sm font-semibold text-[#1d1d1f]">
                          {shortenLabel(group.firstTopicConcise, 44)}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-[#86868b]">
                          {text.groupPrefix} {group.groupIndex + 1}
                        </p>
                      </div>
                    </div>
                  </button>
                  <p className="mt-1.5 hidden truncate text-xs font-semibold text-[#3c3c3c] sm:block">
                    {shortenLabel(group.firstTopicConcise, 22)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

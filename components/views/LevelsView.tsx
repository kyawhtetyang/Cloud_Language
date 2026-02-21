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

function getGroupCoverUrl(stage: StageCode, groupIndex: number, topic: string): string {
  return getTopicPhotoUrl(topic, `${stage}:group:${groupIndex + 1}`);
}

function getConciseTopicTitle(rawTopic: string, defaultLanguage: DefaultLanguage): string {
  const topic = rawTopic.trim().toLowerCase();
  const conciseEnglish: Record<string, string> = {
    'common phrases for beginners': 'Common Phrases',
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
    'common phrases for beginners': 'အခြေခံစကားစု',
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
  const playAllLabel = defaultLanguage === 'burmese' ? 'အားလုံးဖတ်' : 'Play All';
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
        coverUrl: getGroupCoverUrl(stage, groupIndex, units[0]?.topic || `${stage} unit`),
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
            ? 'border-brand-dark bg-brand-pale text-brand-ink'
            : isGroupPartial
              ? 'border-warning bg-warning-soft text-warning-ink'
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
              <div className={`relative aspect-[3/4] w-[112px] shrink-0 overflow-hidden rounded-xl ${stageUi.badgeClass}`}>
                <div className="absolute inset-y-0 left-0 z-10 w-2 bg-black/12" aria-hidden="true" />
                <img
                  src={selectedAlbum.coverUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className={`absolute bottom-2 left-2 right-2 text-xs font-black tracking-wide ${stageUi.titleClass}`}>
                  {selectedAlbum.stage} · {selectedAlbum.groupIndex + 1}
                </div>
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-[0.14em] ${stageUi.titleClass}`}>
                  {text.groupPrefix} {selectedAlbum.groupIndex + 1}
                </p>
                <h3 className="text-xl font-extrabold leading-tight text-ink-strong">
                  {shortenLabel(selectedAlbum.firstTopicConcise, 58)}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-ink-muted">
                  {selectedAlbum.units.length} {selectedAlbum.units.length > 1 ? 'units' : 'unit'} · {text.stageLabels[selectedAlbum.stage]}
                </p>
                <button
                  type="button"
                  onClick={() => onReadAlbum?.(
                    selectedAlbum.units.map((entry) => ({ level: entry.level, unit: entry.unit })),
                    activeSelectedAlbumKey,
                  )}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-brand-stroke bg-brand-paler px-2.5 py-1.5 text-xs font-black uppercase tracking-wide text-brand-ink"
                  aria-label={playAllLabel}
                  title={playAllLabel}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M10 9.5v5l4-2.5z" fill="currentColor" stroke="none" />
                  </svg>
                  <span>{playAllLabel}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 p-1.5">
            {selectedAlbum.units.map((entry, albumIndex) => {
              const unitKey = buildUnitKey(entry.level, entry.unit);
              const albumUnitNumber = albumIndex + 1;
              const isCompleted = completedUnitKeys?.has(unitKey) ?? false;
              const isActive = activeUnitKey === unitKey;
              const rowClass = isActive
                ? 'neutral-selected-flat'
                : isCompleted
                  ? 'bg-gray-100/80 text-gray-500'
                  : 'bg-white text-gray-700';
              const badgeClass = isActive
                ? 'border border-white/35 bg-white/15 text-white'
                : isCompleted
                  ? 'bg-brand-soft text-brand'
                  : stageUi.badgeClass;

              return (
                <button
                  key={`${entry.stage}-${entry.level}-${entry.unit}`}
                  type="button"
                  onClick={() => onSelectUnit(entry.level, entry.unit, activeSelectedAlbumKey)}
                  className={`w-full rounded-lg px-3 py-3 text-sm md:text-base font-bold transition-colors ${rowClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-extrabold ${badgeClass}`}
                      aria-label={`${text.unitPrefix} ${albumUnitNumber}`}
                    >
                      {albumUnitNumber}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-left ${isActive ? 'text-white' : ''}`}>
                      {localizeRoadmapTopic(entry.topic, defaultLanguage)}
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
    <div className="w-full max-w-2xl">
      {STAGE_ORDER.map((stage) => {
        const stageGroups = groupsByStage[stage];
        if (stageGroups.length === 0) return null;
        const stageUi = STAGE_META[stage];

        return (
          <div
            key={stage}
            className="mb-6 last:mb-0 overflow-hidden rounded-2xl border border-gray-200/85 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
          >
            <div className={`px-3 py-2.5 border-b border-gray-200/70 ${stageUi.levelCardClass}`}>
              <p className={`text-sm font-extrabold uppercase tracking-wide md:text-base ${stageUi.titleClass}`}>
                {text.stageLabels[stage]}
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {stageGroups.map((group) => {
                const stageLabel = text.stageLabels[stage].replace(/\s*\([^)]*\)\s*$/, '');
                return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setSelectedAlbumKey(group.key)}
                  aria-label={`Open album group ${group.groupIndex + 1}`}
                  className="selection-hover w-full text-left px-3 py-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
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
                      <p className="truncate text-base font-extrabold text-ink-strong">
                        {shortenLabel(group.firstTopicConcise, 48)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink-muted">
                        [{stage} · U{group.groupIndex + 1}] [{group.units.length} {group.units.length > 1 ? 'units' : 'unit'} · {stageLabel}]
                      </p>
                    </div>
                    <span className={`shrink-0 ${stageUi.titleClass}`} aria-hidden="true">
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
      })}
    </div>
  );
};

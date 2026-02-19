export const LEARN_QUESTIONS_PER_UNIT = 10;
export const QUICK_REVIEW_CHECKPOINTS: number[] = [2, 4, 6, 8, 10];
export const QUICK_REVIEW_COUNT = QUICK_REVIEW_CHECKPOINTS.length;
export const TOTAL_XP_PER_COURSE = QUICK_REVIEW_COUNT;
export const PASS_SCORE = 4;

export const PROFILE_NAME_KEY = 'lingo_burmese_profile_name';
export const PROGRESS_KEY = 'lingo_burmese_progress';
export const UNLOCKED_LEVEL_KEY = 'lingo_burmese_unlocked_level';
export const STREAK_KEY = 'lingo_burmese_streak';
export const PRONUNCIATION_ENABLED_KEY = 'lingo_burmese_pronunciation_enabled';
export const LEARN_LANGUAGE_KEY = 'lingo_burmese_learn_language';
export const DEFAULT_LANGUAGE_KEY = 'lingo_burmese_default_language';
export const TEXT_SCALE_PERCENT_KEY = 'lingo_burmese_text_scale_percent';
export const VOICE_PREFERENCE_KEY = 'lingo_burmese_voice_preference';
export const BOLD_TEXT_ENABLED_KEY = 'lingo_burmese_bold_text_enabled';
export const RANDOM_LESSON_ORDER_ENABLED_KEY = 'lingo_burmese_random_lesson_order_enabled';
export const REMOVE_REVIEW_QUESTIONS_ENABLED_KEY = 'lingo_burmese_remove_review_questions_enabled';
export const RELOAD_TO_LESSON_KEY = 'lingo_burmese_reload_to_lesson';

export const LESSONS_PER_BATCH = 3;
export const MATCH_PAIRS_PER_REVIEW = 3;

export const LEVEL_METADATA = [
  {
    level: 1,
    title: 'Sound & Survival Speech',
    stage: 'A1',
  },
  {
    level: 2,
    title: 'Basic Daily Speech',
    stage: 'A1',
  },
  {
    level: 3,
    title: 'Guided Conversation',
    stage: 'A1',
  },
  {
    level: 4,
    title: 'Narrating Events',
    stage: 'A2',
  },
  {
    level: 5,
    title: 'Functional Interaction',
    stage: 'A2',
  },
  {
    level: 6,
    title: 'Structured Responses',
    stage: 'A2',
  },
  {
    level: 7,
    title: 'Expanding Fluency',
    stage: 'B1',
  },
  {
    level: 8,
    title: 'Discussion Skills',
    stage: 'B1',
  },
  {
    level: 9,
    title: 'Persuasive Speaking',
    stage: 'B1',
  },
  {
    level: 10,
    title: 'Advanced Fluency',
    stage: 'B2',
  },
  {
    level: 11,
    title: 'Analytical Discussion',
    stage: 'B2',
  },
  {
    level: 12,
    title: 'Professional Speaking Mastery',
    stage: 'B2',
  },
] as const;

export const STAGE_ORDER = ['A1', 'A2', 'B1', 'B2'] as const;
export type StageCode = (typeof STAGE_ORDER)[number];
export const STAGE_META = {
  A1: {
    label: 'Beginner (A1)',
    levelCardClass: 'border-[#c5eb9f] bg-[#f7ffef]',
    topicCardClass: 'border-[#dbe8cb] bg-white/85 hover:border-[#9ad56a]',
    badgeClass: 'bg-[#e9f7dc] text-[#2f7d01]',
    titleClass: 'text-[#2f7d01]',
  },
  A2: {
    label: 'Pre-Intermediate (A2)',
    levelCardClass: 'border-[#facc15] bg-[#fff9e8]',
    topicCardClass: 'border-[#f5d564] bg-white/90 hover:border-[#eab308]',
    badgeClass: 'bg-[#fff1c4] text-[#a16207]',
    titleClass: 'text-[#a16207]',
  },
  B1: {
    label: 'Intermediate (B1)',
    levelCardClass: 'border-[#93c5fd] bg-[#eff6ff]',
    topicCardClass: 'border-[#bfdbfe] bg-white/90 hover:border-[#60a5fa]',
    badgeClass: 'bg-[#dbeafe] text-[#1d4ed8]',
    titleClass: 'text-[#1d4ed8]',
  },
  B2: {
    label: 'Upper-Intermediate (B2)',
    levelCardClass: 'border-[#fbcfe8] bg-[#fff1f9]',
    topicCardClass: 'border-[#f9a8d4] bg-white/90 hover:border-[#ec4899]',
    badgeClass: 'bg-[#fce7f3] text-[#be185d]',
    titleClass: 'text-[#be185d]',
  },
} as const;

export type AppMode = 'learn' | 'quiz' | 'result' | 'completed';
export type SidebarTab = 'profile' | 'levels' | 'lesson' | 'settings';
export const LEARN_LANGUAGE_OPTIONS = [
  { code: 'english', label: 'English' },
  { code: 'chinese', label: 'Chinese' },
] as const;
export type LearnLanguage = (typeof LEARN_LANGUAGE_OPTIONS)[number]['code'];

export const DEFAULT_LANGUAGE_OPTIONS = [
  { code: 'burmese', label: 'Burmese (Default)' },
  { code: 'english', label: 'English' },
] as const;
export type DefaultLanguage = (typeof DEFAULT_LANGUAGE_OPTIONS)[number]['code'];

export type RoadmapTextPack = {
  roadmap: string;
  unitPrefix: string;
  groupPrefix: string;
  stageLabels: Record<StageCode, string>;
};

const ROADMAP_TEXT_ENGLISH: RoadmapTextPack = {
  roadmap: 'Road Map',
  unitPrefix: 'Unit',
  groupPrefix: 'Units',
  stageLabels: {
    A1: 'Beginner (A1)',
    A2: 'Pre-Intermediate (A2)',
    B1: 'Intermediate (B1)',
    B2: 'Upper-Intermediate (B2)',
  },
};

export const ROADMAP_TEXT_BY_LANGUAGE: Record<string, RoadmapTextPack> = {
  english: ROADMAP_TEXT_ENGLISH,
  burmese: {
    roadmap: 'လေ့လာမှုမြေပုံ',
    unitPrefix: 'ယူနစ်',
    groupPrefix: 'ယူနစ်များ',
    stageLabels: {
      A1: 'အခြေခံ (A1)',
      A2: 'အခြေခံအလယ်တန်း (A2)',
      B1: 'အလယ်တန်း (B1)',
      B2: 'အလယ်တန်းမြင့် (B2)',
    },
  },
};

export const ROADMAP_TOPIC_REPLACEMENTS_BY_LANGUAGE: Record<string, Record<string, string>> = {
  burmese: {
    'alphabet sounds & basic pronunciation': 'အက္ခရာအသံများနှင့် အခြေခံအသံထွက်',
    'greeting and introducing yourself': 'နှုတ်ဆက်ခြင်းနှင့် မိမိကိုယ်ကို မိတ်ဆက်ခြင်း',
    'saying name, country, job': 'နာမည်၊ နိုင်ငံ၊ အလုပ် ပြောခြင်း',
    'yes/no short answers': 'ဟုတ်/မဟုတ် အတိုချုံးဖြေဆိုမှုများ',
    'classroom survival phrases': 'စာသင်ခန်း အသုံးဝင် စကားစုများ',
    'talking about daily routine': 'နေ့စဉ်လုပ်ရိုးလုပ်စဉ်အကြောင်း ပြောခြင်း',
    'describing people & objects': 'လူများနှင့် အရာဝတ္ထုများကို ဖော်ပြခြင်း',
    'asking simple questions': 'ရိုးရှင်းသော မေးခွန်းများ မေးခြင်း',
    'talking about time & dates': 'အချိန်နှင့် ရက်စွဲအကြောင်း ပြောခြင်း',
    'giving simple directions': 'ရိုးရှင်းသော လမ်းညွှန်ချက်များ ပေးခြင်း',
    'talking about likes & preferences': 'ကြိုက်နှစ်သက်မှုနှင့် ရွေးချယ်မှုအကြောင်း ပြောခြင်း',
    'talking about family & friends': 'မိသားစုနှင့် သူငယ်ချင်းများအကြောင်း ပြောခြင်း',
    'talking about past weekend': 'ပြီးခဲ့သည့် စနေတနင်္ဂနွေအကြောင်း ပြောခြင်း',
    'talking about future plans': 'အနာဂတ် အစီအစဉ်များအကြောင်း ပြောခြင်း',
    'role-play conversations': 'သရုပ်ဆောင် စကားပြောလေ့ကျင့်မှု',
    'selling and buying': 'ရောင်းခြင်းနှင့် ဝယ်ခြင်း',
    'price and quantity': 'စျေးနှုန်းနှင့် အရေအတွက်',
    'payment and discount': 'ငွေပေးချေမှုနှင့် လျှော့စျေး',
    'return and exchange': 'ပြန်အပ်ခြင်းနှင့် လဲလှယ်ခြင်း',
    'market conversation': 'စျေးကွက် စကားပြော',
    'telling past stories': 'အတိတ်ဖြစ်ရပ်များ ပြောပြခြင်း',
    'describing experiences': 'အတွေ့အကြုံများ ဖော်ပြခြင်း',
    'sequencing events clearly': 'ဖြစ်ရပ်များကို အစဉ်လိုက် ပြတ်သားစွာ ပြောခြင်း',
    'comparing things': 'အရာများကို နှိုင်းယှဉ်ခြင်း',
    'giving short explanations': 'အတိုချုံး ရှင်းလင်းချက်များ ပေးခြင်း',
    'making requests politely': 'ယဉ်ကျေးစွာ တောင်းဆိုခြင်း',
    'giving advice': 'အကြံပေးခြင်း',
    'making suggestions': 'အကြံပြုခြင်း',
    'handling simple problems': 'ရိုးရှင်းသော ပြဿနာများ ကိုင်တွယ်ခြင်း',
    'expressing agreement/disagreement': 'သဘောတူ/မတူ ကို ဖော်ပြခြင်း',
    'giving opinions with reasons': 'အကြောင်းပြချက်နှင့် အမြင်ပေးခြင်း',
    'explaining cause & effect': 'အကြောင်းရင်းနှင့် အကျိုးဆက် ရှင်းပြခြင်း',
    'describing advantages & disadvantages': 'အားသာချက်နှင့် အားနည်းချက် ဖော်ပြခြင်း',
    'reacting naturally in conversation': 'စကားဝိုင်းတွင် သဘာဝကျစွာ တုံ့ပြန်ခြင်း',
    'extending answers confidently': 'ယုံကြည်မှုရှိစွာ ဖြေချက်ကို တိုးချဲ့ခြင်း',
    'talking about achievements': 'အောင်မြင်မှုများအကြောင်း ပြောခြင်း',
    'describing processes': 'လုပ်ငန်းစဉ်များ ဖော်ပြခြင်း',
    'hypothetical situations (if...)': 'ဖြစ်နိုင်ချေ အခြေအနေများ (if...)',
    'explaining decisions': 'ဆုံးဖြတ်ချက်များ ရှင်းပြခြင်း',
    'storytelling techniques': 'ဇာတ်လမ်းပြော နည်းစနစ်များ',
    'expressing strong opinions': 'တင်းကျပ်သော အမြင်များ ဖော်ပြခြင်း',
    'supporting arguments': 'အငြင်းအခုံများကို ထောက်ခံခြင်း',
    'comparing viewpoints': 'အမြင်များကို နှိုင်းယှဉ်ခြင်း',
    'participating in discussions': 'ဆွေးနွေးပွဲများတွင် ပါဝင်ခြင်း',
    'managing turn-taking': 'အလှည့်ကျ ပြောဆိုမှု ကို စီမံခြင်း',
    'presenting arguments': 'အကြောင်းပြချက်များ တင်ပြခြင်း',
    'convincing others': 'အခြားသူများကို ယုံကြည်လာအောင် ပြောဆိုခြင်း',
    'handling objections': 'ကန့်ကွက်ချက်များ ကိုင်တွယ်ခြင်း',
    'structured mini-presentations': 'ဖွဲ့စည်းထားသော အတိုတင်ပြမှုများ',
    'debate practice': 'အငြင်းပွား စကားပြော လေ့ကျင့်မှု',
    'hypothetical & abstract topics': 'ဖြစ်နိုင်ချေ နှင့် အယူအဆဆိုင်ရာ အကြောင်းအရာများ',
    'nuanced comparisons': 'အသေးစိတ်ကွာခြားချက်ပါ နှိုင်းယှဉ်မှုများ',
    'clarifying complex ideas': 'ရှုပ်ထွေးသော အယူအဆများ ရှင်းလင်းခြင်း',
    'paraphrasing smoothly': 'အဓိပ္ပါယ်တူ ပြန်လည်ဖော်ပြခြင်းကို ချောမွေ့စွာ ပြုလုပ်ခြင်း',
    'emphasis & rhetorical devices': 'အလေးပေးဖော်ပြမှုနှင့် ဟောပြောနည်းကိရိယာများ',
    'analyzing social issues': 'လူမှုရေး ပြဿနာများ ခွဲခြမ်းစိတ်ဖြာခြင်း',
    'evaluating arguments': 'အငြင်းအခုံများ အကဲဖြတ်ခြင်း',
    'diplomatic disagreement': 'သံတမန်ဆန်သော သဘောမတူခြင်း',
    'problem-solution discussions': 'ပြဿနာ-ဖြေရှင်းနည်း ဆွေးနွေးမှုများ',
    'critical thinking in speech': 'ပြောဆိုရာတွင် ဝေဖန်စဉ်းစားနိုင်မှု',
    'leading meetings': 'အစည်းအဝေး ဦးဆောင်ခြင်း',
    'formal presentations': 'တရားဝင် တင်ပြမှုများ',
    'negotiation techniques': 'ဆွေးနွေးညှိနှိုင်း နည်းစနစ်များ',
    'handling q&a sessions': 'မေးခွန်း-ဖြေကြား အစီအစဉ်များ ကိုင်တွယ်ခြင်း',
    'executive-level communication': 'အုပ်ချုပ်မှုအဆင့် ဆက်သွယ်ပြောဆိုမှု',
    'burmese words': 'မြန်မာ စကားလုံးများ',
    'english words': 'အင်္ဂလိပ် စကားလုံးများ',
    'chinese words': 'တရုတ် စကားလုံးများ',
  },
};

export function getRoadmapText(defaultLanguage: DefaultLanguage): RoadmapTextPack {
  return ROADMAP_TEXT_BY_LANGUAGE[defaultLanguage] || ROADMAP_TEXT_ENGLISH;
}

export function localizeRoadmapTopic(topic: string, defaultLanguage: DefaultLanguage): string {
  const replacements = ROADMAP_TOPIC_REPLACEMENTS_BY_LANGUAGE[defaultLanguage];
  if (!replacements) return topic;

  let localized = topic;
  for (const [source, target] of Object.entries(replacements)) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    localized = localized.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), target);
  }
  return localized;
}

export type ReviewResult = {
  correct: number;
  total: number;
  passed: boolean;
};

export function clampTextScale(value: number): number {
  return Math.min(120, Math.max(90, value));
}

export function isLearnLanguage(value: unknown): value is LearnLanguage {
  if (typeof value !== 'string') return false;
  return LEARN_LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function isDefaultLanguage(value: unknown): value is DefaultLanguage {
  if (typeof value !== 'string') return false;
  return DEFAULT_LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export type CoreLessonRef = {
  groupId?: string;
  unitId?: number;
  orderIndex?: number;
  level: number;
  unit: number;
};

export function getLessonGroupId(lesson: CoreLessonRef): string {
  if (lesson.groupId && lesson.groupId.trim()) return lesson.groupId.trim();
  return `group_${Math.max(1, lesson.level)}`;
}

export function getLessonUnitId(lesson: CoreLessonRef): number {
  if (Number.isInteger(lesson.unitId) && (lesson.unitId as number) > 0) {
    return lesson.unitId as number;
  }
  return Math.max(1, lesson.unit);
}

export function getLessonOrderIndex(lesson: CoreLessonRef): number {
  if (Number.isInteger(lesson.orderIndex) && (lesson.orderIndex as number) > 0) {
    return lesson.orderIndex as number;
  }
  return Math.max(1, lesson.level);
}

type LessonStageInput = {
  groupId?: string;
  unitId?: number;
  orderIndex?: number;
  level: number;
  unit: number;
  topic?: string;
  stage?: string;
};

export type StageUnitRef = {
  stage: StageCode;
  stageUnitNumber: number;
  level: number;
  unit: number;
  topic: string;
};

const LEVEL_STAGE_LOOKUP = new Map<number, StageCode>(
  LEVEL_METADATA.map((item) => [item.level, item.stage]),
);

export function isStageCode(value: string | null | undefined): value is StageCode {
  return value === 'A1' || value === 'A2' || value === 'B1' || value === 'B2';
}

export function resolveStageCode(level: number, stage?: string): StageCode {
  if (stage && isStageCode(stage)) return stage;
  return LEVEL_STAGE_LOOKUP.get(level) || 'A1';
}

export function buildStageUnitsFromLessons(lessons: LessonStageInput[]): StageUnitRef[] {
  const byStage = new Map<StageCode, StageUnitRef[]>();

  for (const stage of STAGE_ORDER) {
    byStage.set(stage, []);
  }

  const seen = new Set<string>();

  for (const lesson of lessons) {
    const lessonOrder = getLessonOrderIndex(lesson);
    const lessonUnit = getLessonUnitId(lesson);
    const stage = resolveStageCode(lessonOrder, lesson.stage);
    const key = `${stage}:${lessonOrder}:${lessonUnit}`;
    if (seen.has(key)) continue;
    seen.add(key);
    byStage.get(stage)?.push({
      stage,
      stageUnitNumber: 0,
      level: lessonOrder,
      unit: lessonUnit,
      topic: lesson.topic || '',
    });
  }

  const stageUnits: StageUnitRef[] = [];
  for (const stage of STAGE_ORDER) {
    const sorted = (byStage.get(stage) || []).sort(
      (a, b) => a.level - b.level || a.unit - b.unit,
    );
    sorted.forEach((item, index) => {
      stageUnits.push({
        ...item,
        stageUnitNumber: index + 1,
      });
    });
  }

  return stageUnits;
}

export function getStageUnitRef(
  lessons: LessonStageInput[],
  level: number,
  unit: number,
  stage?: string,
): StageUnitRef | null {
  const targetStage = resolveStageCode(level, stage);
  const all = buildStageUnitsFromLessons(lessons);
  return all.find(
    (item) => item.stage === targetStage && item.level === level && item.unit === unit,
  ) || null;
}

export function getLevelTitle(level: number): string {
  const row = LEVEL_METADATA.find((item) => item.level === level);
  return row?.title || `Unit ${level}`;
}

export function toProfileStorageId(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'user'
  );
}

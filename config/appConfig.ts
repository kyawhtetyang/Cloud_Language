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
export const CHINESE_TRACK_KEY = 'lingo_burmese_chinese_track';
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
export const CHINESE_TRACK_OPTIONS = [
  { code: 'general', label: 'General Chinese' },
  { code: 'hsk', label: 'HSK Chinese' },
] as const;
export type ChineseTrack = (typeof CHINESE_TRACK_OPTIONS)[number]['code'];
export type LearningFlowConfig = {
  lessonsPerBatch: number;
  questionsPerUnit: number;
  quickReviewCheckpoints: number[];
};

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

export function isChineseTrack(value: unknown): value is ChineseTrack {
  if (typeof value !== 'string') return false;
  return CHINESE_TRACK_OPTIONS.some((option) => option.code === value);
}

export function getLearningFlowConfig(
  learnLanguage: LearnLanguage,
  chineseTrack: ChineseTrack,
): LearningFlowConfig {
  if (learnLanguage === 'chinese' && chineseTrack === 'hsk') {
    return {
      lessonsPerBatch: 2,
      questionsPerUnit: 10,
      quickReviewCheckpoints: [2, 4, 6, 8, 10],
    };
  }

  return {
    lessonsPerBatch: LESSONS_PER_BATCH,
    questionsPerUnit: LEARN_QUESTIONS_PER_UNIT,
    quickReviewCheckpoints: QUICK_REVIEW_CHECKPOINTS,
  };
}

type LessonStageInput = {
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
    const stage = resolveStageCode(lesson.level, lesson.stage);
    const key = `${stage}:${lesson.level}:${lesson.unit}`;
    if (seen.has(key)) continue;
    seen.add(key);
    byStage.get(stage)?.push({
      stage,
      stageUnitNumber: 0,
      level: lesson.level,
      unit: lesson.unit,
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

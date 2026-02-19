import React from 'react';
import { LessonData } from '../../types';
import {
  buildStageUnitsFromLessons,
  DefaultLanguage,
  STAGE_META,
  STAGE_ORDER,
  StageCode,
} from '../../config/appConfig';

type LevelsViewProps = {
  lessons: LessonData[];
  defaultLanguage: DefaultLanguage;
  onSelectUnit: (level: number, unit: number) => void;
};

const ROADMAP_TEXT = {
  english: {
    roadmap: 'Road Map',
    unitPrefix: 'Unit',
    groupPrefix: 'Units',
    stageLabels: {
      A1: 'Beginner (A1)',
      A2: 'Pre-Intermediate (A2)',
      B1: 'Intermediate (B1)',
      B2: 'Upper-Intermediate (B2)',
    },
  },
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
} as const;

const BURMESE_TOPICS: Record<number, string[]> = {
  1: ['အက္ခရာအသံထွက်နှင့် အခြေခံအသံထွက်', 'နှုတ်ဆက်ခြင်းနှင့် မိတ်ဆက်ခြင်း', 'နာမည်၊ နိုင်ငံ၊ အလုပ် ပြောခြင်း', 'ဟုတ်/မဟုတ် တိုတောင်းဖြေခြင်း', 'စာသင်ခန်းအတွက် အခြေခံအသုံးများ စကားစုများ'],
  2: ['နေ့စဉ်လုပ်ရိုးလုပ်စဉ် ပြောခြင်း', 'လူနှင့် ပစ္စည်းများ ဖော်ပြခြင်း', 'လွယ်ကူသော မေးခွန်းများ မေးခြင်း', 'အချိန်နှင့် ရက်စွဲ ပြောခြင်း', 'လမ်းညွှန်ချက် ရိုးရှင်းစွာ ပေးခြင်း'],
  3: ['နှစ်သက်မှုများ ပြောခြင်း', 'မိသားစုနှင့် သူငယ်ချင်းများအကြောင်း ပြောခြင်း', 'ပြီးခဲ့သည့် အပတ်ကုန် အကြောင်းပြောခြင်း', 'အနာဂတ်အစီအစဉ်များ ပြောခြင်း', 'ဇာတ်ကောင်ဆောင် စကားပြောလေ့ကျင့်ခြင်း', 'ဝယ်ခြင်း/ရောင်းခြင်း', 'စျေးနှုန်းနှင့် အရေအတွက်', 'ငွေပေးချေမှုနှင့် လျှော့စျေး', 'ပြန်ပေးခြင်းနှင့် လဲလှယ်ခြင်း', 'ဈေးဝယ်စကားဝိုင်း'],
  4: ['အတိတ်ဖြစ်ရပ်များ ပြောပြခြင်း', 'အတွေ့အကြုံများ ဖော်ပြခြင်း', 'ဖြစ်စဉ်အစဉ်လိုက် ရှင်းလင်းစွာ ပြောခြင်း', 'အရာများ နှိုင်းယှဉ်ခြင်း', 'အတိုချုံး ရှင်းလင်းချက် ပေးခြင်း'],
  5: ['ယဉ်ကျေးစွာ တောင်းဆိုခြင်း', 'အကြံပေးခြင်း', 'အဆိုပြုခြင်း', 'ရိုးရှင်းသော ပြဿနာများ ကိုင်တွယ်ခြင်း', 'သဘောတူ/မတူ ဖော်ပြခြင်း'],
  6: ['အကြောင်းပြချက်နှင့် အမြင်ဖော်ပြခြင်း', 'အကြောင်းရင်းနှင့် ရလဒ် ရှင်းပြခြင်း', 'အားသာချက်/အားနည်းချက် ဖော်ပြခြင်း', 'စကားဝိုင်းတွင် သဘာဝကျစွာ တုံ့ပြန်ခြင်း', 'အဖြေများကို ယုံကြည်စိတ်ချစွာ တိုးချဲ့ပြောခြင်း'],
  7: ['အောင်မြင်မှုများ ပြောခြင်း', 'လုပ်ငန်းစဉ်များ ဖော်ပြခြင်း', 'ဖြစ်နိုင်ချေ အခြေအနေများ (if...)', 'ဆုံးဖြတ်ချက် ရှင်းပြခြင်း', 'ဇာတ်ကြောင်းပြောနည်း'],
  8: ['ထင်မြင်ချက် ပြင်းပြင်းထန်ထန် ဖော်ပြခြင်း', 'အငြင်းပွားချက်ကို ထောက်ခံချက်ဖြင့် ပံ့ပိုးခြင်း', 'အမြင်ကွာခြားချက်များ နှိုင်းယှဉ်ခြင်း', 'ဆွေးနွေးမှုတွင် တက်ကြွစွာ ပါဝင်ခြင်း', 'အလှည့်ကျပြောဆိုမှု စီမံခြင်း'],
  9: ['အငြင်းပွားချက် တင်ပြခြင်း', 'အခြားသူကို ယုံကြည်စေခြင်း', 'ကန့်ကွက်ချက်များ ကိုင်တွယ်ခြင်း', 'ဖွဲ့စည်းတကျ မီနီတင်ပြခြင်း', 'ဒီဘိတ် လေ့ကျင့်ခြင်း'],
  10: ['ဖြစ်နိုင်ချေနှင့် အယူအဆဆိုင်ရာ အကြောင်းအရာများ', 'အသေးစိတ် နှိုင်းယှဉ်ဖော်ပြခြင်း', 'ရှုပ်ထွေးသော အယူအဆများ ရှင်းလင်းခြင်း', 'အဓိပ္ပာယ်တူ စကားလုံးဖြင့် ချောမွေ့စွာ ပြန်လည်ဖော်ပြခြင်း', 'အလေးပေးပြောနည်းနှင့် ဝေါဟာရပုံစံများ'],
  11: ['လူမှုရေးကိစ္စရပ်များ ခွဲခြမ်းစိတ်ဖြာခြင်း', 'အငြင်းပွားချက်များ အကဲဖြတ်ခြင်း', 'ယဉ်ကျေးသိမ်မွေ့စွာ သဘောမတူဖော်ပြခြင်း', 'ပြဿနာ-ဖြေရှင်းချက် ဆွေးနွေးခြင်း', 'စကားပြောတွင် ဝေဖန်ဆန်းစစ်စဉ်းစားမှု'],
  12: ['အစည်းအဝေး ဦးဆောင်ခြင်း', 'ဖော်မယ် တင်ပြချက်များ', 'ညှိနှိုင်းဆွေးနွေးနည်းလမ်းများ', 'Q&A ကိုင်တွယ်နိုင်မှု', 'အုပ်ချုပ်ရေးအဆင့် ဆက်သွယ်ပြောဆိုမှု'],
};

function localizeTopic(defaultLanguage: DefaultLanguage, level: number, unit: number, topic: string): string {
  if (defaultLanguage !== 'burmese') return topic;
  return BURMESE_TOPICS[level]?.[unit - 1] || topic;
}

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
  const text = defaultLanguage === 'burmese' ? ROADMAP_TEXT.burmese : ROADMAP_TEXT.english;
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
                const start = group[0]?.stageUnitNumber || 1;
                const end = group[group.length - 1]?.stageUnitNumber || start;
                const firstTopic = group[0]
                  ? localizeTopic(defaultLanguage, group[0].level, group[0].unit, group[0].topic)
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
                          {localizeTopic(defaultLanguage, entry.level, entry.unit, entry.topic)}
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

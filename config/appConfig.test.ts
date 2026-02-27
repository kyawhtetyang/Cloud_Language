import { describe, expect, it } from 'vitest';
import { resolveLessonTranslationText } from './appConfig';

describe('resolveLessonTranslationText', () => {
  it('uses mapped translation for selected default language', () => {
    const value = resolveLessonTranslationText({
      lessonEnglish: '你们上午几点喝茶？',
      lessonBurmese: 'What time do you have tea in the morning?',
      lessonTranslations: {
        english: 'What time do you have tea in the morning?',
        vietnamese: 'Các bạn uống trà lúc mấy giờ vào buổi sáng?',
        burmese: 'မနက်ပိုင်းမှာ ဘယ်နှစ်နာရီလောက် လက်ဖက်ရည် သောက်ကြသလဲ?',
      },
      defaultLanguage: 'vietnamese',
      learnLanguage: 'hsk_chinese',
    });

    expect(value).toBe('Các bạn uống trà lúc mấy giờ vào buổi sáng?');
  });

  it('falls back to legacy line when selected tag is missing', () => {
    const value = resolveLessonTranslationText({
      lessonEnglish: '你们上午几点喝茶？',
      lessonBurmese: 'What time do you have tea in the morning?',
      lessonTranslations: {
        burmese: 'မနက်ပိုင်းမှာ ဘယ်နှစ်နာရီလောက် လက်ဖက်ရည် သောက်ကြသလဲ?',
      },
      defaultLanguage: 'vietnamese',
      learnLanguage: 'hsk_chinese',
    });

    expect(value).toBe('What time do you have tea in the morning?');
  });

  it('keeps legacy fallback behavior when mapped translations are unavailable', () => {
    const value = resolveLessonTranslationText({
      lessonEnglish: '你们上午几点喝茶？',
      lessonBurmese: 'What time do you have tea in the morning?',
      defaultLanguage: 'english',
      learnLanguage: 'hsk_chinese',
    });

    expect(value).toBe('What time do you have tea in the morning?');
  });
});

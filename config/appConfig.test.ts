import { describe, expect, it } from 'vitest';
import {
  resolveLessonLearningPronunciationText,
  resolveLessonLearningSourceText,
  resolveLessonTranslationText,
} from './appConfig';

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

describe('learning language resolvers', () => {
  it('uses vietnamese tags for learning source and pronunciation', () => {
    const source = resolveLessonLearningSourceText({
      lessonEnglish: 'Hello',
      lessonTranslations: {
        vi: 'Xin chao',
      },
      learnLanguage: 'vietnamese',
    });
    const pronunciation = resolveLessonLearningPronunciationText({
      lessonPronunciation: '',
      lessonTranslations: {
        vi_py: 'sin chao',
      },
      learnLanguage: 'vietnamese',
    });

    expect(source).toBe('Xin chao');
    expect(pronunciation).toBe('sin chao');
  });

  it('uses thai tags for learning source and pronunciation', () => {
    const source = resolveLessonLearningSourceText({
      lessonEnglish: 'Hello',
      lessonTranslations: {
        th: 'สวัสดี',
      },
      learnLanguage: 'thai',
    });
    const pronunciation = resolveLessonLearningPronunciationText({
      lessonPronunciation: '',
      lessonTranslations: {
        th_py: 'sa-wat-dee',
      },
      learnLanguage: 'thai',
    });

    expect(source).toBe('สวัสดี');
    expect(pronunciation).toBe('sa-wat-dee');
  });

  it('falls back to lesson english when vietnamese or thai source is missing', () => {
    const vietnameseSource = resolveLessonLearningSourceText({
      lessonEnglish: 'Fallback source',
      lessonTranslations: {
        english: 'Fallback source',
      },
      learnLanguage: 'vietnamese',
    });
    const thaiSource = resolveLessonLearningSourceText({
      lessonEnglish: 'Fallback source',
      lessonTranslations: {
        english: 'Fallback source',
      },
      learnLanguage: 'thai',
    });

    expect(vietnameseSource).toBe('Fallback source');
    expect(thaiSource).toBe('Fallback source');
  });
});

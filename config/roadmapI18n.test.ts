import { describe, expect, it } from 'vitest';
import { getRoadmapText, localizeRoadmapTopic } from './roadmapI18n';

describe('roadmapI18n', () => {
  it('returns burmese roadmap text for burmese default language', () => {
    expect(getRoadmapText('burmese').roadmap).toBe('စာကြည့်တိုက်');
  });

  it('falls back to english roadmap text when language pack is missing', () => {
    expect(getRoadmapText('french' as never).roadmap).toBe('Library');
  });

  it('localizes full roadmap unit titles for burmese', () => {
    expect(localizeRoadmapTopic('Alphabet sounds & basic pronunciation', 'burmese')).toBe(
      'အက္ခရာအသံများနှင့် အခြေခံအသံထွက်',
    );
  });

  it('keeps source topic when no mapping exists for the selected language', () => {
    expect(localizeRoadmapTopic('Alphabet sounds & basic pronunciation', 'french' as never)).toBe(
      'Alphabet sounds & basic pronunciation',
    );
  });
});




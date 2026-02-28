import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonView } from './LessonView';
import type { LessonData } from '../../types';

const lesson: LessonData = {
  level: 1,
  unit: 1,
  topic: 'Greeting',
  english: 'Hello there',
  burmese: 'မင်္ဂလာပါ',
  pronunciation: 'heh-loh',
};

describe('LessonView', () => {
  it('applies active style to pronunciation line when row is active and pronunciation is enabled', () => {
    render(
      <LessonView
        currentIndex={0}
        currentBatchEntries={[{ lesson, lessonIndex: 0 }]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        learnLanguage="english"
        activeSpeakingLessonIndex={0}
      />,
    );

    const pronunciationLine = document.querySelector('.lesson-row-pronunciation');
    const sourceLine = document.querySelector('.lesson-row-source');
    const translationLine = document.querySelector('.lesson-row-translation');

    expect(pronunciationLine).not.toBeNull();
    expect(sourceLine).not.toBeNull();
    expect(translationLine).not.toBeNull();
    expect(pronunciationLine).toHaveStyle({ color: 'var(--color-brand)' });
    expect(sourceLine).toHaveStyle({ color: 'var(--color-brand)' });
    expect(translationLine).toHaveStyle({ color: 'var(--color-brand)' });
  });
});

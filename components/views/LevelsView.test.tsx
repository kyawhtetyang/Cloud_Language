import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LevelsView } from './LevelsView';
import { LessonData } from '../../types';

const lessons: LessonData[] = [
  {
    level: 1,
    unit: 1,
    stage: 'A1',
    topic: 'Burmese words',
    english: 'Hello',
    burmese: 'မင်္ဂလာပါ',
    pronunciation: 'mingalaba',
  },
];

describe('LevelsView topic localization', () => {
  it('localizes known roadmap topic labels when default language is burmese', () => {
    render(<LevelsView lessons={lessons} defaultLanguage="burmese" onSelectUnit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /မြန်မာ စကားလုံးများ/i })).toBeInTheDocument();
  });

  it('keeps original topic labels when default language is english', () => {
    render(<LevelsView lessons={lessons} defaultLanguage="english" onSelectUnit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Burmese words/i })).toBeInTheDocument();
  });
});

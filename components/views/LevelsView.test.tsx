import { fireEvent, render, screen } from '@testing-library/react';
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
    collectionLabel: 'Collection 1',
    sourceLabel: 'Burmese words',
  },
];

function swipeFromLeftEdge(element: HTMLElement) {
  fireEvent.touchStart(element, {
    touches: [{ identifier: 1, target: element, clientX: 8, clientY: 120 }],
  });
  fireEvent.touchMove(element, {
    touches: [{ identifier: 1, target: element, clientX: 84, clientY: 125 }],
  });
  fireEvent.touchEnd(element, {
    changedTouches: [{ identifier: 1, target: element, clientX: 116, clientY: 126 }],
  });
}

describe('LevelsView topic localization', () => {
  it('localizes known roadmap topic labels when default language is burmese', () => {
    render(
      <LevelsView
        lessons={lessons}
        defaultLanguage="burmese"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /open group/i }));

    expect(screen.getByRole('button', { name: /မြန်မာ စကားလုံးများ/i })).toBeInTheDocument();
  });

  it('keeps original topic labels when default language is english', () => {
    render(
      <LevelsView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /open group/i }));

    expect(screen.getByRole('button', { name: /Burmese words/i })).toBeInTheDocument();
  });

  it('renders completed units with gray style', () => {
    render(
      <LevelsView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
        completedUnitKeys={new Set(['1:1'])}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /open group/i }));

    expect(screen.getByLabelText(/completed unit/i)).toBeInTheDocument();
  });

  it('plays unit when row is tapped, and opens lesson only when arrow is tapped', () => {
    const onReadAlbum = vi.fn();
    const onSelectUnit = vi.fn();
    render(
      <LevelsView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={onSelectUnit}
        onReadAlbum={onReadAlbum}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open group/i }));
    fireEvent.click(screen.getByRole('button', { name: /Burmese words/i }));

    expect(onReadAlbum).toHaveBeenCalledWith([{ level: 1, unit: 1 }], expect.any(String));
    expect(onSelectUnit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /open lesson 1.1/i }));
    expect(onSelectUnit).toHaveBeenCalledWith(1, 1, expect.any(String));
  });

  it('supports swipe-back from album detail to album list', () => {
    const { getByTestId } = render(
      <LevelsView
        lessons={lessons}
        defaultLanguage="english"
        learnLanguage="burmese"
        onSelectUnit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open group/i }));
    swipeFromLeftEdge(getByTestId('album-detail-view'));

    expect(screen.getByRole('button', { name: /open group/i })).toBeInTheDocument();
  });
});

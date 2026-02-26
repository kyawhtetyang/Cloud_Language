import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LessonView } from './LessonView';
import { SettingsView } from './SettingsView';
import { LessonData } from '../../types';

function swipeFromLeftEdge(element: HTMLElement) {
  fireEvent.touchStart(element, {
    touches: [{ identifier: 1, target: element, clientX: 10, clientY: 120 }],
  });
  fireEvent.touchMove(element, {
    touches: [{ identifier: 1, target: element, clientX: 88, clientY: 124 }],
  });
  fireEvent.touchEnd(element, {
    changedTouches: [{ identifier: 1, target: element, clientX: 120, clientY: 126 }],
  });
}

describe('Swipe-back behavior', () => {
  it('triggers lesson back handler on valid edge swipe', () => {
    const onBackToRoadmap = vi.fn();
    const lesson: LessonData = {
      level: 1,
      unit: 1,
      stage: 'A1',
      topic: 'Greetings',
      english: 'Hello',
      burmese: 'မင်္ဂလာပါ',
      pronunciation: 'mingalaba',
    };

    const { container } = render(
      <LessonView
        onBackToRoadmap={onBackToRoadmap}
        currentIndex={0}
        currentBatchEntries={[{ lesson, lessonIndex: 0 }]}
        englishReferenceByKey={new Map()}
        defaultLanguage="english"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        learnLanguage="burmese"
      />,
    );

    swipeFromLeftEdge(container.firstElementChild as HTMLElement);
    expect(onBackToRoadmap).toHaveBeenCalledTimes(1);
  });

  it('returns from settings subpage to main page on edge swipe', () => {
    const { container } = render(
      <SettingsView
        defaultLanguage="english"
        learnLanguage="burmese"
        isPronunciationEnabled
        isBoldTextEnabled={false}
        isAutoScrollEnabled
        textScalePercent={100}
        canDecreaseTextSize
        canIncreaseTextSize
        translationLabel="English -> Burmese"
        appTheme="dark"
        voiceProvider="default"
        onDefaultLanguageChange={vi.fn()}
        onLearnLanguageChange={vi.fn()}
        onTogglePronunciation={vi.fn()}
        onToggleBoldText={vi.fn()}
        onToggleAutoScroll={vi.fn()}
        onDecreaseTextSize={vi.fn()}
        onIncreaseTextSize={vi.fn()}
        onAppThemeChange={vi.fn()}
        onVoiceProviderChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /default language/i }));
    expect(screen.getByLabelText(/back to settings/i)).toBeInTheDocument();

    swipeFromLeftEdge(container.firstElementChild as HTMLElement);
    expect(screen.queryByLabelText(/back to settings/i)).not.toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatPracticeView } from './ChatPracticeView';
import { getAppText } from '../../config/appI18n';

describe('ChatPracticeView', () => {
  it('does not show fallback message before user sends input when no highlights are available', () => {
    render(
      <ChatPracticeView
        defaultLanguage="english"
        highlightPhrasesByLessonKey={new Map()}
      />,
    );

    expect(screen.queryByText(getAppText('english').appState.lessonsUnavailableDefaultMessage)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('accepts typing when highlight pool is empty', () => {
    render(
      <ChatPracticeView
        defaultLanguage="english"
        highlightPhrasesByLessonKey={new Map()}
      />,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: getAppText('english').profile.saveLabel }));

    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.queryByText(getAppText('english').appState.lessonsUnavailableDefaultMessage)).not.toBeInTheDocument();
  });

  it('selects a random highlighted phrase after correct answer', () => {
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99);
    const highlights = new Map<string, string[]>([
      ['l1', ['hello there', 'thank you', 'good night']],
      ['l2', ['hello there']],
    ]);
    render(
      <ChatPracticeView
        defaultLanguage="english"
        highlightPhrasesByLessonKey={highlights}
      />,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello there' } });
    fireEvent.click(screen.getByRole('button', { name: getAppText('english').profile.saveLabel }));

    expect(randomSpy).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText('thank you').length).toBeGreaterThan(0);
    expect(screen.getAllByText('✓').length).toBeGreaterThan(0);
    randomSpy.mockRestore();
  });

  it('marks typo as retry when letters differ (o\'clock vs o\'click)', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const highlights = new Map<string, string[]>([
      ['l1', ['it is one o\'clock.']],
    ]);
    render(
      <ChatPracticeView
        defaultLanguage="english"
        highlightPhrasesByLessonKey={highlights}
      />,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'it is one o\'click.' } });
    fireEvent.click(screen.getByRole('button', { name: getAppText('english').profile.saveLabel }));

    expect(screen.getAllByText('✗').length).toBeGreaterThan(0);
    randomSpy.mockRestore();
  });
});

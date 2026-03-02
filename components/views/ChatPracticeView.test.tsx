import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatPracticeView } from './ChatPracticeView';
import { getAppText } from '../../config/appI18n';

describe('ChatPracticeView', () => {
  it('shows fallback message when no highlight phrases are available', () => {
    render(
      <ChatPracticeView
        defaultLanguage="english"
        highlightPhrasesByLessonKey={new Map()}
      />,
    );

    expect(screen.getByText(getAppText('english').appState.lessonsUnavailableDefaultMessage)).toBeInTheDocument();
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

    expect(screen.getAllByText(getAppText('english').appState.lessonsUnavailableDefaultMessage).length).toBeGreaterThan(0);
  });

  it('cycles to next ranked phrase after correct answer', () => {
    const highlights = new Map<string, string[]>([
      ['l1', ['hello there', 'thank you']],
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

    expect(screen.getAllByText('thank you').length).toBeGreaterThan(0);
    expect(screen.getAllByText('✓').length).toBeGreaterThan(0);
  });
});

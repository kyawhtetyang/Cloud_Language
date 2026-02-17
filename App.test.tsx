import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

function createLessons() {
  return Array.from({ length: 10 }, (_, index) => ({
    level: 1,
    unit: 1,
    topic: 'Unit Topic',
    english: `English ${index + 1}`,
    burmese: `Burmese ${index + 1}`,
    pronunciation: `Pronunciation ${index + 1}`,
  }));
}

function mockJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('App quick review navigation guard', () => {
  const lessons = createLessons();
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('lingo_burmese_profile_name', 'tester');
    localStorage.setItem('lingo_burmese_default_language', 'english');
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(lessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps quiz state when user cancels leave confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);

    await screen.findByText('Welcome back');
    fireEvent.click(screen.getAllByRole('button', { name: 'Lesson' })[0]);
    await screen.findByRole('button', { name: 'Next' });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quick Review' }));
    await screen.findByText('Match each sentence');

    fireEvent.click(screen.getAllByRole('button', { name: 'Road Map' })[0]);
    await screen.findByRole('heading', { name: 'Road Map' });
    fireEvent.click(screen.getAllByRole('button', { name: /Unit Topic/i })[0]);

    expect(confirmSpy).toHaveBeenCalledOnce();
    fireEvent.click(screen.getAllByRole('button', { name: 'Lesson' })[0]);
    expect(await screen.findByText('Match each sentence')).toBeInTheDocument();
  });

  it('leaves quiz and navigates to selected unit when user confirms', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);

    await screen.findByText('Welcome back');
    fireEvent.click(screen.getAllByRole('button', { name: 'Lesson' })[0]);
    await screen.findByRole('button', { name: 'Next' });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quick Review' }));
    await screen.findByText('Match each sentence');

    fireEvent.click(screen.getAllByRole('button', { name: 'Road Map' })[0]);
    await screen.findByRole('heading', { name: 'Road Map' });
    fireEvent.click(screen.getAllByRole('button', { name: /Unit Topic/i })[0]);

    expect(confirmSpy).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });
    expect(screen.queryByText('Match each sentence')).not.toBeInTheDocument();
  });
});

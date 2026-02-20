import { fireEvent, render, screen } from '@testing-library/react';
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

function createTwoUnitLessons() {
  return [
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 1,
      topic: 'Unit 1 Topic',
      english: `English ${index + 1}`,
      burmese: `Burmese ${index + 1}`,
      pronunciation: `Pronunciation ${index + 1}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 2,
      topic: 'Unit 2 Topic',
      english: `English ${index + 11}`,
      burmese: `Burmese ${index + 11}`,
      pronunciation: `Pronunciation ${index + 11}`,
    })),
  ];
}

function createTwoStageLessons() {
  return [
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 1,
      stage: 'A1',
      topic: 'A1 Unit 1 Topic',
      english: `English ${index + 1}`,
      burmese: `Burmese ${index + 1}`,
      pronunciation: `Pronunciation ${index + 1}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 1,
      unit: 2,
      stage: 'A1',
      topic: 'A1 Unit 2 Topic',
      english: `English ${index + 11}`,
      burmese: `Burmese ${index + 11}`,
      pronunciation: `Pronunciation ${index + 11}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 2,
      unit: 1,
      stage: 'A2',
      topic: 'A2 Unit 1 Topic',
      english: `English ${index + 21}`,
      burmese: `Burmese ${index + 21}`,
      pronunciation: `Pronunciation ${index + 21}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      level: 2,
      unit: 2,
      stage: 'A2',
      topic: 'A2 Unit 2 Topic',
      english: `English ${index + 31}`,
      burmese: `Burmese ${index + 31}`,
      pronunciation: `Pronunciation ${index + 31}`,
    })),
  ];
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

  it('shows 10/10 completion modal at unit boundary', async () => {
    render(<App />);

    await screen.findByRole('button', { name: 'Next' });
    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/10\/10 Complete|10\/10 ပြီးပါပြီ/i)).toBeInTheDocument();
  });

  it('continues to next unit when confirming boundary modal', async () => {
    const twoUnitLessons = createTwoUnitLessons();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(twoUnitLessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);

    await screen.findByRole('button', { name: 'Next' });
    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: /Continue to next unit|နောက်ယူနစ်သို့ ဆက်မယ်/i }));

    expect((await screen.findAllByText('English 11')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 12')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 13')).length).toBeGreaterThan(0);
  });


  it('keeps next button label as Next through lesson flow', async () => {
    render(<App />);

    await screen.findByRole('button', { name: 'Next' });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('does not show review toggle in settings', async () => {
    render(<App />);

    await screen.findByRole('button', { name: 'Next' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Settings' })[0]);
    await screen.findByText('Default Language');
    expect(screen.queryByText('Review Questions')).not.toBeInTheDocument();
  });

  it('moves back to previous learn batch when previous is clicked', async () => {
    render(<App />);

    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect((await screen.findAllByText('English 4')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 5')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 6')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);
  });

  it('moves to previous unit last batch when previous is clicked at step 0', async () => {
    const twoUnitLessons = createTwoUnitLessons();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(twoUnitLessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);
    await screen.findByRole('button', { name: 'Next' });

    fireEvent.click(screen.getAllByRole('button', { name: 'Library' })[0]);
    await screen.findAllByRole('button', { name: /open album group/i });
    fireEvent.click(screen.getAllByRole('button', { name: /open album group/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /Unit 2 Topic/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Lesson' })[0]);

    expect((await screen.findAllByText('English 11')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 12')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 13')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect((await screen.findAllByText('English 8')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 9')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 10')).length).toBeGreaterThan(0);
  });

  it('loops current unit when repeat-one is enabled', async () => {
    render(<App />);

    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Enable repeat all' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enable repeat one' }));

    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }

    expect((await screen.findAllByText('English 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 2')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 3')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect((await screen.findAllByText('English 8')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 9')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 10')).length).toBeGreaterThan(0);
  });

  it('repeat-all wraps within current stage when previous is clicked at stage start', async () => {
    const twoStageLessons = createTwoStageLessons();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockJsonResponse(twoStageLessons));
      }
      if (url.includes('/api/progress?profileName=')) {
        return Promise.resolve(mockJsonResponse({ message: 'not found' }, 404));
      }
      if (url.includes('/api/progress') && init?.method === 'PUT') {
        return Promise.resolve(mockJsonResponse({ ok: true }));
      }
      return Promise.resolve(mockJsonResponse({}));
    });

    render(<App />);
    await screen.findByRole('button', { name: 'Next' });

    fireEvent.click(screen.getAllByRole('button', { name: 'Library' })[0]);
    await screen.findAllByRole('button', { name: /open album group/i });
    fireEvent.click(screen.getAllByRole('button', { name: /open album group/i })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: /A2 Unit 1 Topic/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Lesson' })[0]);

    expect((await screen.findAllByText('English 21')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 22')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 23')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Enable repeat all' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect((await screen.findAllByText('English 38')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 39')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('English 40')).length).toBeGreaterThan(0);
  });

});


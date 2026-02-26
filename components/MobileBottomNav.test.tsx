import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileBottomNav } from './MobileBottomNav';

describe('MobileBottomNav', () => {
  it('highlights the active tab', () => {
    render(<MobileBottomNav activeTab="settings" onTabChange={vi.fn()} />);

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    const lessonButton = screen.getByRole('button', { name: 'Lesson' });
    const settingsIconWrap = settingsButton.querySelector('span');

    expect(settingsButton.className).toContain('text-brand');
    expect(lessonButton.className).toContain('text-[var(--text-secondary)]');
    expect(settingsIconWrap?.className).toContain('bg-transparent');
    expect(settingsIconWrap?.className).toContain('text-brand');
  });

  it('calls onTabChange when buttons are clicked', () => {
    const onTabChange = vi.fn();
    render(<MobileBottomNav activeTab="lesson" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Library' }));
    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

    expect(onTabChange).toHaveBeenNthCalledWith(1, 'levels');
    expect(onTabChange).toHaveBeenNthCalledWith(2, 'profile');
  });
});


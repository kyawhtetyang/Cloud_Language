import { describe, expect, it } from 'vitest';
import { getAppText } from './appI18n';

describe('appI18n', () => {
  it('returns localized library text for vietnamese', () => {
    const text = getAppText('vietnamese');
    expect(text.library.playAllLabel).toBe('Đọc tất cả');
    expect(text.library.searchPlaceholder).toBe('Tìm kiếm thư viện');
  });

  it('returns localized logout text for burmese', () => {
    const text = getAppText('burmese');
    expect(text.logoutModal.title).toBe('Log out လုပ်မလား?');
    expect(text.logoutModal.cancelLabel).toBe('မထွက်တော့ဘူး');
  });
});

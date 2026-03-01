import { BUTTON_UI, INTERACTIVE_SIZE } from './buttonUi';

const SETTINGS_ROW_HEIGHT_CLASS = 'h-14';

export const SETTINGS_UI = {
  sectionTitle: 'text-base font-medium text-[var(--text-primary)]',
  listCard:
    'overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)]',
  listDivider: 'border-t border-[var(--border-subtle)]',
  rowHeight: SETTINGS_ROW_HEIGHT_CLASS,
  listRow: `w-full ${SETTINGS_ROW_HEIGHT_CLASS} flex items-center justify-between gap-3 px-4 text-left transition-colors hover:bg-[var(--surface-hover)]`,
  staticRow: `${SETTINGS_ROW_HEIGHT_CLASS} flex items-center px-4`,
  rowValue: 'flex items-center gap-2 text-sm font-normal text-[var(--text-secondary)]',
  optionLabel: 'text-base font-medium text-[var(--text-primary)]',
  rightControlSlot: 'flex items-center justify-end',
  toggleControlSlot: 'flex min-w-16 items-center justify-end',
  textSizeRow: 'w-full flex items-center justify-between gap-4',
  textSizeControlSlot: 'ml-auto flex items-center justify-end',
  textSizeControlGroup: 'flex items-center gap-2',
  textSizeButtonBase: `${INTERACTIVE_SIZE.touchTarget} rounded-lg border-2 text-base font-extrabold transition-all`,
  textSizeButtonDisabled:
    'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed',
  textSizeValue: 'min-w-12 text-center text-xs font-normal text-[var(--text-secondary)]',
  toggleBadgeBase:
    'inline-flex min-w-16 items-center justify-center rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all',
  toggleBadgeOn: 'btn-selected',
  toggleBadgeOff: 'btn-unselected text-[var(--text-secondary)]',
  subPageHeader: 'mb-4 flex items-center gap-3',
  subPageBackButton: `${BUTTON_UI.iconNavButton} ${BUTTON_UI.iconNavGlyph}`,
  subPageTitle: 'text-lg font-normal text-ink',
} as const;

export const SETTINGS_UI_TEXT = {
  on: 'On',
  off: 'Off',
} as const;

export function getSettingsToggleBadgeClass(isOn: boolean): string {
  return `${SETTINGS_UI.toggleBadgeBase} ${isOn ? SETTINGS_UI.toggleBadgeOn : SETTINGS_UI.toggleBadgeOff}`;
}

export function getSettingsTextSizeButtonClass(isEnabled: boolean): string {
  return `${SETTINGS_UI.textSizeButtonBase} ${
    isEnabled ? 'btn-unselected' : SETTINGS_UI.textSizeButtonDisabled
  }`;
}

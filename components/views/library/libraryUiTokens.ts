import { BUTTON_UI } from '../../../config/buttonUi';

export const LIBRARY_UI_TOKENS = {
  searchWrap: 'mb-3 w-full border-b border-[var(--border-subtle)] pb-2',
  searchRow: 'top-toolbar-row relative flex items-center',
  searchIcon:
    'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]',
  searchInput:
    'top-toolbar-control w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] pl-9 pr-3 text-base md:text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]',
  sectionWrap:
    'mb-4 last:mb-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)]',
  sectionHeaderBar: 'px-3 py-2 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]',
  sectionHeaderText:
    'text-xs font-extrabold uppercase tracking-[0.16em] md:text-xs text-[var(--text-secondary)]',
  sectionAccent: 'text-[var(--text-muted)]',
  iconButton: `${BUTTON_UI.iconCircleButtonBase} ${BUTTON_UI.iconCircleButtonDefault}`,
  groupCardButton: 'selection-hover w-full min-h-[84px] px-3 py-3 text-left transition-colors',
  unitRowBase:
    'selection-hover flex w-full min-h-[64px] items-center px-3 text-left transition-colors bg-[var(--surface-default)]',
  unitRowActive: 'bg-[var(--surface-active)]',
  unitOpenButton: 'flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-[var(--surface-hover)]',
} as const;

export const LIBRARY_STATE_STYLE = {
  badgeDefault: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]',
  badgeActive:
    'border border-[var(--border-strong)] bg-[var(--surface-default)] text-[var(--text-primary)]',
  badgeCompleted: 'bg-[var(--surface-subtle)] text-[var(--text-muted)]',
  downloadDefault:
    'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
  downloadDone:
    'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-secondary)]',
  downloadLoading:
    'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-muted)] opacity-70 cursor-wait',
} as const;

export const LIBRARY_UI_TOKENS = {
  searchWrap: 'mb-3 w-full border-b border-[var(--border-subtle)] pb-2',
  searchRow: 'top-toolbar-row relative flex items-center',
  searchIcon:
    'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]',
  searchInput:
    'top-toolbar-control w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] pl-9 pr-3 text-base md:text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]',
  sectionWrap:
    'mb-6 last:mb-0 overflow-hidden rounded-[24px] border-2 border-[var(--border-subtle)] bg-[var(--surface-default)] shadow-xl',
  sectionHeaderBar: 'px-3 py-2 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]',
  sectionHeaderText:
    'text-xs font-extrabold uppercase tracking-[0.16em] md:text-xs text-[var(--text-secondary)]',
  sectionAccent: 'text-[var(--text-muted)]',
  iconButton:
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]',
  unitRowBase:
    'selection-hover flex w-full min-h-[64px] items-center px-3 text-left transition-colors bg-[var(--surface-default)]',
  unitRowActive: 'bg-[var(--surface-active)]',
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

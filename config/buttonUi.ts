export const BUTTON_UI = {
  iconNavButton:
    'inline-flex h-9 w-9 items-center justify-center rounded-full border-2 btn-unselected text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]',
  iconNavGlyph: 'text-lg font-black leading-none',
  footerRoundBase:
    'flex items-center justify-center rounded-full border-2 transition-all duration-300 ease-out',
  footerRoundSmall: 'h-10 w-10',
  footerRoundLarge: 'h-12 w-12',
  footerSelected: 'btn-selected',
  footerUnselected: 'btn-unselected',
  footerDisabledSmall: 'btn-unselected cursor-not-allowed opacity-50',
  footerDisabledLarge: 'btn-unselected cursor-not-allowed',
  footerInteractiveSmall: 'btn-unselected active:scale-[0.97]',
  footerInteractiveLarge: 'btn-unselected hover:scale-[1.02] active:scale-[0.98]',
  actionBase: 'border-2 font-extrabold uppercase tracking-wide transition-all',
  actionShapeDefault: 'rounded-xl',
  actionShapeLarge: 'rounded-2xl',
  actionSizeSm: 'px-3 py-2 text-xs',
  actionSizeMd: 'px-4 py-3 text-sm',
  actionSizeLg: 'py-4 text-lg tracking-wider',
  actionPrimary: 'btn-selected',
  actionSecondary: 'btn-unselected',
  actionDisabled:
    'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed',
  actionFullWidth: 'w-full',
  sidebarNavBase:
    'w-full rounded-xl border-2 text-sm font-extrabold uppercase tracking-wide transition-all',
  sidebarNavCompactPadding: 'px-3 py-2.5',
  sidebarNavProfilePadding: 'px-3 py-3',
  sidebarNavActive: 'btn-nav-selected',
  sidebarNavInactive: 'btn-unselected text-[var(--text-secondary)]',
  sidebarBrandIcon: 'inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 btn-selected',
  sidebarCloseButton: 'md:hidden text-[var(--text-secondary)] font-bold text-xl',
  dialogDismissOverlay: 'absolute inset-0 bg-black/40',
  sidebarDismissOverlay: 'fixed inset-0 bg-black/30 z-30 md:hidden',
  iconCircleButtonBase:
    'inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
  iconCircleButtonDefault:
    'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
  iconCircleButtonActive:
    'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-secondary)]',
  iconCircleButtonLoading:
    'border-[var(--border-strong)] bg-[var(--surface-active)] text-[var(--text-muted)] cursor-wait',
  mobileNavButtonBase: 'h-16 flex flex-col items-center justify-center gap-1 rounded-xl transition-all',
  mobileNavButtonActive: 'bg-transparent text-brand',
  mobileNavButtonInactive: 'bg-transparent text-[var(--text-secondary)]',
  mobileNavIconWrapBase: 'flex items-center justify-center transition-all',
  mobileNavIconWrapActive: 'bg-transparent text-brand shadow-none',
  mobileNavIconWrapInactive: 'bg-transparent text-[var(--text-secondary)]',
  mobileNavLabelBase: 'text-xs font-bold leading-none',
  mobileNavLabelActive: 'text-brand',
  mobileNavLabelInactive: 'text-[var(--text-secondary)]',
  bottomBarCardBase:
    'w-full rounded-xl border border-[var(--border-strong)] backdrop-blur-md',
  bottomBarCardSolid:
    'bg-[var(--surface-default)] shadow-[0_12px_28px_rgba(0,0,0,0.16)]',
  bottomBarCardFrosted:
    'bg-[color:color-mix(in_srgb,var(--surface-default)_88%,transparent)] shadow-[0_12px_28px_rgba(0,0,0,0.16)]',
  bottomBarCardInteractive:
    'transition-transform duration-300 md:hover:translate-y-[-1px]',
  bottomBarMobileAnchor:
    'bottom-[calc(78px+env(safe-area-inset-bottom))]',
  bottomBarDesktopAnchor:
    'md:bottom-4 md:left-72 md:right-0 md:w-auto md:max-w-none md:translate-x-0 md:px-6 md:pb-0',
  bottomBarContentFrame: 'mx-auto w-full max-w-3xl',
  pillButtonBase: 'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
  pillButtonDefault:
    'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-secondary)]',
  pillButtonMuted:
    'border-[var(--border-subtle)] bg-[var(--surface-default)] text-[var(--text-muted)]',
  pillButtonSelected: 'selection-selected-badge',
} as const;

type FooterSmallButtonOptions = {
  isSelected?: boolean;
  isDisabled?: boolean;
  isInteractive?: boolean;
};

export function getFooterSmallButtonClass({
  isSelected = false,
  isDisabled = false,
  isInteractive = false,
}: FooterSmallButtonOptions): string {
  if (isDisabled) {
    return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerDisabledSmall}`;
  }
  if (isSelected) {
    return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerSelected}`;
  }
  if (isInteractive) {
    return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerInteractiveSmall}`;
  }
  return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundSmall} ${BUTTON_UI.footerUnselected}`;
}

export function getFooterLargeButtonClass(isDisabled: boolean): string {
  return `${BUTTON_UI.footerRoundBase} ${BUTTON_UI.footerRoundLarge} ${
    isDisabled ? BUTTON_UI.footerDisabledLarge : BUTTON_UI.footerInteractiveLarge
  }`;
}

type ActionButtonOptions = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'default' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
};

export function getActionButtonClass({
  variant = 'secondary',
  size = 'sm',
  shape = 'default',
  fullWidth = false,
  disabled = false,
}: ActionButtonOptions = {}): string {
  const shapeClass = shape === 'large' ? BUTTON_UI.actionShapeLarge : BUTTON_UI.actionShapeDefault;
  const sizeClass = size === 'lg' ? BUTTON_UI.actionSizeLg : size === 'md' ? BUTTON_UI.actionSizeMd : BUTTON_UI.actionSizeSm;
  const widthClass = fullWidth ? BUTTON_UI.actionFullWidth : '';
  const toneClass = disabled
    ? BUTTON_UI.actionDisabled
    : variant === 'primary'
      ? BUTTON_UI.actionPrimary
      : BUTTON_UI.actionSecondary;
  return `${shapeClass} ${BUTTON_UI.actionBase} ${sizeClass} ${toneClass} ${widthClass}`.trim();
}

export function getSidebarNavButtonClass(active: boolean, profile = false): string {
  return `${BUTTON_UI.sidebarNavBase} ${
    profile ? BUTTON_UI.sidebarNavProfilePadding : BUTTON_UI.sidebarNavCompactPadding
  } ${active ? BUTTON_UI.sidebarNavActive : BUTTON_UI.sidebarNavInactive}`;
}

export function getIconCircleButtonClass(state: 'default' | 'active' | 'loading'): string {
  const toneClass = state === 'loading'
    ? BUTTON_UI.iconCircleButtonLoading
    : state === 'active'
      ? BUTTON_UI.iconCircleButtonActive
      : BUTTON_UI.iconCircleButtonDefault;
  return `${BUTTON_UI.iconCircleButtonBase} ${toneClass}`;
}

export function getMobileNavButtonClass(isActive: boolean): string {
  return `${BUTTON_UI.mobileNavButtonBase} ${
    isActive ? BUTTON_UI.mobileNavButtonActive : BUTTON_UI.mobileNavButtonInactive
  }`;
}

export function getMobileNavIconWrapClass(isActive: boolean): string {
  return `${BUTTON_UI.mobileNavIconWrapBase} ${
    isActive ? BUTTON_UI.mobileNavIconWrapActive : BUTTON_UI.mobileNavIconWrapInactive
  }`;
}

export function getMobileNavLabelClass(isActive: boolean): string {
  return `${BUTTON_UI.mobileNavLabelBase} ${
    isActive ? BUTTON_UI.mobileNavLabelActive : BUTTON_UI.mobileNavLabelInactive
  }`;
}

type BottomBarCardOptions = {
  variant?: 'solid' | 'frosted';
  interactive?: boolean;
};

export function getBottomBarCardClass({
  variant = 'solid',
  interactive = false,
}: BottomBarCardOptions = {}): string {
  const variantClass = variant === 'frosted'
    ? BUTTON_UI.bottomBarCardFrosted
    : BUTTON_UI.bottomBarCardSolid;
  return `${BUTTON_UI.bottomBarCardBase} ${variantClass} ${interactive ? BUTTON_UI.bottomBarCardInteractive : ''}`.trim();
}

export function getPillButtonClass(state: 'default' | 'muted' | 'selected'): string {
  const toneClass = state === 'selected'
    ? BUTTON_UI.pillButtonSelected
    : state === 'muted'
      ? BUTTON_UI.pillButtonMuted
      : BUTTON_UI.pillButtonDefault;
  return `${BUTTON_UI.pillButtonBase} ${toneClass}`;
}

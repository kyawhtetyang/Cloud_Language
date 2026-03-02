import { BUTTON_UI } from './buttonUi';
import { TOP_TOOLBAR_UI } from './topToolbarUi';

export type ChatScrollMode = 'container' | 'page';

function joinClasses(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export const CHAT_UI_CONFIG = {
  scrollMode: {
    mobile: 'container' as ChatScrollMode,
    desktop: 'page' as ChatScrollMode,
  },
  composer: {
    anchorClass: `fixed left-0 right-0 z-20 px-3 ${BUTTON_UI.bottomBarDesktopAnchor}`,
    bottomFocusedClass: 'bottom-[calc(env(safe-area-inset-bottom)+8px)]',
    bottomDefaultClass: 'bottom-[calc(64px+env(safe-area-inset-bottom)+8px)]',
  },
  messages: {
    mobileBottomPaddingClass: 'pb-32',
    desktopBottomPaddingClass: 'md:pb-44',
  },
  toolbar: {
    anchorClass: `sticky top-0 z-10 bg-[var(--surface-default)] ${TOP_TOOLBAR_UI.desktopFixedAnchor}`,
    shellClass: `w-full ${TOP_TOOLBAR_UI.desktopFixedContent}`,
    rowClass: TOP_TOOLBAR_UI.rowBetween,
    rowDividerClass: TOP_TOOLBAR_UI.dividerWithBottomPadding,
    spacerClass: TOP_TOOLBAR_UI.desktopFixedSpacer,
  },
} as const;

const usesDesktopPageScroll = CHAT_UI_CONFIG.scrollMode.desktop === 'page';

export const CHAT_UI_TOKENS = {
  rootClass: joinClasses(
    'h-full min-h-0 overflow-hidden',
    usesDesktopPageScroll && 'md:h-auto md:overflow-visible',
  ),
  sectionClass: joinClasses(
    'flex h-full min-h-0 flex-col overflow-hidden',
    usesDesktopPageScroll && 'md:h-auto md:overflow-visible',
  ),
  messagesScrollClass: joinClasses(
    'min-h-0 flex-1 overflow-y-auto px-0 py-3',
    CHAT_UI_CONFIG.messages.mobileBottomPaddingClass,
    usesDesktopPageScroll && 'md:flex-none md:overflow-visible',
    CHAT_UI_CONFIG.messages.desktopBottomPaddingClass,
  ),
  toolbarAnchorClass: CHAT_UI_CONFIG.toolbar.anchorClass,
  toolbarShellClass: CHAT_UI_CONFIG.toolbar.shellClass,
  toolbarSpacerClass: CHAT_UI_CONFIG.toolbar.spacerClass,
  toolbarInnerClass: joinClasses(
    CHAT_UI_CONFIG.toolbar.rowClass,
    CHAT_UI_CONFIG.toolbar.rowDividerClass,
  ),
} as const;

function isDesktopViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(min-width: 768px)').matches;
}

export function shouldUseChatContainerScroll(container: HTMLDivElement | null): boolean {
  if (!container) return false;
  const activeMode = isDesktopViewport()
    ? CHAT_UI_CONFIG.scrollMode.desktop
    : CHAT_UI_CONFIG.scrollMode.mobile;
  if (activeMode !== 'container') return false;
  return container.scrollHeight > container.clientHeight;
}

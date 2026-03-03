import { BUTTON_UI } from './buttonUi';
import { TOP_TOOLBAR_UI } from './topToolbarUi';

export type ChatScrollMode = 'container' | 'page';

function joinClasses(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export const CHAT_UI_CONFIG = {
  scrollMode: {
    mobile: 'page' as ChatScrollMode,
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
    wrapClass: TOP_TOOLBAR_UI.wrapWithMargin,
    rowClass: TOP_TOOLBAR_UI.rowBetween,
  },
} as const;

const usesMobilePageScroll = CHAT_UI_CONFIG.scrollMode.mobile === 'page';
const usesDesktopPageScroll = CHAT_UI_CONFIG.scrollMode.desktop === 'page';
const usesMobileContainerScroll = CHAT_UI_CONFIG.scrollMode.mobile === 'container';
const usesDesktopContainerScroll = CHAT_UI_CONFIG.scrollMode.desktop === 'container';

export const CHAT_UI_TOKENS = {
  rootClass: joinClasses(
    usesMobilePageScroll
      ? 'h-auto overflow-visible'
      : 'h-full min-h-0 overflow-hidden',
    usesDesktopPageScroll && 'md:h-auto md:overflow-visible',
    usesDesktopContainerScroll && 'md:h-full md:min-h-0 md:overflow-hidden',
  ),
  sectionClass: joinClasses(
    usesMobilePageScroll
      ? 'flex h-auto flex-col overflow-visible'
      : 'flex h-full min-h-0 flex-col overflow-hidden',
    usesDesktopPageScroll && 'md:h-auto md:overflow-visible',
    usesDesktopContainerScroll && 'md:h-full md:min-h-0 md:overflow-hidden',
  ),
  messagesScrollClass: joinClasses(
    usesMobileContainerScroll
      ? 'min-h-0 flex-1 overflow-y-auto px-0 py-3'
      : 'px-0 py-3',
    CHAT_UI_CONFIG.messages.mobileBottomPaddingClass,
    usesDesktopPageScroll && 'md:flex-none md:overflow-visible',
    usesDesktopContainerScroll && 'md:min-h-0 md:flex-1 md:overflow-y-auto',
    CHAT_UI_CONFIG.messages.desktopBottomPaddingClass,
  ),
  toolbarWrapClass: CHAT_UI_CONFIG.toolbar.wrapClass,
  toolbarRowClass: CHAT_UI_CONFIG.toolbar.rowClass,
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

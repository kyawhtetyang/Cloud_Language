import React from 'react';
import { AppMode } from '../config/appConfig';
import {
  BUTTON_UI,
  getBottomBarCardClass,
  getFooterLargeButtonClass,
  getFooterSmallButtonClass,
} from '../config/buttonUi';
import { AppTextPack } from '../config/appI18n';

type LessonActionFooterProps = {
  lessonText: AppTextPack['lesson'];
  mode: AppMode;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  isReadDisabled: boolean;
  isReading: boolean;
  isShuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isVisible?: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPrevious: () => void;
  onRead: () => void;
  onNext: () => void;
};

const PreviousIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <rect x="5" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M16 7l-7 5 7 5V7Z" fill="currentColor" />
  </svg>
);

const NextIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <rect x="17" y="6" width="2" height="12" rx="1" fill="currentColor" />
    <path d="M8 7v10l7-5-7-5Z" fill="currentColor" />
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <path d="M9 7v10l8-5-8-5Z" fill="currentColor" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true">
    <rect x="8" y="7" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="13" y="7" width="3" height="10" rx="1" fill="currentColor" />
  </svg>
);

const ShuffleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h4v4" />
    <path d="M4 20l7-7" />
    <path d="M20 4l-8 8" />
    <path d="M4 4l5 5" />
    <path d="M16 21h4v-4" />
    <path d="M15 15l5 5" />
  </svg>
);

const RepeatIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="block h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

export const LessonActionFooter: React.FC<LessonActionFooterProps> = ({
  lessonText,
  mode,
  isNextDisabled,
  isPreviousDisabled,
  isReadDisabled,
  isReading,
  isShuffleEnabled,
  repeatMode,
  isVisible = true,
  onToggleShuffle,
  onToggleRepeat,
  onPrevious,
  onRead,
  onNext,
}) => {
  const shuffleLabel = isShuffleEnabled ? lessonText.disableShuffleLabel : lessonText.enableShuffleLabel;
  const readLabel = isReading ? lessonText.stopLabel : lessonText.readLabel;
  const repeatLabel =
    repeatMode === 'off'
      ? lessonText.enableRepeatAllLabel
      : repeatMode === 'all'
        ? lessonText.enableRepeatOneLabel
        : lessonText.disableRepeatLabel;

  return (
    <footer
      className={`fixed left-0 right-0 z-30 px-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] bottom-[calc(60px+env(safe-area-inset-bottom))] transition-all duration-200 ease-out ${BUTTON_UI.bottomBarDesktopAnchor} ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[160%] opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100'
      }`}
    >
      <div className={BUTTON_UI.bottomBarContentFrame}>
        {mode === 'learn' && (
          <div className={`${getBottomBarCardClass({ variant: 'frosted' })} grid grid-cols-5 items-center px-2 py-1.5`}>
            <button
              onClick={onToggleShuffle}
              aria-label={shuffleLabel}
              title={shuffleLabel}
              className={`${getFooterSmallButtonClass({ isSelected: isShuffleEnabled })} justify-self-center`}
            >
              <ShuffleIcon />
              <span className="sr-only">{shuffleLabel}</span>
            </button>
            <button
              onClick={onPrevious}
              disabled={isPreviousDisabled}
              aria-label={lessonText.previousLabel}
              title={lessonText.previousLabel}
              className={getFooterSmallButtonClass({
                isDisabled: isPreviousDisabled,
                isInteractive: true,
              }) + ' justify-self-center'}
            >
              <PreviousIcon />
              <span className="sr-only">{lessonText.previousLabel}</span>
            </button>
            <button
              onClick={onRead}
              disabled={isReadDisabled}
              aria-label={readLabel}
              title={readLabel}
              className={`${getFooterLargeButtonClass(isReadDisabled)} justify-self-center`}
            >
              {isReading ? <PauseIcon /> : <PlayIcon />}
              <span className="sr-only">{readLabel}</span>
            </button>
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              aria-label={lessonText.nextLabel}
              title={lessonText.nextLabel}
              className={getFooterSmallButtonClass({
                isDisabled: isNextDisabled,
                isInteractive: true,
              }) + ' justify-self-center'}
            >
              <NextIcon />
              <span className="sr-only">{lessonText.nextLabel}</span>
            </button>
            <button
              onClick={onToggleRepeat}
              aria-label={repeatLabel}
              title={repeatLabel}
              className={`relative justify-self-center ${getFooterSmallButtonClass({ isSelected: repeatMode !== 'off' })}`}
            >
              <RepeatIcon />
              {repeatMode === 'one' && (
                <span className="absolute -bottom-0.5 right-1 text-xs font-black leading-none">1</span>
              )}
              <span className="sr-only">{repeatLabel}</span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};

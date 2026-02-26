import React, { useMemo, useState } from 'react';
import {
  APP_THEME_OPTIONS,
  AppTheme,
  DEFAULT_LANGUAGE_OPTIONS,
  DefaultLanguage,
  LEARN_LANGUAGE_OPTIONS,
  LearnLanguage,
  VOICE_PROVIDER_OPTIONS,
  VoiceProvider,
} from '../../config/appConfig';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_DIVIDER_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_SECTION_LABEL_CLASS,
  VIEW_SECTION_TITLE_CLASS,
} from './viewShared';
import { useSwipeBack } from '../../hooks/useSwipeBack';

type SettingsViewProps = {
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  textScalePercent: number;
  canDecreaseTextSize: boolean;
  canIncreaseTextSize: boolean;
  translationLabel: string;
  appTheme: AppTheme;
  voiceProvider: VoiceProvider;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  onLearnLanguageChange: (value: LearnLanguage) => void;
  onTogglePronunciation: () => void;
  onToggleBoldText: () => void;
  onToggleAutoScroll: () => void;
  onDecreaseTextSize: () => void;
  onIncreaseTextSize: () => void;
  onAppThemeChange: (value: AppTheme) => void;
  onVoiceProviderChange: (value: VoiceProvider) => void;
};

type SettingsRoute = 'main' | 'defaultLanguage' | 'learnLanguage' | 'appearance' | 'voiceProvider';

const sectionTitleClass = VIEW_SECTION_TITLE_CLASS;
const listCardClass = 'overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)]';
const listDividerClass = 'border-t border-[var(--border-subtle)]';
const listRowClass =
  'w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]';

function findOptionLabel<T extends string>(
  options: ReadonlyArray<{ code: T; label: string }>,
  code: T,
): string {
  return options.find((option) => option.code === code)?.label ?? code;
}

type ToggleStateBadgeProps = {
  isOn: boolean;
};

const ToggleStateBadge: React.FC<ToggleStateBadgeProps> = ({ isOn }) => (
  <span
    className={`inline-flex min-w-16 items-center justify-center rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all ${
      isOn
        ? 'btn-selected'
        : 'btn-unselected text-[var(--text-secondary)]'
    }`}
  >
    {isOn ? 'On' : 'Off'}
  </span>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  defaultLanguage,
  learnLanguage,
  isPronunciationEnabled,
  isBoldTextEnabled,
  isAutoScrollEnabled,
  textScalePercent,
  canDecreaseTextSize,
  canIncreaseTextSize,
  translationLabel,
  appTheme,
  voiceProvider,
  onDefaultLanguageChange,
  onLearnLanguageChange,
  onTogglePronunciation,
  onToggleBoldText,
  onToggleAutoScroll,
  onDecreaseTextSize,
  onIncreaseTextSize,
  onAppThemeChange,
  onVoiceProviderChange,
}) => {
  const [route, setRoute] = useState<SettingsRoute>('main');
  const swipeBackHandlers = useSwipeBack(
    route !== 'main' ? () => setRoute('main') : null,
  );

  const defaultLanguageLabel = useMemo(
    () => findOptionLabel(DEFAULT_LANGUAGE_OPTIONS, defaultLanguage),
    [defaultLanguage],
  );
  const learnLanguageLabel = useMemo(
    () => findOptionLabel(LEARN_LANGUAGE_OPTIONS, learnLanguage),
    [learnLanguage],
  );
  const appThemeLabel = useMemo(() => findOptionLabel(APP_THEME_OPTIONS, appTheme), [appTheme]);
  const voiceProviderLabel = useMemo(
    () => findOptionLabel(VOICE_PROVIDER_OPTIONS, voiceProvider),
    [voiceProvider],
  );

  const subPageMeta: Record<Exclude<SettingsRoute, 'main'>, { title: string; description: string }> = {
    defaultLanguage: {
      title: 'Default Language',
      description: 'Choose the app interface language.',
    },
    learnLanguage: {
      title: 'Learn Language',
      description: 'Choose your target learning language.',
    },
    appearance: {
      title: 'Appearance',
      description: 'Choose Light or Dark mode.',
    },
    voiceProvider: {
      title: 'Voice Provider',
      description: 'Choose Default voice or Apple Siri-style voice when available.',
    },
  };

  const renderOptionPage = <T extends string>(
    options: ReadonlyArray<{ code: T; label: string }>,
    selectedCode: T,
    onSelect: (value: T) => void,
  ) => (
    <div className={listCardClass}>
      {options.map((option, index) => {
        const isSelected = selectedCode === option.code;
        return (
          <React.Fragment key={option.code}>
            <button
              type="button"
              onClick={() => onSelect(option.code)}
              className={listRowClass}
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">{option.label}</span>
              <ToggleStateBadge isOn={isSelected} />
            </button>
            {index < options.length - 1 && <div className={listDividerClass} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderMainPage = () => (
    <>
      <section className="mb-4">
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Preferences</h3>
        <div className={listCardClass}>
          <button type="button" onClick={() => setRoute('defaultLanguage')} className={listRowClass}>
            <div>
              <p className={sectionTitleClass}>Default Language</p>
              <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>App interface language</p>
            </div>
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              {defaultLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={listDividerClass} />
          <button type="button" onClick={() => setRoute('learnLanguage')} className={listRowClass}>
            <div>
              <p className={sectionTitleClass}>Learn Language</p>
              <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>Target language</p>
            </div>
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              {learnLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={listDividerClass} />
          <button type="button" onClick={() => setRoute('appearance')} className={listRowClass}>
            <div>
              <p className={sectionTitleClass}>Appearance</p>
              <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>Light / Dark mode</p>
            </div>
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              {appThemeLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={listDividerClass} />
          <button type="button" onClick={() => setRoute('voiceProvider')} className={listRowClass}>
            <div>
              <p className={sectionTitleClass}>Voice Provider</p>
              <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>Speech voice preference</p>
            </div>
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              {voiceProviderLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
        </div>
      </section>

      <section className={`mb-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Display</h3>
        <div className={listCardClass}>
          <button type="button" onClick={onToggleBoldText} className={listRowClass}>
            <div>
              <p className={sectionTitleClass}>Bold Text</p>
              <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>Increase overall text thickness.</p>
            </div>
            <ToggleStateBadge isOn={isBoldTextEnabled} />
          </button>
          <div className={listDividerClass} />
          <button type="button" onClick={onToggleAutoScroll} className={listRowClass}>
            <div>
              <p className={sectionTitleClass}>Auto Scroll</p>
              <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>Keep speaking sentence near center.</p>
            </div>
            <ToggleStateBadge isOn={isAutoScrollEnabled} />
          </button>
          <div className={listDividerClass} />
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={sectionTitleClass}>Text Size</p>
                <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>Global text scale for the app.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDecreaseTextSize}
                  disabled={!canDecreaseTextSize}
                  className={`h-8 w-8 rounded-lg border-2 text-base font-extrabold transition-all ${
                    canDecreaseTextSize
                      ? 'btn-unselected'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed'
                  }`}
                  aria-label="Decrease text size"
                >
                  -
                </button>
                <span className="min-w-12 text-center text-xs font-extrabold uppercase tracking-wide text-brand-ink">
                  {textScalePercent}%
                </span>
                <button
                  type="button"
                  onClick={onIncreaseTextSize}
                  disabled={!canIncreaseTextSize}
                  className={`h-8 w-8 rounded-lg border-2 text-base font-extrabold transition-all ${
                    canIncreaseTextSize
                      ? 'btn-unselected'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed'
                  }`}
                  aria-label="Increase text size"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`mb-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Audio</h3>
        <div className={listCardClass}>
          <button type="button" onClick={onTogglePronunciation} className={listRowClass}>
            <div>
              <p className={sectionTitleClass}>Pronunciation</p>
              <p className={`${VIEW_BODY_TEXT_CLASS} mt-0.5`}>Show pronunciation row in lessons.</p>
            </div>
            <ToggleStateBadge isOn={isPronunciationEnabled} />
          </button>
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-3">
          <p className={sectionTitleClass}>Current Mapping</p>
          <div className="mt-2 space-y-1 text-xs">
            <p className="font-semibold text-[var(--text-secondary)]">
              <span className="uppercase tracking-wide text-[var(--text-primary)]">Translation:</span> {translationLabel}
            </p>
          </div>
        </div>
      </section>
    </>
  );

  const renderSubPage = () => {
    if (route === 'main') return null;
    const { title, description } = subPageMeta[route];
    return (
      <>
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRoute('main')}
            className="h-9 w-9 rounded-full border-2 btn-unselected text-lg font-black leading-none"
            aria-label="Back to settings"
          >
            ‹
          </button>
          <div>
            <p className={VIEW_SECTION_LABEL_CLASS}>Settings</p>
            <h3 className="text-lg font-extrabold text-ink">{title}</h3>
          </div>
        </div>
        <p className={`${VIEW_BODY_TEXT_CLASS} mb-3`}>{description}</p>
        {route === 'defaultLanguage' &&
          renderOptionPage(DEFAULT_LANGUAGE_OPTIONS, defaultLanguage, onDefaultLanguageChange)}
        {route === 'learnLanguage' &&
          renderOptionPage(LEARN_LANGUAGE_OPTIONS, learnLanguage, onLearnLanguageChange)}
        {route === 'appearance' &&
          renderOptionPage(APP_THEME_OPTIONS, appTheme, onAppThemeChange)}
        {route === 'voiceProvider' &&
          renderOptionPage(VOICE_PROVIDER_OPTIONS, voiceProvider, onVoiceProviderChange)}
      </>
    );
  };

  return (
    <div className={`${VIEW_PAGE_CLASS} px-1 md:px-0`} {...swipeBackHandlers}>
      {route === 'main' ? renderMainPage() : renderSubPage()}
    </div>
  );
};

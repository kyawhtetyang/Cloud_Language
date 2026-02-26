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
  VIEW_DIVIDER_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_SECTION_LABEL_CLASS,
} from './viewShared';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import {
  getSettingsTextSizeButtonClass,
  getSettingsToggleBadgeClass,
  SETTINGS_UI,
  SETTINGS_UI_TEXT,
} from '../../config/settingsUi';

type SettingsViewProps = {
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  textScalePercent: number;
  canDecreaseTextSize: boolean;
  canIncreaseTextSize: boolean;
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
  onBackToProfile: () => void;
};

type SettingsRoute = 'main' | 'defaultLanguage' | 'learnLanguage' | 'appearance' | 'voiceProvider';

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
  <span className={getSettingsToggleBadgeClass(isOn)}>{isOn ? SETTINGS_UI_TEXT.on : SETTINGS_UI_TEXT.off}</span>
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
  onBackToProfile,
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

  const subPageMeta: Record<Exclude<SettingsRoute, 'main'>, { title: string }> = {
    defaultLanguage: {
      title: 'Default Language',
    },
    learnLanguage: {
      title: 'Learn Language',
    },
    appearance: {
      title: 'Appearance',
    },
    voiceProvider: {
      title: 'Voice Provider',
    },
  };

  const renderOptionPage = <T extends string>(
    options: ReadonlyArray<{ code: T; label: string }>,
    selectedCode: T,
    onSelect: (value: T) => void,
  ) => (
    <div className={SETTINGS_UI.listCard}>
      {options.map((option, index) => {
        const isSelected = selectedCode === option.code;
        return (
          <React.Fragment key={option.code}>
            <button
              type="button"
              onClick={() => onSelect(option.code)}
              className={SETTINGS_UI.listRow}
            >
              <span className={SETTINGS_UI.optionLabel}>{option.label}</span>
              <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
                <ToggleStateBadge isOn={isSelected} />
              </span>
            </button>
            {index < options.length - 1 && <div className={SETTINGS_UI.listDivider} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderMainPage = () => (
    <>
      <div className={SETTINGS_UI.subPageHeader}>
        <button
          type="button"
          onClick={onBackToProfile}
          className={SETTINGS_UI.subPageBackButton}
          aria-label="Back to profile"
        >
          ‹
        </button>
        <div>
          <p className={VIEW_SECTION_LABEL_CLASS}>Profile</p>
          <h3 className={SETTINGS_UI.subPageTitle}>Settings</h3>
        </div>
      </div>

      <section className="mb-4">
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Preferences</h3>
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={() => setRoute('defaultLanguage')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>Default Language</p>
            <span className={SETTINGS_UI.rowValue}>
              {defaultLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('learnLanguage')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>Learn Language</p>
            <span className={SETTINGS_UI.rowValue}>
              {learnLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('appearance')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>Appearance</p>
            <span className={SETTINGS_UI.rowValue}>
              {appThemeLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('voiceProvider')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>Voice Provider</p>
            <span className={SETTINGS_UI.rowValue}>
              {voiceProviderLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
        </div>
      </section>

      <section className={`mb-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Display</h3>
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={onToggleBoldText} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>Bold Text</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge isOn={isBoldTextEnabled} />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={onToggleAutoScroll} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>Auto Scroll</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge isOn={isAutoScrollEnabled} />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <div className={SETTINGS_UI.staticRow}>
            <div className={SETTINGS_UI.textSizeRow}>
              <p className={SETTINGS_UI.sectionTitle}>Text Size</p>
              <div className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.textSizeControlSlot}`}>
                <div className={SETTINGS_UI.textSizeControlGroup}>
                  <button
                    type="button"
                    onClick={onDecreaseTextSize}
                    disabled={!canDecreaseTextSize}
                    className={getSettingsTextSizeButtonClass(canDecreaseTextSize)}
                    aria-label="Decrease text size"
                  >
                    -
                  </button>
                  <span className={SETTINGS_UI.textSizeValue}>
                    {textScalePercent}%
                  </span>
                  <button
                    type="button"
                    onClick={onIncreaseTextSize}
                    disabled={!canIncreaseTextSize}
                    className={getSettingsTextSizeButtonClass(canIncreaseTextSize)}
                    aria-label="Increase text size"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`mb-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Audio</h3>
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={onTogglePronunciation} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>Pronunciation</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge isOn={isPronunciationEnabled} />
            </span>
          </button>
        </div>
      </section>
    </>
  );

  const renderSubPage = () => {
    if (route === 'main') return null;
    const { title } = subPageMeta[route];
    return (
      <>
        <div className={SETTINGS_UI.subPageHeader}>
          <button
            type="button"
            onClick={() => setRoute('main')}
            className={SETTINGS_UI.subPageBackButton}
            aria-label="Back to settings"
          >
            ‹
          </button>
          <div>
            <p className={VIEW_SECTION_LABEL_CLASS}>Settings</p>
            <h3 className={SETTINGS_UI.subPageTitle}>{title}</h3>
          </div>
        </div>
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

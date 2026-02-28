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
} from '../../config/settingsUi';
import { AppTextPack } from '../../config/appI18n';

type SettingsViewProps = {
  settingsText: AppTextPack['settings'];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  isEnglishUiLocked: boolean;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  textScalePercent: number;
  canDecreaseTextSize: boolean;
  canIncreaseTextSize: boolean;
  appTheme: AppTheme;
  voiceProvider: VoiceProvider;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  onToggleEnglishUiLock: () => void;
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
  onLabel: string;
  offLabel: string;
};

const ToggleStateBadge: React.FC<ToggleStateBadgeProps> = ({ isOn, onLabel, offLabel }) => (
  <span className={getSettingsToggleBadgeClass(isOn)}>{isOn ? onLabel : offLabel}</span>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  settingsText,
  defaultLanguage,
  learnLanguage,
  isEnglishUiLocked,
  isPronunciationEnabled,
  isBoldTextEnabled,
  isAutoScrollEnabled,
  textScalePercent,
  canDecreaseTextSize,
  canIncreaseTextSize,
  appTheme,
  voiceProvider,
  onDefaultLanguageChange,
  onToggleEnglishUiLock,
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
    () => settingsText.defaultLanguageOptions[defaultLanguage] || findOptionLabel(DEFAULT_LANGUAGE_OPTIONS, defaultLanguage),
    [defaultLanguage, settingsText.defaultLanguageOptions],
  );
  const learnLanguageLabel = useMemo(
    () => settingsText.learnLanguageOptions[learnLanguage] || findOptionLabel(LEARN_LANGUAGE_OPTIONS, learnLanguage),
    [learnLanguage, settingsText.learnLanguageOptions],
  );
  const appThemeLabel = useMemo(
    () => settingsText.appearanceOptions[appTheme] || findOptionLabel(APP_THEME_OPTIONS, appTheme),
    [appTheme, settingsText.appearanceOptions],
  );
  const voiceProviderLabel = useMemo(
    () => settingsText.voiceProviderOptions[voiceProvider] || findOptionLabel(VOICE_PROVIDER_OPTIONS, voiceProvider),
    [voiceProvider, settingsText.voiceProviderOptions],
  );
  const defaultLanguageOptions = useMemo(
    () => DEFAULT_LANGUAGE_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.defaultLanguageOptions[option.code] || option.label,
    })),
    [settingsText.defaultLanguageOptions],
  );
  const learnLanguageOptions = useMemo(
    () => LEARN_LANGUAGE_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.learnLanguageOptions[option.code] || option.label,
    })),
    [settingsText.learnLanguageOptions],
  );
  const appearanceOptions = useMemo(
    () => APP_THEME_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.appearanceOptions[option.code] || option.label,
    })),
    [settingsText.appearanceOptions],
  );
  const voiceProviderOptions = useMemo(
    () => VOICE_PROVIDER_OPTIONS.map((option) => ({
      code: option.code,
      label: settingsText.voiceProviderOptions[option.code] || option.label,
    })),
    [settingsText.voiceProviderOptions],
  );

  const subPageMeta: Record<Exclude<SettingsRoute, 'main'>, { title: string }> = {
    defaultLanguage: {
      title: settingsText.defaultLanguageLabel,
    },
    learnLanguage: {
      title: settingsText.learnLanguageLabel,
    },
    appearance: {
      title: settingsText.appearanceLabel,
    },
    voiceProvider: {
      title: settingsText.voiceProviderLabel,
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
                <ToggleStateBadge
                  isOn={isSelected}
                  onLabel={settingsText.onLabel}
                  offLabel={settingsText.offLabel}
                />
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
          aria-label={settingsText.backToProfileAriaLabel}
        >
          ‹
        </button>
        <div>
          <p className={VIEW_SECTION_LABEL_CLASS}>{settingsText.profileContextLabel}</p>
          <h3 className={SETTINGS_UI.subPageTitle}>{settingsText.settingsTitle}</h3>
        </div>
      </div>

      <section className="mb-4">
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>{settingsText.preferencesSectionLabel}</h3>
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={onToggleEnglishUiLock} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.keepEnglishUiLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isEnglishUiLocked}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('defaultLanguage')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.defaultLanguageLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {defaultLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('learnLanguage')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.learnLanguageLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {learnLanguageLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('appearance')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.appearanceLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {appThemeLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={() => setRoute('voiceProvider')} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.voiceProviderLabel}</p>
            <span className={SETTINGS_UI.rowValue}>
              {voiceProviderLabel}
              <span aria-hidden="true">›</span>
            </span>
          </button>
        </div>
      </section>

      <section className={`mb-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>{settingsText.displaySectionLabel}</h3>
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={onToggleBoldText} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.boldTextLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isBoldTextEnabled}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <button type="button" onClick={onToggleAutoScroll} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.autoScrollLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isAutoScrollEnabled}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
            </span>
          </button>
          <div className={SETTINGS_UI.listDivider} />
          <div className={SETTINGS_UI.staticRow}>
            <div className={SETTINGS_UI.textSizeRow}>
              <p className={SETTINGS_UI.sectionTitle}>{settingsText.textSizeLabel}</p>
              <div className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.textSizeControlSlot}`}>
                <div className={SETTINGS_UI.textSizeControlGroup}>
                  <button
                    type="button"
                    onClick={onDecreaseTextSize}
                    disabled={!canDecreaseTextSize}
                    className={getSettingsTextSizeButtonClass(canDecreaseTextSize)}
                    aria-label={settingsText.decreaseTextSizeAriaLabel}
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
                    aria-label={settingsText.increaseTextSizeAriaLabel}
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
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>{settingsText.audioSectionLabel}</h3>
        <div className={SETTINGS_UI.listCard}>
          <button type="button" onClick={onTogglePronunciation} className={SETTINGS_UI.listRow}>
            <p className={SETTINGS_UI.sectionTitle}>{settingsText.pronunciationLabel}</p>
            <span className={`${SETTINGS_UI.rightControlSlot} ${SETTINGS_UI.toggleControlSlot}`}>
              <ToggleStateBadge
                isOn={isPronunciationEnabled}
                onLabel={settingsText.onLabel}
                offLabel={settingsText.offLabel}
              />
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
            aria-label={settingsText.backToSettingsAriaLabel}
          >
            ‹
          </button>
          <div>
            <p className={VIEW_SECTION_LABEL_CLASS}>{settingsText.settingsTitle}</p>
            <h3 className={SETTINGS_UI.subPageTitle}>{title}</h3>
          </div>
        </div>
        {route === 'defaultLanguage' &&
          renderOptionPage(defaultLanguageOptions, defaultLanguage, onDefaultLanguageChange)}
        {route === 'learnLanguage' &&
          renderOptionPage(learnLanguageOptions, learnLanguage, onLearnLanguageChange)}
        {route === 'appearance' &&
          renderOptionPage(appearanceOptions, appTheme, onAppThemeChange)}
        {route === 'voiceProvider' &&
          renderOptionPage(voiceProviderOptions, voiceProvider, onVoiceProviderChange)}
      </>
    );
  };

  return (
    <div className={`${VIEW_PAGE_CLASS} px-1 md:px-0`} {...swipeBackHandlers}>
      {route === 'main' ? renderMainPage() : renderSubPage()}
    </div>
  );
};

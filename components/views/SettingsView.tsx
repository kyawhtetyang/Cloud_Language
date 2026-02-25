import React from 'react';
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
  VIEW_PANEL_CLASS,
  VIEW_PANEL_PAD_CLASS,
  VIEW_SECTION_LABEL_CLASS,
  VIEW_SECTION_TITLE_CLASS,
} from './viewShared';

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

const sectionTitleClass = VIEW_SECTION_TITLE_CLASS;
const sectionCardClass = 'rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-3';
const optionButtonBaseClass = 'w-full min-h-10 px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide text-center leading-tight transition-all';

type ToggleCardProps = {
  title: string;
  description: string;
  isOn: boolean;
  onToggle: () => void;
};

const ToggleCard: React.FC<ToggleCardProps> = ({ title, description, isOn, onToggle }) => (
  <div className={sectionCardClass}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={sectionTitleClass}>{title}</p>
        <p className={`${VIEW_BODY_TEXT_CLASS} mt-1`}>{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`px-4 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
          isOn
            ? 'btn-selected'
            : 'btn-unselected'
        }`}
      >
        {isOn ? 'On' : 'Off'}
      </button>
    </div>
  </div>
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
  return (
    <div className={`${VIEW_PAGE_CLASS} ${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS}`}>
      <section className="mb-4">
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Language</h3>
        <div className="space-y-3">
          <div className={sectionCardClass}>
            <p className={sectionTitleClass}>Default Language</p>
            <p className={`${VIEW_BODY_TEXT_CLASS} mt-1 mb-3`}>Choose the app interface language.</p>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => onDefaultLanguageChange(option.code)}
                  className={`${optionButtonBaseClass} ${
                    defaultLanguage === option.code
                      ? 'btn-selected'
                      : 'btn-unselected'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className={sectionCardClass}>
            <p className={sectionTitleClass}>Learn Language</p>
            <p className={`${VIEW_BODY_TEXT_CLASS} mt-1 mb-3`}>Choose your target learning language.</p>
            <div className="grid grid-cols-2 gap-2">
              {LEARN_LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => onLearnLanguageChange(option.code)}
                  className={`${optionButtonBaseClass} ${
                    learnLanguage === option.code
                      ? 'btn-selected'
                      : 'btn-unselected'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`mb-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Theme</h3>
        <div className={sectionCardClass}>
          <p className={sectionTitleClass}>Current Theme</p>
          <p className={`${VIEW_BODY_TEXT_CLASS} mt-1 mb-3`}>Choose visual style for the app.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {APP_THEME_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => onAppThemeChange(option.code)}
                className={`${optionButtonBaseClass} ${
                  appTheme === option.code
                    ? 'btn-selected'
                    : 'btn-unselected'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={`mb-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Display</h3>
        <div className="space-y-3">
          <ToggleCard
            title="Bold Text"
            description="Increase overall text thickness."
            isOn={isBoldTextEnabled}
            onToggle={onToggleBoldText}
          />
          <ToggleCard
            title="Auto Scroll"
            description="Keep speaking sentence near the center while audio plays."
            isOn={isAutoScrollEnabled}
            onToggle={onToggleAutoScroll}
          />
          <div className={sectionCardClass}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={sectionTitleClass}>Text Size</p>
                <p className={`${VIEW_BODY_TEXT_CLASS} mt-1`}>Global text scale for the whole app.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDecreaseTextSize}
                  disabled={!canDecreaseTextSize}
                  className={`w-9 h-9 rounded-xl border-2 text-lg font-extrabold transition-all ${
                    canDecreaseTextSize
                      ? 'btn-selected'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
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
                  className={`w-9 h-9 rounded-xl border-2 text-lg font-extrabold transition-all ${
                    canIncreaseTextSize
                      ? 'btn-selected'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
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
        <div className="space-y-3">
          <ToggleCard
            title="Pronunciation"
            description="Show pronunciation row in lessons."
            isOn={isPronunciationEnabled}
            onToggle={onTogglePronunciation}
          />
          <div className={sectionCardClass}>
            <p className={sectionTitleClass}>Voice Provider</p>
            <p className={`${VIEW_BODY_TEXT_CLASS} mt-1 mb-3`}>Choose Default voice or prefer Apple Siri-style female voice when available.</p>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_PROVIDER_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => onVoiceProviderChange(option.code)}
                  className={`${optionButtonBaseClass} ${
                    voiceProvider === option.code
                      ? 'btn-selected'
                      : 'btn-unselected'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <div className={sectionCardClass}>
          <p className={sectionTitleClass}>Current Mapping</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <p className="font-semibold text-[var(--text-secondary)]">
              <span className="uppercase tracking-wide text-[var(--text-primary)]">Translation:</span> {translationLabel}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

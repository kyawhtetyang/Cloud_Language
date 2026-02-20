import React from 'react';
import { VoicePreference } from '../AudioButton';
import {
  APP_THEME_OPTIONS,
  AppTheme,
  DEFAULT_LANGUAGE_OPTIONS,
  DefaultLanguage,
  LEARN_LANGUAGE_OPTIONS,
  LearnLanguage,
} from '../../config/appConfig';

type SettingsViewProps = {
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  textScalePercent: number;
  canDecreaseTextSize: boolean;
  canIncreaseTextSize: boolean;
  voicePreference: VoicePreference;
  translationLabel: string;
  pronunciationStyleLabel: string;
  appTheme: AppTheme;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  onLearnLanguageChange: (value: LearnLanguage) => void;
  onTogglePronunciation: () => void;
  onToggleBoldText: () => void;
  onDecreaseTextSize: () => void;
  onIncreaseTextSize: () => void;
  onVoicePreferenceChange: (value: VoicePreference) => void;
  onAppThemeChange: (value: AppTheme) => void;
};

const sectionTitleClass = 'text-sm font-extrabold uppercase tracking-wide text-brand-ink';
const sectionCardClass = 'rounded-xl px-1 py-1';
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
        <p className="text-sm text-gray-600 mt-1">{description}</p>
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
  textScalePercent,
  canDecreaseTextSize,
  canIncreaseTextSize,
  voicePreference,
  translationLabel,
  pronunciationStyleLabel,
  appTheme,
  onDefaultLanguageChange,
  onLearnLanguageChange,
  onTogglePronunciation,
  onToggleBoldText,
  onDecreaseTextSize,
  onIncreaseTextSize,
  onVoicePreferenceChange,
  onAppThemeChange,
}) => {
  return (
    <div className="w-full max-w-2xl rounded-[24px] border-2 border-gray-100 bg-white p-4 shadow-xl md:p-5">
      <section className="mb-4">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">Language</h3>
        <div className="space-y-3">
          <div className={sectionCardClass}>
            <p className={sectionTitleClass}>Default Language</p>
            <p className="text-sm text-gray-600 mt-1 mb-3">Choose the app interface language.</p>
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
            <p className="text-sm text-gray-600 mt-1 mb-3">Choose your target learning language.</p>
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

      <section className="mb-4 border-t border-gray-100 pt-4">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">Theme</h3>
        <div className={sectionCardClass}>
          <p className={sectionTitleClass}>Current Theme</p>
          <p className="text-sm text-gray-600 mt-1 mb-3">Choose visual style for the app.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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

      <section className="mb-4 border-t border-gray-100 pt-4">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">Display</h3>
        <div className="space-y-3">
          <ToggleCard
            title="Bold Text"
            description="Increase overall text thickness."
            isOn={isBoldTextEnabled}
            onToggle={onToggleBoldText}
          />
          <div className={sectionCardClass}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={sectionTitleClass}>Text Size</p>
                <p className="text-sm text-gray-600 mt-1">Global text scale for the whole app.</p>
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

      <section className="mb-4 border-t border-gray-100 pt-4">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">Audio</h3>
        <div className="space-y-3">
          <ToggleCard
            title="Pronunciation"
            description="Show pronunciation row in lessons."
            isOn={isPronunciationEnabled}
            onToggle={onTogglePronunciation}
          />
          <div className={sectionCardClass}>
            <p className={sectionTitleClass}>Voice</p>
            <p className="text-sm text-gray-600 mt-1 mb-3">Choose your preferred speaking voice style.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onVoicePreferenceChange('young_female')}
                className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                  voicePreference === 'young_female'
                    ? 'btn-selected'
                    : 'btn-unselected'
                }`}
              >
                Warm Female
              </button>
              <button
                type="button"
                onClick={() => onVoicePreferenceChange('google_female')}
                className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                  voicePreference === 'google_female'
                    ? 'btn-selected'
                    : 'btn-unselected'
                }`}
              >
                Google Female
              </button>
              <button
                type="button"
                onClick={() => onVoicePreferenceChange('system_default')}
                className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                  voicePreference === 'system_default'
                    ? 'btn-selected'
                    : 'btn-unselected'
                }`}
              >
                Device Default
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 pt-4">
        <div className={sectionCardClass}>
          <p className={sectionTitleClass}>Current Mapping</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <p className="text-gray-600 font-bold">
              <span className="text-brand-ink uppercase tracking-wide">Translation:</span> {translationLabel}
            </p>
            <p className="text-gray-600 font-bold">
              <span className="text-brand-ink uppercase tracking-wide">Pronunciation:</span> {pronunciationStyleLabel}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};


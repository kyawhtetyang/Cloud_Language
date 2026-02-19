import React from 'react';
import { VoicePreference } from '../AudioButton';
import {
  CHINESE_TRACK_OPTIONS,
  ChineseTrack,
  DEFAULT_LANGUAGE_OPTIONS,
  DefaultLanguage,
  LEARN_LANGUAGE_OPTIONS,
  LearnLanguage,
} from '../../config/appConfig';

type SettingsViewProps = {
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  chineseTrack: ChineseTrack;
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
  textScalePercent: number;
  canDecreaseTextSize: boolean;
  canIncreaseTextSize: boolean;
  voicePreference: VoicePreference;
  translationLabel: string;
  pronunciationStyleLabel: string;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  onLearnLanguageChange: (value: LearnLanguage) => void;
  onChineseTrackChange: (value: ChineseTrack) => void;
  onTogglePronunciation: () => void;
  onToggleBoldText: () => void;
  onToggleRandomLessonOrder: () => void;
  onToggleReviewQuestions: () => void;
  onDecreaseTextSize: () => void;
  onIncreaseTextSize: () => void;
  onVoicePreferenceChange: (value: VoicePreference) => void;
};

const sectionTitleClass = 'text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]';
const sectionCardClass = 'rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4';

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
            ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
            : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
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
  chineseTrack,
  isPronunciationEnabled,
  isBoldTextEnabled,
  isRandomLessonOrderEnabled,
  isReviewQuestionsRemoved,
  textScalePercent,
  canDecreaseTextSize,
  canIncreaseTextSize,
  voicePreference,
  translationLabel,
  pronunciationStyleLabel,
  onDefaultLanguageChange,
  onLearnLanguageChange,
  onChineseTrackChange,
  onTogglePronunciation,
  onToggleBoldText,
  onToggleRandomLessonOrder,
  onToggleReviewQuestions,
  onDecreaseTextSize,
  onIncreaseTextSize,
  onVoicePreferenceChange,
}) => {
  return (
    <div className="w-full max-w-2xl">
      <section className="mb-4">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">Language</h3>
        <div className="space-y-3">
          <div className={sectionCardClass}>
            <p className={sectionTitleClass}>Default Language</p>
            <p className="text-sm text-gray-600 mt-1 mb-3">Select one: Burmese (default) or English.</p>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => onDefaultLanguageChange(option.code)}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                    defaultLanguage === option.code
                      ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                      : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
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
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                    learnLanguage === option.code
                      ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                      : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {learnLanguage === 'chinese' && (
            <div className={sectionCardClass}>
              <p className={sectionTitleClass}>Chinese Track</p>
              <p className="text-sm text-gray-600 mt-1 mb-3">Choose curriculum style: General or HSK.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CHINESE_TRACK_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => onChineseTrackChange(option.code)}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                      chineseTrack === option.code
                        ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                        : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-4">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">Learning Flow</h3>
        <div className="space-y-3">
          <ToggleCard
            title="Random Lesson Order"
            description="Shuffle question order every time you enter a unit."
            isOn={isRandomLessonOrderEnabled}
            onToggle={onToggleRandomLessonOrder}
          />
          <ToggleCard
            title="Review Questions"
            description="Show quick review questions in lesson flow."
            isOn={!isReviewQuestionsRemoved}
            onToggle={onToggleReviewQuestions}
          />
        </div>
      </section>

      <section className="mb-4">
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
                      ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Decrease text size"
                >
                  -
                </button>
                <span className="min-w-12 text-center text-xs font-extrabold uppercase tracking-wide text-[#2f7d01]">
                  {textScalePercent}%
                </span>
                <button
                  type="button"
                  onClick={onIncreaseTextSize}
                  disabled={!canIncreaseTextSize}
                  className={`w-9 h-9 rounded-xl border-2 text-lg font-extrabold transition-all ${
                    canIncreaseTextSize
                      ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
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

      <section className="mb-4">
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
                    ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                    : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                }`}
              >
                Warm Female
              </button>
              <button
                type="button"
                onClick={() => onVoicePreferenceChange('google_female')}
                className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                  voicePreference === 'google_female'
                    ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                    : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                }`}
              >
                Google Female
              </button>
              <button
                type="button"
                onClick={() => onVoicePreferenceChange('system_default')}
                className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
                  voicePreference === 'system_default'
                    ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                    : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
                }`}
              >
                Device Default
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={sectionCardClass}>
          <p className={sectionTitleClass}>Current Mapping</p>
        <div className="mt-3 space-y-1.5 text-xs">
          <p className="text-gray-600 font-bold">
            <span className="text-[#2f7d01] uppercase tracking-wide">Translation:</span> {translationLabel}
          </p>
          <p className="text-gray-600 font-bold">
            <span className="text-[#2f7d01] uppercase tracking-wide">Pronunciation:</span> {pronunciationStyleLabel}
          </p>
        </div>
        </div>
      </section>
    </div>
  );
};

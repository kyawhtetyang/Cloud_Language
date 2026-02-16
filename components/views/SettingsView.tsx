import React from 'react';

type LearnLanguage = 'english' | 'chinese';
type DefaultLanguage = 'burmese' | 'english';

type SettingsViewProps = {
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  isPronunciationEnabled: boolean;
  translationLabel: string;
  pronunciationStyleLabel: string;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  onLearnLanguageChange: (value: LearnLanguage) => void;
  onTogglePronunciation: () => void;
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  defaultLanguage,
  learnLanguage,
  isPronunciationEnabled,
  translationLabel,
  pronunciationStyleLabel,
  onDefaultLanguageChange,
  onLearnLanguageChange,
  onTogglePronunciation,
}) => {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-6 md:p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-4">Settings</h2>
      <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4 mb-3">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Default Language</p>
        <p className="text-sm text-gray-600 mt-1 mb-3">Select one: Burmese (default) or English.</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onDefaultLanguageChange('burmese')}
            className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
              defaultLanguage === 'burmese'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
            }`}
          >
            Burmese (Default)
          </button>
          <button
            type="button"
            onClick={() => onDefaultLanguageChange('english')}
            className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
              defaultLanguage === 'english'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
            }`}
          >
            English
          </button>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4 mb-3">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Learn Language</p>
        <p className="text-sm text-gray-600 mt-1 mb-3">Choose your target learning language.</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onLearnLanguageChange('english')}
            className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
              learnLanguage === 'english'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLearnLanguageChange('chinese')}
            className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
              learnLanguage === 'chinese'
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
            }`}
          >
            Chinese
          </button>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4 mb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Pronunciation</p>
            <p className="text-sm text-gray-600 mt-1">Show pronunciation row in lessons.</p>
          </div>
          <button
            type="button"
            onClick={onTogglePronunciation}
            className={`px-4 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wide transition-all ${
              isPronunciationEnabled
                ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                : 'border-gray-200 bg-white text-gray-600 duo-secondary-shadow'
            }`}
          >
            {isPronunciationEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-4">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#2f7d01]">Current Mapping</p>
        <div className="mt-3 space-y-1.5 text-xs">
          <p className="text-gray-600 font-bold">
            <span className="text-[#2f7d01] uppercase tracking-wide">Translation:</span> {translationLabel}
          </p>
          <p className="text-gray-600 font-bold">
            <span className="text-[#2f7d01] uppercase tracking-wide">Pronunciation:</span> {pronunciationStyleLabel}
          </p>
        </div>
      </div>
    </div>
  );
};


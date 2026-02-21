import React from 'react';

type LessonsUnavailableViewProps = {
  errorMessage: string | null;
  apiBaseUrl: string;
};

type WelcomeViewProps = {
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
};

export const LoadingView: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      <p className="text-base font-bold text-ink">Loading lessons...</p>
    </div>
  </div>
);

export const LessonsUnavailableView: React.FC<LessonsUnavailableViewProps> = ({
  errorMessage,
  apiBaseUrl,
}) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-md w-full">
      <h2 className="text-xl font-bold text-ink mb-2">Lessons unavailable</h2>
      <p className="text-gray-500">{errorMessage || 'No lessons available right now.'}</p>
      <p className="text-sm text-gray-400 mt-3">Check backend API at {apiBaseUrl}/api/health</p>
    </div>
  </div>
);

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  onProfileInputChange,
  onApplyProfileName,
}) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-app-radial">
    <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-7 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-ink mb-2">Welcome</h1>
      <p className="text-sm text-gray-500 mb-5">Enter your name to create a local profile.</p>
      <input
        value={profileInput}
        onChange={(event) => onProfileInputChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
        placeholder="Username (no spaces)"
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand outline-none font-semibold text-ink"
      />
      {(profileError || hasProfileWhitespace) && (
        <p className="mt-2 text-xs font-bold text-danger">Username cannot contain spaces.</p>
      )}
      <button
        onClick={onApplyProfileName}
        disabled={!isProfileInputValid}
        className={`w-full mt-4 py-3 rounded-xl font-extrabold uppercase tracking-wide transition-all ${
          isProfileInputValid
            ? 'bg-brand text-white duo-button-shadow hover:brightness-110'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  </div>
);

export const CompletedView: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
  <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl text-center">
    <h2 className="text-3xl font-extrabold text-ink mb-3">All Units Passed</h2>
    <p className="text-gray-500 mb-6">You completed all sections and passed the random checks.</p>
    <button
      onClick={onRestart}
      className="w-full py-4 rounded-2xl bg-brand text-white font-extrabold text-lg uppercase tracking-wider duo-button-shadow hover:brightness-110 active:scale-95 transition-all"
    >
      Restart Unit 1
    </button>
  </div>
);



import React from 'react';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_H2_CLASS,
  VIEW_H3_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_PANEL_CLASS,
  VIEW_PANEL_PAD_CLASS,
  VIEW_STATUS_TEXT_CLASS,
} from './viewShared';

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
      <p className={`${VIEW_STATUS_TEXT_CLASS} text-ink`}>Loading lessons...</p>
    </div>
  </div>
);

export const LessonsUnavailableView: React.FC<LessonsUnavailableViewProps> = ({
  errorMessage,
  apiBaseUrl,
}) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <div className={`${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} text-center max-w-md w-full`}>
      <h2 className={`${VIEW_H3_CLASS} mb-2`}>Lessons unavailable</h2>
      <p className={VIEW_BODY_TEXT_CLASS}>{errorMessage || 'No lessons available right now.'}</p>
      <p className={`${VIEW_BODY_TEXT_CLASS} mt-3`}>Check backend API at {apiBaseUrl}/api/health</p>
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
    <div className={`${VIEW_PANEL_CLASS} p-7 w-full max-w-md`}>
      <h1 className={`${VIEW_H3_CLASS} mb-2`}>Welcome</h1>
      <p className={`${VIEW_BODY_TEXT_CLASS} mb-5`}>Enter your name to create a local profile.</p>
      <input
        value={profileInput}
        onChange={(event) => onProfileInputChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
        placeholder="Username (no spaces)"
        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] px-4 py-3 text-base md:text-sm font-semibold text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
      />
      {(profileError || hasProfileWhitespace) && (
        <p className="mt-2 text-xs font-bold text-danger">Username cannot contain spaces.</p>
      )}
      <button
        onClick={onApplyProfileName}
        disabled={!isProfileInputValid}
        className={`w-full mt-4 py-3 rounded-xl border-2 text-sm font-extrabold uppercase tracking-wide transition-all ${
          isProfileInputValid
            ? 'btn-selected'
            : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  </div>
);

export const CompletedView: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
  <div className={`${VIEW_PAGE_CLASS} ${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} text-center`}>
    <h2 className={`${VIEW_H2_CLASS} mb-3`}>All Units Passed</h2>
    <p className={`${VIEW_BODY_TEXT_CLASS} mb-6`}>You completed all sections and passed the random checks.</p>
    <button
      onClick={onRestart}
      className="w-full py-4 rounded-2xl border-2 btn-selected font-extrabold text-lg uppercase tracking-wider active:scale-95 transition-all"
    >
      Restart Unit 1
    </button>
  </div>
);

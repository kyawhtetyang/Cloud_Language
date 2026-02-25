import React from 'react';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_DIVIDER_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_PANEL_CLASS,
  VIEW_PANEL_PAD_CLASS,
  VIEW_SECTION_LABEL_CLASS,
} from './viewShared';

type ProfileViewProps = {
  profileName: string;
  progressPercent: number;
  progressLabel: string;
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  currentCourseCode: string;
  unlockedUnits: number;
  totalUnits: number;
  streak: number;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileName,
  progressPercent,
  progressLabel,
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  currentCourseCode,
  unlockedUnits,
  totalUnits,
  streak,
  onProfileInputChange,
  onApplyProfileName,
}) => {
  const normalizedProgress = Number.isFinite(progressPercent)
    ? Math.min(100, Math.max(0, progressPercent))
    : 0;
  const visualProgress = normalizedProgress > 0 ? normalizedProgress : 2;

  return (
    <div className={`${VIEW_PAGE_CLASS} space-y-4`}>
      <section className={`${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} md:p-6`}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl border-2 btn-selected flex items-center justify-center text-2xl font-extrabold">
            U
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-ink">Welcome back</h2>
            <p className={`${VIEW_BODY_TEXT_CLASS} font-semibold`}>{profileName}</p>
          </div>
        </div>

        <div className={`mt-4 border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full overflow-hidden border border-brand-border bg-brand-track">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${visualProgress}%`,
                minWidth: '10px',
                opacity: 1,
                background: 'linear-gradient(90deg, var(--dark-accent-primary, var(--color-brand)), var(--dark-accent-primary, var(--color-brand-dark)))',
              }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-subtle font-bold uppercase tracking-wide">
            {progressLabel}
          </p>
        </div>

        <div className="mt-4">
          <p className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Switch Profile</p>
          <div className="flex gap-2">
            <input
              value={profileInput}
              onChange={(event) => onProfileInputChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
              placeholder="Username (no spaces)"
              className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
            />
            <button
              onClick={onApplyProfileName}
              disabled={!isProfileInputValid}
              className={`px-4 rounded-xl text-xs font-extrabold uppercase tracking-wide border-2 transition-all ${
                isProfileInputValid
                  ? 'btn-selected'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
          {(profileError || hasProfileWhitespace) && (
            <p className="mt-2 text-xs font-bold text-danger">Username cannot contain spaces.</p>
          )}
        </div>
      </section>

      <section className={`${VIEW_PANEL_CLASS} ${VIEW_PANEL_PAD_CLASS} md:p-6`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className={`sm:border-r sm:pr-3 ${VIEW_DIVIDER_CLASS}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Current Course</p>
            <p className="mt-1 text-xl md:text-2xl font-extrabold text-ink">{currentCourseCode}</p>
          </div>
          <div className={`border-t pt-3 sm:border-t-0 sm:border-r sm:pt-0 sm:px-3 ${VIEW_DIVIDER_CLASS}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Unlocked Groups</p>
            <p className="mt-1 text-xl md:text-2xl font-extrabold text-ink">{unlockedUnits}/{totalUnits}</p>
          </div>
          <div className={`border-t pt-3 sm:border-t-0 sm:pl-3 ${VIEW_DIVIDER_CLASS}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Streak</p>
            <p className="mt-1 text-xl md:text-2xl font-extrabold text-ink">{streak}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

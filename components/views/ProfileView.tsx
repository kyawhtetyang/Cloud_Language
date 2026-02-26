import React from 'react';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_DIVIDER_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_SECTION_LABEL_CLASS,
  VIEW_SECTION_TITLE_CLASS,
} from './viewShared';
import { BUTTON_UI, getActionButtonClass } from '../../config/buttonUi';

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
  onOpenSettings: () => void;
  onRequestLogout: () => void;
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
  onOpenSettings,
  onRequestLogout,
}) => {
  const normalizedProgress = Number.isFinite(progressPercent)
    ? Math.min(100, Math.max(0, progressPercent))
    : 0;
  const visualProgress = normalizedProgress > 0 ? normalizedProgress : 2;

  const listCardClass = 'overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)]';
  const listDividerClass = 'border-t border-[var(--border-subtle)]';
  const listRowClass =
    'w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]';
  const sectionTitleClass = VIEW_SECTION_TITLE_CLASS;

  return (
    <div className={`${VIEW_PAGE_CLASS} space-y-4 px-1 md:px-0`}>
      <section>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Account</h3>
        <div className={listCardClass}>
          <div className="flex items-start justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 btn-selected text-2xl font-extrabold">
                U
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">Welcome back</h2>
                <p className={`${VIEW_BODY_TEXT_CLASS} font-semibold`}>{profileName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className={BUTTON_UI.iconNavButton}
              aria-label="Open settings"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </button>
          </div>
          <div className={listDividerClass} />
          <div className="px-4 py-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              <span>Overall Progress</span>
              <span>{normalizedProgress}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border border-brand-border bg-brand-track">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${visualProgress}%`,
                  minWidth: '10px',
                  opacity: 1,
                  background:
                    'linear-gradient(90deg, var(--dark-accent-primary, var(--color-brand)), var(--dark-accent-primary, var(--color-brand-dark)))',
                }}
              />
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ink-subtle">{progressLabel}</p>
          </div>
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Progress Stats</h3>
        <div className={listCardClass}>
          <div className={listRowClass}>
            <span className={sectionTitleClass}>Current Course</span>
            <span className="text-base font-extrabold text-ink">{currentCourseCode}</span>
          </div>
          <div className={listDividerClass} />
          <div className={listRowClass}>
            <span className={sectionTitleClass}>Unlocked Groups</span>
            <span className="text-base font-extrabold text-ink">
              {unlockedUnits}/{totalUnits}
            </span>
          </div>
          <div className={listDividerClass} />
          <div className={listRowClass}>
            <span className={sectionTitleClass}>Streak</span>
            <span className="text-base font-extrabold text-ink">{streak}</span>
          </div>
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Change Display Name</h3>
        <div className="py-1">
          <div className="flex gap-2">
            <input
              value={profileInput}
              onChange={(event) => onProfileInputChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
              placeholder="Display name (no spaces)"
              className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] px-3 py-2 text-base font-semibold text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] md:text-sm"
            />
            <button
              onClick={onApplyProfileName}
              disabled={!isProfileInputValid}
              className={getActionButtonClass({
                variant: 'primary',
                size: 'sm',
                disabled: !isProfileInputValid,
              })}
            >
              Save
            </button>
          </div>
          {(profileError || hasProfileWhitespace) && (
            <p className="mt-2 text-xs font-bold text-danger">Username cannot contain spaces.</p>
          )}
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>Session</h3>
        <div className={listCardClass}>
          <button
            type="button"
            onClick={onRequestLogout}
            className={`${listRowClass} text-danger`}
          >
            <span className="text-sm font-semibold">Log out</span>
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </section>
    </div>
  );
};

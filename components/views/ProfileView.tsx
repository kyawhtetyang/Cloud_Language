import React from 'react';
import {
  VIEW_BODY_TEXT_CLASS,
  VIEW_DIVIDER_CLASS,
  VIEW_PAGE_CLASS,
  VIEW_SECTION_LABEL_CLASS,
} from './viewShared';
import { BUTTON_UI, getActionButtonClass } from '../../config/buttonUi';
import { AppTextPack } from '../../config/appI18n';
import { ProfileStatsRow } from './profile/ProfileStatsRow';

type ProfileViewProps = {
  profileName: string;
  progressPercent: number;
  progressLabel: string;
  profileText: AppTextPack['profile'];
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  currentCourseCode: string;
  downloadedLessonsCount?: number;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
  onOpenCurrentCourse: () => void;
  onOpenDownloadedLessons?: () => void;
  onOpenSettings: () => void;
  onRequestLogout: () => void;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileName,
  progressPercent,
  progressLabel,
  profileText,
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  currentCourseCode,
  downloadedLessonsCount = 0,
  onProfileInputChange,
  onApplyProfileName,
  onOpenCurrentCourse,
  onOpenDownloadedLessons,
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

  return (
    <div className={`${VIEW_PAGE_CLASS} space-y-4 px-1 md:px-0`}>
      <section>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>{profileText.accountSectionLabel}</h3>
        <div className={listCardClass}>
          <div className="flex items-start justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 btn-selected text-2xl font-extrabold">
                U
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">{profileText.welcomeBackTitle}</h2>
                <p className={`${VIEW_BODY_TEXT_CLASS} font-semibold`}>{profileName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className={BUTTON_UI.iconNavButton}
              aria-label={profileText.openSettingsAriaLabel}
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
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-ink-subtle">
              <span>{progressLabel}</span>
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
          </div>
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>{profileText.progressStatsSectionLabel}</h3>
        <div className={listCardClass}>
          <ProfileStatsRow
            label={profileText.currentCourseLabel}
            value={currentCourseCode}
            onClick={onOpenCurrentCourse}
          />
          <div className={listDividerClass} />
          <ProfileStatsRow
            label={profileText.downloadedLessonsLabel}
            value={Math.max(0, downloadedLessonsCount).toLocaleString()}
            onClick={onOpenDownloadedLessons}
          />
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>{profileText.changeDisplayNameSectionLabel}</h3>
        <div className="py-1">
          <div className="flex gap-2">
            <input
              value={profileInput}
              onChange={(event) => onProfileInputChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
              placeholder={profileText.displayNamePlaceholder}
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
              {profileText.saveLabel}
            </button>
          </div>
          {(profileError || hasProfileWhitespace) && (
            <p className="mt-2 text-xs font-bold text-danger">{profileText.usernameWhitespaceError}</p>
          )}
        </div>
      </section>

      <section className={`border-t pt-4 ${VIEW_DIVIDER_CLASS}`}>
        <h3 className={`${VIEW_SECTION_LABEL_CLASS} mb-2`}>{profileText.sessionSectionLabel}</h3>
        <div className={listCardClass}>
          <button
            type="button"
            onClick={onRequestLogout}
            className={`${listRowClass} text-danger`}
          >
            <span className="text-base font-medium">{profileText.logoutLabel}</span>
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </section>
    </div>
  );
};

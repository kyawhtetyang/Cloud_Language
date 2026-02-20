import React from 'react';

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
  return (
    <div className="w-full max-w-2xl space-y-4">
      <section className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-5 md:p-7">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#58cc02] border-2 border-[#46a302] text-white flex items-center justify-center text-2xl font-extrabold">
            U
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#3c3c3c]">Welcome back</h2>
            <p className="text-sm text-gray-500 font-bold">{profileName}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wide text-[#2f7d01]">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full overflow-hidden bg-[#edf6e4]">
            <div
              className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#6a6a6a] font-bold uppercase tracking-wide">
            {progressLabel}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-wide mb-2">Switch Profile</p>
          <div className="flex gap-2">
            <input
              value={profileInput}
              onChange={(event) => onProfileInputChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onApplyProfileName()}
              placeholder="Username (no spaces)"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#58cc02] outline-none text-sm font-semibold text-[#3c3c3c]"
            />
            <button
              onClick={onApplyProfileName}
              disabled={!isProfileInputValid}
              className={`px-4 rounded-xl text-xs font-extrabold uppercase tracking-wide border-2 transition-all ${
                isProfileInputValid
                  ? 'border-[#46a302] bg-[#58cc02] text-white duo-button-shadow'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
          {(profileError || hasProfileWhitespace) && (
            <p className="mt-2 text-xs font-bold text-[#b91c1c]">Username cannot contain spaces.</p>
          )}
        </div>
      </section>

      <section className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-5 md:p-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:border-r sm:border-gray-100 sm:pr-3">
            <p className="text-[11px] text-[#2f7d01] font-extrabold uppercase tracking-wide">Current Course</p>
            <p className="mt-1 text-xl md:text-2xl font-extrabold text-[#3c3c3c]">{currentCourseCode}</p>
          </div>
          <div className="border-t border-gray-100 pt-3 sm:border-t-0 sm:border-r sm:border-gray-100 sm:pt-0 sm:px-3">
            <p className="text-[11px] text-[#2f7d01] font-extrabold uppercase tracking-wide">Unlocked Groups</p>
            <p className="mt-1 text-xl md:text-2xl font-extrabold text-[#3c3c3c]">{unlockedUnits}/{totalUnits}</p>
          </div>
          <div className="border-t border-gray-100 pt-3 sm:border-t-0 sm:pl-3">
            <p className="text-[11px] text-[#f59e0b] font-extrabold uppercase tracking-wide">Streak</p>
            <p className="mt-1 text-xl md:text-2xl font-extrabold text-[#3c3c3c]">{streak}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

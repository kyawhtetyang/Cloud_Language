import React from 'react';

type ProfileViewProps = {
  profileName: string;
  currentLevel: number;
  levelProgressPercent: number;
  levelProgressLabel: string;
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  currentCourseCode: string;
  unlockedLevel: number;
  totalLevels: number;
  streak: number;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileName,
  currentLevel,
  levelProgressPercent,
  levelProgressLabel,
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  currentCourseCode,
  unlockedLevel,
  totalLevels,
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

        <div className="mt-4 rounded-2xl border-2 border-[#dbe8cb] bg-[#f7ffef] p-3">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wide text-[#2f7d01]">
            <span>Level Progress</span>
            <span>Level {currentLevel}</span>
          </div>
          <div className="mt-2 h-3 bg-[#d9ecc8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#6a6a6a] font-bold uppercase tracking-wide">
            {levelProgressLabel} units completed ({levelProgressPercent}%)
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

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-[#c5eb9f] bg-[#f7ffef] p-4">
          <p className="text-[11px] text-[#2f7d01] font-extrabold uppercase tracking-wide">Current Course</p>
          <p className="text-3xl font-extrabold text-[#3c3c3c] mt-1">{currentCourseCode}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#c5eb9f] bg-[#f7ffef] p-4">
          <p className="text-[11px] text-[#2f7d01] font-extrabold uppercase tracking-wide">Unlocked Units</p>
          <p className="text-3xl font-extrabold text-[#3c3c3c] mt-1">{unlockedLevel}/{totalLevels}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#ffe5b4] bg-[#fff8ea] p-4">
          <p className="text-[11px] text-[#f59e0b] font-extrabold uppercase tracking-wide">Streak</p>
          <p className="text-3xl font-extrabold text-[#3c3c3c] mt-1">{streak}</p>
        </div>
      </section>
    </div>
  );
};


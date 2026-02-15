
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  sectionCurrent: number;
  sectionTotal: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  sectionCurrent,
  sectionTotal,
}) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full px-4 md:px-6 py-4 max-w-3xl mx-auto space-y-3">
      <div className="w-full flex items-center gap-3 bg-white border-2 border-gray-100 rounded-2xl px-3 py-3 shadow-sm">
        <div className="flex-1 bg-[#e5e5e5] rounded-full h-4 overflow-hidden relative">
          <div
            className="bg-[#58cc02] h-full rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute top-1 left-2 right-2 h-1 bg-white opacity-30 rounded-full"></div>
          </div>
        </div>
        <div className="hidden md:block text-xs font-extrabold text-[#6f6f6f] uppercase tracking-wider bg-[#f7f7f7] border border-gray-200 px-2 py-1 rounded-lg">
          {sectionCurrent}/{sectionTotal}
        </div>
      </div>
    </div>
  );
};

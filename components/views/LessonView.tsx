import React from 'react';
import { AudioButton } from '../AudioButton';
import { LessonData } from '../../types';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

type LessonViewProps = {
  currentCourseCode: string;
  currentLevelTitle: string;
  unitXp: number;
  currentIndex: number;
  currentBatchEntries: LessonEntry[];
  currentBatchLessonsCount: number;
  englishReferenceLessons: LessonData[];
  defaultLanguage: 'burmese' | 'english';
  isPronunciationEnabled: boolean;
};

export const LessonView: React.FC<LessonViewProps> = ({
  currentCourseCode,
  currentLevelTitle,
  unitXp,
  currentIndex,
  currentBatchEntries,
  currentBatchLessonsCount,
  englishReferenceLessons,
  defaultLanguage,
  isPronunciationEnabled,
}) => {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-[24px] shadow-xl p-4 md:p-5 w-full max-w-2xl flex flex-col items-center">
      <div className="w-full mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#58cc02]">
          Course {currentCourseCode} • {currentLevelTitle}
        </p>
        <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-lg border-2 border-[#9ad56a] bg-[#f7ffef] text-[#2f7d01] text-[11px] font-extrabold uppercase tracking-wide">
          XP: {unitXp}
        </span>
      </div>
      <div className="w-full space-y-2">
        {currentBatchEntries.map(({ lesson, lessonIndex }, idx) => (
          <div key={`${lesson.english}-${currentIndex + idx}`}>
            {(() => {
              const englishTranslation = englishReferenceLessons[lessonIndex]?.english || lesson.english;
              const translatedText = defaultLanguage === 'burmese' ? lesson.burmese : englishTranslation;
              return (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-2.5 py-2">
                  <AudioButton text={lesson.english} compact />
                  <div className="text-left leading-tight">
                    <p className="text-base md:text-lg font-medium text-[#3c3c3c]">{lesson.english}</p>
                    <p className="text-base md:text-lg font-normal text-[#58cc02]">{translatedText}</p>
                    {isPronunciationEnabled && (
                      <p className="text-sm md:text-base font-normal text-gray-500">{lesson.pronunciation}</p>
                    )}
                  </div>
                </div>
              );
            })()}
            {idx < currentBatchLessonsCount - 1 && <div className="h-1" />}
          </div>
        ))}
      </div>
    </div>
  );
};


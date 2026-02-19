import React from 'react';
import { AudioButton, VoicePreference } from '../AudioButton';
import { LessonData } from '../../types';
import { buildLessonReferenceKey } from '../../utils/lessonReference';

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
  englishReferenceByKey: Map<string, string>;
  defaultLanguage: 'burmese' | 'english';
  isPronunciationEnabled: boolean;
  isBoldTextEnabled: boolean;
  voicePreference: VoicePreference;
};

export const LessonView: React.FC<LessonViewProps> = ({
  currentCourseCode,
  currentLevelTitle,
  unitXp,
  currentIndex,
  currentBatchEntries,
  currentBatchLessonsCount,
  englishReferenceLessons,
  englishReferenceByKey,
  defaultLanguage,
  isPronunciationEnabled,
  isBoldTextEnabled,
  voicePreference,
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
              const lessonKey = buildLessonReferenceKey(lesson);
              const englishTranslation =
                englishReferenceByKey.get(lessonKey) || englishReferenceLessons[lessonIndex]?.english || lesson.english;
              const translatedText = defaultLanguage === 'burmese' ? lesson.burmese : englishTranslation;
              return (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-2.5 py-2">
                  <AudioButton text={lesson.english} compact voicePreference={voicePreference} />
                  <div className="text-left leading-tight">
                    <p className={`text-base md:text-lg text-[#3c3c3c] ${isBoldTextEnabled ? 'font-bold' : 'font-medium'}`}>
                      {lesson.english}
                    </p>
                    <p className={`text-base md:text-lg text-[#58cc02] ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                      {translatedText}
                    </p>
                    {isPronunciationEnabled && (
                      <p className={`text-sm md:text-base text-gray-500 ${isBoldTextEnabled ? 'font-bold' : 'font-normal'}`}>
                        {lesson.pronunciation}
                      </p>
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

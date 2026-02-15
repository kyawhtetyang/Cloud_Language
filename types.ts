
export interface LessonData {
  level: number;
  unit: number;
  topic: string;
  burmese: string;
  english: string;
  pronunciation: string;
}

export interface ProgressState {
  currentIndex: number;
  completedCount: number;
}

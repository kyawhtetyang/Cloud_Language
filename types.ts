
export interface LessonData {
  level: number;
  unit: number;
  stage?: string;
  topic: string;
  burmese: string;
  english: string;
  pronunciation: string;
}

export interface ProgressState {
  currentIndex: number;
  completedCount: number;
}

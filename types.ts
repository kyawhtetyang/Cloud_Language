
export interface LessonData {
  groupId?: string;
  unitId?: number;
  orderIndex?: number;
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


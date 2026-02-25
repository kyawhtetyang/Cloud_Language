
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
  audioPath?: string;
  sourceLabel?: string;
  collectionLabel?: string;
}

export interface ProgressState {
  currentIndex: number;
  completedCount: number;
}

export interface LessonHighlight {
  id: string;
  profileStorageId: string;
  learnLanguage: string;
  lessonKey: string;
  lessonText: string;
  selectedText: string;
  createdAt: string;
}

import type { StageCode } from '../../../config/appConfig';

export type AlbumUnitEntry = {
  stage: StageCode;
  level: number;
  unit: number;
  topic: string;
};

export type AlbumGroup = {
  key: string;
  stage: StageCode;
  groupIndex: number;
  units: AlbumUnitEntry[];
  firstTopicConcise: string;
  coverUrl: string;
};

export type AlbumCollectionSection = {
  key: string;
  label: string;
  levelScheme?: string;
  levelCode?: string;
  levelOrder?: number;
  groups: AlbumGroup[];
};

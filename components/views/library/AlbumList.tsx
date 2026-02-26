import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { localizeRoadmapTopic } from '../../../config/roadmapI18n';
import { LibraryGroupCard } from './LibraryGroupCard';
import type { AlbumCollectionSection, AlbumGroup } from './libraryTypes';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';

type AlbumListProps = {
  sections: AlbumCollectionSection[];
  defaultLanguage: DefaultLanguage;
  onOpenAlbum: (albumKey: string) => void;
  formatAlbumMeta: (group: AlbumGroup) => string;
};

function shortenLabel(text: string, max = 56): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

export const AlbumList: React.FC<AlbumListProps> = ({
  sections,
  defaultLanguage,
  onOpenAlbum,
  formatAlbumMeta,
}) => (
  <>
    {sections.map((section) => (
      <div key={section.key} className={LIBRARY_UI_TOKENS.sectionWrap}>
        <div className={LIBRARY_UI_TOKENS.sectionHeaderBar}>
          <p className={LIBRARY_UI_TOKENS.sectionHeaderText}>{section.label}</p>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {section.groups.map((group) => (
            <LibraryGroupCard
              key={group.key}
              onOpen={() => onOpenAlbum(group.key)}
              ariaLabel={`Open group ${group.groupIndex + 1}`}
              title={shortenLabel(localizeRoadmapTopic(group.firstTopicConcise, defaultLanguage), 48)}
              meta={formatAlbumMeta(group)}
              coverUrl={group.coverUrl}
              accentClass={LIBRARY_UI_TOKENS.sectionAccent}
            />
          ))}
        </div>
      </div>
    ))}
  </>
);

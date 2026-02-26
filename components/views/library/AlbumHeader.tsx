import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';

type AlbumHeaderProps = {
  query: string;
  defaultLanguage: DefaultLanguage;
  onQueryChange: (value: string) => void;
};

export const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  query,
  defaultLanguage,
  onQueryChange,
}) => (
  <div className={LIBRARY_UI_TOKENS.searchWrap}>
    <label htmlFor="library-search" className="sr-only">
      Search library
    </label>
    <div className={LIBRARY_UI_TOKENS.searchRow}>
      <span aria-hidden="true" className={LIBRARY_UI_TOKENS.searchIcon}>
        🔍
      </span>
      <input
        id="library-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={defaultLanguage === 'burmese' ? 'Library ကို ရှာမယ်' : 'Search library'}
        className={LIBRARY_UI_TOKENS.searchInput}
      />
    </div>
  </div>
);

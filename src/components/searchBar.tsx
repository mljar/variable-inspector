import React from 'react';
import { useVariableContext } from '../context/notebookVariableContext';
import { t } from '../translator';

export const SearchBar: React.FC = () => {
  const { variables, searchTerm, setSearchTerm } = useVariableContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  return (
    <>
      {variables.length !== 0 ? (
        <div className="mljar-variable-search-bar-container">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            aria-label={t('Search variables')}
            placeholder={t('Search variable...')}
            className="mljar-variable-inspector-search-bar-input"
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

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
            <circle cx="11" cy="11" r="7" />
            <line x1="16.65" y1="16.65" x2="20" y2="20" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
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

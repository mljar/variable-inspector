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
            <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1016 9.5a6.46 6.46 0 01-1.57 4.23l.27.27h.79l5 5-1.5 1.5-5-5zM9.5 14A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z" />
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

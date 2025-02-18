import React from 'react';
import { useVariableContext } from '../context/notebookVariableContext';

export const SearchBar: React.FC = () => {
  const { variables, searchTerm, setSearchTerm } = useVariableContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  return (
    <>
      {variables.length !== 0 ? (
        <div className="mljar-variable-search-bar-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            placeholder="Search Variable..."
            className="mljar-variable-inspector-search-bar-input"
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

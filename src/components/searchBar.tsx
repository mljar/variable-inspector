import React from 'react';
import { useVariableContext } from '../context/notebookVariableContext';

export const SearchBar: React.FC = () => {
  const { searchTerm, setSearchTerm } = useVariableContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="mljar-search-bar-container">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search Variable..."
        className='mljar-search-bar-input'
      />
    </div>
  );
};


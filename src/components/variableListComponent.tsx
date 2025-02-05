import React from 'react';
import { VariableList } from './variableList';
import { SearchBar } from './searchBar';
import { RefreshButton } from './variableRefreshButton';

export const VariableListComponent: React.FC = () => {
  return (
    <div className="mljar-variable-container">
      <div className="mljar-variable-header-container">
        <h3 className="mljar-variable-header">Variable Inspector</h3>
      </div>
      <div>
        <div className="mljar-actions-container">
          <RefreshButton />
        </div>
        <SearchBar />
        <VariableList />
      </div>
    </div>
  );
};

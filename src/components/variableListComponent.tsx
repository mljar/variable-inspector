import React from 'react';
import { VariableList } from './variableList';
import { SearchBar } from './searchBar';
import { RefreshButton } from './variableRefreshButton';
import { CommandRegistry } from '@lumino/commands';

interface VariableListComponentProps {
  commands: CommandRegistry;
}

export const VariableListComponent: React.FC<VariableListComponentProps> = ({commands}) => {
  return (
    <div className="mljar-variable-container">
      <div className="mljar-variable-header-container">
        <h3 className="mljar-variable-header">Variable Inspector</h3>
      </div>
      <div>
        <div className="mljar-variable-actions-container">
          <RefreshButton />
        </div>
        <SearchBar />
        <VariableList commands={commands} />
      </div>
    </div>
  );
};

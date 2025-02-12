import React from 'react';
import { VariableList } from './variableList';
import { SearchBar } from './searchBar';
import { RefreshButton } from './variableRefreshButton';
import { CommandRegistry } from '@lumino/commands';
import { ILabShell  } from '@jupyterlab/application';
import { SettingsButton } from './variableSettingsButton';

interface VariableListComponentProps {
  commands: CommandRegistry;
  labShell: ILabShell;
}

export const VariableListComponent: React.FC<VariableListComponentProps> = ({
  commands,labShell
}) => {
  return (
    <div className="mljar-variable-container">
      <div className="mljar-variable-header-container">
        <h3 className="mljar-variable-header">Variable Inspector</h3>
        <RefreshButton />
        <SettingsButton />
      </div>
      <div>
        <SearchBar />
        <VariableList commands={commands} labShell={labShell} />
      </div>
    </div>
  );
};

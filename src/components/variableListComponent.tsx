import React from 'react';
import { VariableList } from './variableList';
import { SearchBar } from './searchBar';
import { RefreshButton } from './variableRefreshButton';
import { CommandRegistry } from '@lumino/commands';
import { ILabShell } from '@jupyterlab/application';
import { SettingsButton } from './variableSettingsButton';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

interface IVariableListComponentProps {
  commands: CommandRegistry;
  labShell: ILabShell;
  settingRegistry: ISettingRegistry | null;
}

export const VariableListComponent: React.FC<IVariableListComponentProps> = ({
  commands,
  labShell,
  settingRegistry
}) => {
  return (
    <div className="mljar-variable-inspector-container">
      <div className="mljar-variable-header-container">
        <h3 className="mljar-variable-header">Variable Inspector</h3>
        <RefreshButton settingRegistry={settingRegistry} />
        <SettingsButton settingRegistry={settingRegistry} />
      </div>
      <div>
        <SearchBar />
        <VariableList
          commands={commands}
          labShell={labShell}
          settingRegistry={settingRegistry}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { VariableList } from './variableList';
import { SearchBar } from './searchBar';
import { RefreshButton } from './variableRefreshButton';
import { CommandRegistry } from '@lumino/commands';
import { ILabShell } from '@jupyterlab/application';
import { SettingsButton } from './variableSettingsButton';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { t } from '../translator';
import { useVariableContext } from '../context/notebookVariableContext';

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
  const { variables } = useVariableContext();

  return (
    <div className="mljar-variable-inspector-panel">
      <div className="mljar-variable-header-container">
        <div className="mljar-variable-header-title-wrap">
          <h3 className="mljar-variable-header">{t('Your Variables')}</h3>
          <span className="mljar-variable-count-badge">{variables.length}</span>
        </div>
        <div className="mljar-variable-actions-container">
          <RefreshButton settingRegistry={settingRegistry} />
          <SettingsButton settingRegistry={settingRegistry} />
        </div>
      </div>
      <div className="mljar-variable-body">
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

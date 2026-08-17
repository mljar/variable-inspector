import { refreshIcon } from '../icons/refreshIcon';
import React, { useEffect, useState } from 'react';
import { useVariableContext } from '../context/notebookVariableContext';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { VARIABLE_INSPECTOR_ID, autoRefreshProperty } from '../index';
import { t } from '../translator';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { notebookExecutionRefreshCoordinator } from '../services/notebookExecutionRefreshCoordinator';

interface IProps {
  settingRegistry: ISettingRegistry | null;
}

export const RefreshButton: React.FC<IProps> = ({ settingRegistry }) => {
  const { refreshVariables, loading } = useVariableContext();
  const notebookPanel = useNotebookPanelContext();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadAutoRefresh = () => {
    if (settingRegistry) {
      settingRegistry
        .load(VARIABLE_INSPECTOR_ID)
        .then(settings => {
          const updateSettings = (): void => {
            const loadAutoRefresh = settings.get(autoRefreshProperty)
              .composite as boolean;
            setAutoRefresh(loadAutoRefresh);
          };
          updateSettings();
          settings.changed.connect(updateSettings);
        })
        .catch(reason => {
          console.error('Failed to load settings for Your Variables', reason);
        });
    }
  };

  useEffect(() => {
    loadAutoRefresh();
  }, []);

  const handleRefresh = (): void => {
    if (!notebookExecutionRefreshCoordinator.refresh(notebookPanel)) {
      refreshVariables();
    }
  };

  return (
    <button
      className={`mljar-variable-inspector-refresh-button ${autoRefresh ? '' : 'manually-refresh'}`}
      onClick={handleRefresh}
      disabled={loading}
      title={t('Refresh variables')}
    >
      <refreshIcon.react className="mljar-variable-inspector-refresh-icon" />
    </button>
  );
};

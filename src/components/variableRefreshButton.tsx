import { refreshIcon } from '../icons/refreshIcon';
import React, { useEffect, useState } from 'react';
import { useVariableContext } from '../context/notebookVariableContext';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { VARIABLE_INSPECTOR_ID, autoRefreshProperty } from '../index';

interface IProps {
  settingRegistry: ISettingRegistry | null;
}

export const RefreshButton: React.FC<IProps> = ({ settingRegistry }) => {
  const { refreshVariables, loading } = useVariableContext();
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
          console.error(
            'Failed to load settings for Variable Inspector',
            reason
          );
        });
    }
  };

  useEffect(() => {
    loadAutoRefresh();
  }, []);

  return (
    <button
      className={`mljar-variable-inspector-refresh-button ${autoRefresh ? `` : `manually-refresh`}`}
      onClick={refreshVariables}
      disabled={loading}
      title="Refresh Variables"
    >
      <refreshIcon.react className="mljar-variable-inspector-refresh-icon" />
    </button>
  );
};

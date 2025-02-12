import { settingsIcon } from '../icons/settingsIcon';
import { checkIcon } from '../icons/checkIcon';
import React, { useEffect, useState } from 'react';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { VARIABLE_INSPECTOR_ID } from '../index';

interface IProps {
  settingRegistry: ISettingRegistry | null;
}

export const SettingsButton: React.FC<IProps> = ({ settingRegistry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const showSettings = () => {
    setIsOpen(!isOpen);
  };

  const saveAutoRefresh = (newValue: boolean) => {
    console.log('save');
    if (settingRegistry) {
      settingRegistry
        .load(VARIABLE_INSPECTOR_ID)
        .then(settings => {
          settings.set('variableInspectorAutoRefresh', newValue);
        })
        .catch(reason => {
          console.error('Failed', reason);
        });
    }
  };

  const loadAutoRefresh = () => {
    if (settingRegistry) {
      settingRegistry
        .load(VARIABLE_INSPECTOR_ID)
        .then(settings => {
          const updateSettings = (): void => {
            const variableInspectorAutoRefresh = settings.get(
              'variableInspectorAutoRefresh'
            ).composite as boolean;
            setAutoRefresh(variableInspectorAutoRefresh);
            console.log(variableInspectorAutoRefresh);
          };
          updateSettings();
          settings.changed.connect(updateSettings);
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for variableinspector',
            reason
          );
        });
    }
  };

  useEffect(() => {
    console.log('load auto refresh');
    loadAutoRefresh();
  }, []);

  return (
    <div className="mljar-variable-inspector-settings-container">
      <button
        className={`mljar-variable-inspector-settings-button ${isOpen ? 'active' : ''}`}
        onClick={showSettings}
        title="Settings"
      >
        <settingsIcon.react className="mljar-variable-inspector-settings-icon" />
      </button>

      {isOpen && (
        <div className="mljar-variable-inspector-settings-menu">
          <ul className="mljar-variable-inspector-settings-menu-list">
            <button
              className="mljar-variable-inspector-settings-menu-item first"
              onClick={() => saveAutoRefresh(true)}
            >
              Automatically refresh
              {autoRefresh && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <button
              className="mljar-variable-inspector-settings-menu-item"
              onClick={() => saveAutoRefresh(false)}
            >
              Manually refresh
              {!autoRefresh && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <li className="mljar-variable-inspector-settings-menu-item last">
              Language
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

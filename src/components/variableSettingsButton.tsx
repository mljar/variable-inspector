import { settingsIcon } from '../icons/settingsIcon';
import { checkIcon } from '../icons/checkIcon';
import React, { useState, useEffect } from 'react';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

export const SettingsButton: React.FC<{ settings: ISettingRegistry.ISettings }> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    setAutoRefresh(settings.get('autoRefresh').composite as boolean);
  }, [settings]);

  const showSettings = () => {
    setIsOpen(!isOpen);
  };

  const toggleAutoRefresh = (value: boolean) => {
    setAutoRefresh(value);
    settings.set('autoRefresh', value);
  };

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
              onClick={() => toggleAutoRefresh(true)}
            >
              Automatically refresh
              {autoRefresh && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <button
              className="mljar-variable-inspector-settings-menu-item"
              onClick={() => toggleAutoRefresh(false)}
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

import { settingsIcon } from '../icons/settingsIcon';
import { checkIcon } from '../icons/checkIcon';
import React, { useState } from 'react';

export const SettingsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const showSettings = () => {
    setIsOpen(!isOpen);
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
              onClick={() => setAutoRefresh(true)}
            >
              Automatically refresh
              {autoRefresh && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <button
              className="mljar-variable-inspector-settings-menu-item"
              onClick={() => setAutoRefresh(false)}
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

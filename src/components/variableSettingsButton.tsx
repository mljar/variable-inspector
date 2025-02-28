import { settingsIcon } from '../icons/settingsIcon';
import { checkIcon } from '../icons/checkIcon';
import React, { useEffect, useState } from 'react';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import {
  VARIABLE_INSPECTOR_ID,
  autoRefreshProperty,
  showTypeProperty,
  showShapeProperty,
  showSizeProperty
} from '../index';

interface ISettingsButtonProps {
  settingRegistry: ISettingRegistry | null;
}

export const SettingsButton: React.FC<ISettingsButtonProps> = ({
  settingRegistry
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showType, setShowType] = useState(false);
  const [showShape, setShowShape] = useState(false);
  const [showSize, setShowSize] = useState(false);

  const showSettings = () => {
    setIsOpen(!isOpen);
  };

  const savePropertyValue = (propertyName: string, newValue: boolean) => {
    if (settingRegistry) {
      settingRegistry
        .load(VARIABLE_INSPECTOR_ID)
        .then(settings => {
          settings.set(propertyName, newValue);
        })
        .catch(reason => {
          console.error(`Faild to save ${propertyName}: `, reason);
        });
    }
  };

  const loadPropertiesValues = () => {
    if (settingRegistry) {
      settingRegistry
        .load(VARIABLE_INSPECTOR_ID)
        .then(settings => {
          const updateSettings = (): void => {
            const loadAutoRefresh = settings.get(autoRefreshProperty)
              .composite as boolean;
            setAutoRefresh(loadAutoRefresh);

            const loadShowType = settings.get(showTypeProperty)
              .composite as boolean;
            setShowType(loadShowType);

            const loadShowShape = settings.get(showShapeProperty)
              .composite as boolean;
            setShowShape(loadShowShape);

            const loadShowSize = settings.get(showSizeProperty)
              .composite as boolean;
            setShowSize(loadShowSize);
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
    loadPropertiesValues();
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
              onClick={() => {
                if (!autoRefresh) savePropertyValue(autoRefreshProperty, true);
              }}
            >
              Automatically refresh
              {autoRefresh && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <button
              className="mljar-variable-inspector-settings-menu-item"
              onClick={() => {
                if (autoRefresh) savePropertyValue(autoRefreshProperty, false);
              }}
            >
              Manually refresh
              {!autoRefresh && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <hr />
            <button
              className="mljar-variable-inspector-settings-menu-item"
              onClick={() => savePropertyValue(showTypeProperty, !showType)}
            >
              Show type
              {showType && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <button
              className="mljar-variable-inspector-settings-menu-item"
              onClick={() => savePropertyValue(showShapeProperty, !showShape)}
            >
              Show shape
              {showShape && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
            <button
              className="mljar-variable-inspector-settings-menu-item last"
              onClick={() => savePropertyValue(showSizeProperty, !showSize)}
            >
              Show size
              {showSize && (
                <checkIcon.react className="mljar-variable-inspector-settings-icon" />
              )}
            </button>
          </ul>
        </div>
      )}
    </div>
  );
};

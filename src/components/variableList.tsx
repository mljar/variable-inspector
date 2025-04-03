import React, { useEffect, useState } from 'react';
import { useVariableContext } from '../context/notebookVariableContext';
import { VariableItem } from './variableItem';
import { CommandRegistry } from '@lumino/commands';
import { ILabShell } from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import {
  VARIABLE_INSPECTOR_ID,
  showTypeProperty,
  showShapeProperty,
  showSizeProperty
} from '../index';

interface VariableListProps {
  commands: CommandRegistry;
  labShell: ILabShell;
  settingRegistry: ISettingRegistry | null;
}

export const VariableList: React.FC<VariableListProps> = ({
  commands,
  labShell,
  settingRegistry
}) => {
  const { variables, searchTerm, loading } = useVariableContext();

  const filteredVariables = variables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [showType, setShowType] = useState(false);
  const [showShape, setShowShape] = useState(false);
  const [showSize, setShowSize] = useState(false);

  const loadPropertiesValues = () => {
    if (settingRegistry) {
      settingRegistry
        .load(VARIABLE_INSPECTOR_ID)
        .then(settings => {
          const updateSettings = (): void => {
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
    <div className="mljar-variable-inspector-list-container">
      {loading ? (
        <div className="mljar-variable-inspector-message">
          Loading variables...
        </div>
      ) : variables.length === 0 ? (
        <div className="mljar-variable-inspector-message">
          Sorry, no variables available.
        </div>
      ) : (
        <ul className="mljar-variable-inspector-list">
          <li className="mljar-variable-inspector-header-list">
            <span>Name</span>
            {showType && <span>Type</span>}
            {showShape && <span>Shape</span>}
            {showSize && <span>Size</span>}
            <span>Value</span>
          </li>
          {filteredVariables.map((variable, index) => (
            <VariableItem
              key={index}
              vrb={{
                name: variable.name,
                type: variable.type,
                shape: variable.shape,
                dimension: variable.dimension,
                size: variable.size,
                value: variable.value
              }}
              commands={commands}
              labShell={labShell}
              showType={showType}
              showShape={showShape}
              showSize={showSize}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

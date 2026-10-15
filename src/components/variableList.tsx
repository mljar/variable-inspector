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
import { t } from '../translator';

interface VariableListProps {
  commands: CommandRegistry;
  labShell: ILabShell;
  settingRegistry: ISettingRegistry | null;
}

type TypeFilter = 'all' | 'dataframe' | 'ndarray' | 'number' | 'other';

export const VariableList: React.FC<VariableListProps> = ({
  commands,
  labShell,
  settingRegistry
}) => {
  const { variables, searchTerm, loading } = useVariableContext();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filteredVariables = variables
    .filter(variable =>
      variable.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(variable => {
      const normalizedType = variable.type.toLowerCase();

      if (typeFilter === 'all') {
        return true;
      }

      if (typeFilter === 'dataframe') {
        return normalizedType === 'dataframe';
      }

      if (typeFilter === 'ndarray') {
        return normalizedType === 'ndarray';
      }

      if (typeFilter === 'number') {
        return [
          'int',
          'int32',
          'int64',
          'float',
          'float32',
          'float64',
          'bool'
        ].includes(normalizedType);
      }

      return !['dataframe', 'ndarray'].includes(normalizedType);
    });

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
          console.error('Failed to load settings for Your Variables', reason);
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
          {t('Loading variables...')}
        </div>
      ) : variables.length === 0 ? (
        <div className="mljar-variable-inspector-message">
          {t('No variables yet. Run a notebook cell to see them here.')}
        </div>
      ) : (
        <>
          <div className="mljar-variable-type-filters">
            <button
              className={`mljar-variable-button mljar-variable-type-chip ${typeFilter === 'all' ? 'active' : ''}`}
              type="button"
              aria-pressed={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            >
              {t('All')}
            </button>
            <button
              className={`mljar-variable-button mljar-variable-type-chip ${typeFilter === 'dataframe' ? 'active' : ''}`}
              type="button"
              aria-pressed={typeFilter === 'dataframe'}
              onClick={() => setTypeFilter('dataframe')}
            >
              DataFrame
            </button>
            <button
              className={`mljar-variable-button mljar-variable-type-chip ${typeFilter === 'ndarray' ? 'active' : ''}`}
              type="button"
              aria-pressed={typeFilter === 'ndarray'}
              onClick={() => setTypeFilter('ndarray')}
            >
              ndarray
            </button>
            <button
              className={`mljar-variable-button mljar-variable-type-chip ${typeFilter === 'number' ? 'active' : ''}`}
              type="button"
              aria-pressed={typeFilter === 'number'}
              onClick={() => setTypeFilter('number')}
            >
              {t('Numbers')}
            </button>
            <button
              className={`mljar-variable-button mljar-variable-type-chip ${typeFilter === 'other' ? 'active' : ''}`}
              type="button"
              aria-pressed={typeFilter === 'other'}
              onClick={() => setTypeFilter('other')}
            >
              {t('Other')}
            </button>
          </div>
          {filteredVariables.length === 0 ? (
            <div className="mljar-variable-inspector-message" role="status">
              {t('No variables match your search or filter.')}
            </div>
          ) : (
            <ul className="mljar-variable-inspector-list">
              <li className="mljar-variable-inspector-header-list">
                <span>{t('Name')}</span>
                {showType && <span>{t('Type')}</span>}
                {showShape && <span>{t('Shape')}</span>}
                {showSize && <span>{t('Size')}</span>}
                <span>{t('Value')}</span>
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
                  labShell={labShell}
                  showType={showType}
                  showShape={showShape}
                  showSize={showSize}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

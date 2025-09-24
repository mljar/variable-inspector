import React, { useEffect, useRef, useState } from 'react';
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

  const listRef = useRef<HTMLUListElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // handle scrollbar
  useEffect(() => {
    const listEl = listRef.current;
    const containerEl = containerRef.current;
    if (!listEl || !containerEl) return;

    // function to check if there is overflow
    const checkOverflow = () => {
      const hasOverflowY = listEl.scrollHeight > listEl.clientHeight;

      if (hasOverflowY) {
        listEl.classList.add('variable-inspector-has-overflow');
        containerEl.classList.add('variable-inspector-has-overflow');
      } else {
        listEl.classList.remove('variable-inspector-has-overflow');
        containerEl.classList.remove('variable-inspector-has-overflow');
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    // hover handle
    const handleMouseEnter = () => {
      const elements = document.querySelectorAll<HTMLElement>('.variable-inspector-has-overflow');
      elements.forEach(el => {
        el.style.paddingRight = '5px';
      });
    };

    const handleMouseLeave = () => {
      const elements = document.querySelectorAll<HTMLElement>('.variable-inspector-has-overflow');
      elements.forEach(el => {
        el.style.paddingRight = '';
      });
    };

    listEl.addEventListener('mouseenter', handleMouseEnter);
    listEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', checkOverflow);
      listEl.removeEventListener('mouseenter', handleMouseEnter);
      listEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [filteredVariables]);

  return (
    <div className="mljar-variable-inspector-list-container" ref={containerRef}>
      {loading ? (
        <div className="mljar-variable-inspector-message">
          {t('Loading variables...')}
        </div>
      ) : variables.length === 0 ? (
        <div className="mljar-variable-inspector-message">
          {t('Sorry, no variables available.')}
        </div>
      ) : (
        <ul className="mljar-variable-inspector-list" ref={listRef}>
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
    </div>
  );
};

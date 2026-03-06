import React, { useState } from 'react';
import { detailIcon } from '../icons/detailIcon';
import { executeMatrixContent } from '../utils/executeGetMatrix';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { allowedTypes } from '../utils/allowedTypes';
import { ILabShell } from '@jupyterlab/application';
import { createEmptyVariableInspectorPanel } from '../components/variableInspectorPanel';
import { t } from '../translator';

interface VariableInfo {
  name: string;
  type: string;
  shape: string;
  dimension: number;
  size: number;
  value: string;
}

interface VariableItemProps {
  vrb: VariableInfo;
  labShell: ILabShell;
  showType: boolean;
  showShape: boolean;
  showSize: boolean;
}

export const VariableItem: React.FC<VariableItemProps> = ({
  vrb,
  labShell,
  showType,
  showShape,
  showSize
}) => {
  const notebookPanel = useNotebookPanelContext();
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async (
    variableName: string,
    variableType: string,
    variableShape: string
  ) => {
    if (notebookPanel) {
      try {
        const result = await executeMatrixContent(
          variableName,
          0,
          100,
          0,
          100,
          notebookPanel
        );
        const variableData = result.content;
        let isOpen = false;
        for (const widget of labShell.widgets('main')) {
          if (widget.id === `${variableType}-${variableName}`) {
            isOpen = true;
          }
        }
        if (variableData && !isOpen) {
          setLoading(true);
          createEmptyVariableInspectorPanel(
            labShell,
            variableName,
            variableType,
            variableShape,
            notebookPanel
          );
        }
      } catch (err) {
        console.error('unknown error', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getTypeDotClass = (type: string) => {
    const normalizedType = type.toLowerCase();

    if (normalizedType === 'dataframe') {
      return 'mljar-variable-type-dot td-df';
    }

    if (normalizedType === 'ndarray' || normalizedType === 'series') {
      return 'mljar-variable-type-dot td-arr';
    }

    if (normalizedType === 'dict') {
      return 'mljar-variable-type-dot td-dict';
    }

    if (
      ['int', 'int32', 'int64', 'float', 'float32', 'float64', 'bool'].includes(
        normalizedType
      )
    ) {
      return 'mljar-variable-type-dot td-num';
    }

    if (normalizedType === 'str' || normalizedType === 'string') {
      return 'mljar-variable-type-dot td-str';
    }

    return 'mljar-variable-type-dot td-model';
  };

  return (
    <li
      className={`mljar-variable-inspector-item ${allowedTypes.includes(vrb.type) && vrb.dimension <= 2 && vrb.type !== 'list' && vrb.dimension !== 1 ? '' : 'small-value'}`}
    >
      <span className="mljar-variable-inspector-variable-name">
        <span className={getTypeDotClass(vrb.type)} />
        {vrb.name}
      </span>
      {showType && <span className="mljar-variable-type">{vrb.type}</span>}
      {showShape && (
        <span className="mljar-variable-shape">
          {vrb.shape !== 'None' ? vrb.shape : ''}
        </span>
      )}
      {showSize && (
        <span className="mljar-variable-inspector-variable-size">
          {vrb.size}
        </span>
      )}
      {allowedTypes.includes(vrb.type) && vrb.dimension <= 2 ? (
        vrb.dimension === 1 && vrb.type === 'list' ? (
          <button
            className="mljar-variable-inspector-variable-preview"
            title={vrb.value}
            onClick={() => handleButtonClick(vrb.name, vrb.type, vrb.shape)}
          >
            {vrb.value}
          </button>
        ) : (
          <button
            className="mljar-variable-inspector-show-variable-button"
            onClick={() => handleButtonClick(vrb.name, vrb.type, vrb.shape)}
            aria-label={`Show details for ${vrb.name}`}
            title={t('Show value')}
          >
            {loading ? (
              <div className="mljar-variable-spinner-big" />
            ) : (
              <detailIcon.react className="mljar-variable-detail-button-icon" />
            )}
          </button>
        )
      ) : vrb.type === 'dict' ? (
        <span
          className="mljar-variable-inspector-variable-value"
          title={vrb.value}
        >
          {vrb.value}
        </span>
      ) : (
        <span
          className="mljar-variable-inspector-variable-value"
          title={vrb.value}
        >
          {vrb.value}
        </span>
      )}
    </li>
  );
};

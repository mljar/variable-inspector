import React, { useState } from 'react';
import { detailIcon } from '../icons/detailIcon';
import { CommandRegistry } from '@lumino/commands';
import { executeMatrixContent } from '../utils/executeGetMatrix';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { allowedTypes } from '../utils/allowedTypes';
import { ILabShell } from '@jupyterlab/application';
import { createEmptyVariableInspectorPanel } from '../components/variableInspectorPanel';

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
  commands: CommandRegistry;
  labShell: ILabShell;
  showType: boolean;
  showShape: boolean;
  showSize: boolean;
}

export const VariableItem: React.FC<VariableItemProps> = ({
  vrb,
  commands,
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
    variableShape: string,
  ) => {
    if (notebookPanel) {
      try {
        const result = await executeMatrixContent(variableName,0,100,0,100, notebookPanel);
        const returnedSize = result.returnedSize;
        console.log(returnedSize, "returnedSize");

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
          notebookPanel,
        );

        }
      } catch (err) {
        console.error("uknown error", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
      <li className={`mljar-variable-inspector-item ${allowedTypes.includes(vrb.type) && vrb.dimension <= 2 ? `` : `small-value`}`}>
        <span className="mljar-variable-inspector-variable-name">{vrb.name}</span>
        {showType && (<span className="mljar-variable-type">{vrb.type}</span>)}
        {showShape && (<span className="mljar-variable-shape">{vrb.shape !== 'None' ? vrb.shape : ''}</span>)}
        {showSize && (<span className='mljar-variable-inspector-variable-size'>{vrb.size}</span>)}
        {allowedTypes.includes(vrb.type) && vrb.dimension <= 2 ? (
          <button
            className="mljar-variable-inspector-show-variable-button"
            onClick={() => handleButtonClick(vrb.name, vrb.type, vrb.shape)}
            aria-label={`Show details for ${vrb.name}`}
            title='Show value'
          >
            {loading ? (
              <div className="mljar-variable-spinner-big" />
            ) : (
              <detailIcon.react className="mljar-variable-detail-button-icon" />
            )}
          </button>
        ) : (
          <span className="mljar-variable-inspector-variable-value" title={vrb.value}>
            {vrb.value}
          </span>
        )}      
      </li>
  );
};

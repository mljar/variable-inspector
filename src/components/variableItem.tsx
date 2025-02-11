import React, { useState } from 'react';
import { detailIcon } from '../icons/detailIcon';
import { CommandRegistry } from '@lumino/commands';
import { executeMatrixContent } from '../utils/executeGetMatrix';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { allowedTypes } from '../utils/allowedTypes';
import { ILabShell } from '@jupyterlab/application';

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
}

export const VariableItem: React.FC<VariableItemProps> = ({
  vrb,
  commands,
  labShell
}) => {
  const notebookPanel = useNotebookPanelContext();
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async (
    command: CommandRegistry,
    variableName: string,
    variableType: string
  ) => {
    if (notebookPanel) {
      try {
        setLoading(true);
        const result = await executeMatrixContent(variableName, notebookPanel);
        const variableData = result.content;
        // let isOpen = false;
        // for (const widget of labShell.widgets('main')) {
        //   if (widget.id === `${variableType}-${variableName}`) {
        //     isOpen = true;
        //   }
        // }
        // //i dont really know to dont let user open same notebook

        if (variableData) {
          console.log('hello');
          command.execute('custom:open-variable-inspector', {
            variableName,
            variableType,
            variableData
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <li className="mljar-variable-item">
        <span className="mljar-variable-name">{vrb.name}</span>
        <span className="mljar-variable-type">{vrb.type}</span>
        <span className="mljar-variable-shape">{vrb.shape}</span>
        {allowedTypes.includes(vrb.type) && vrb.dimension <= 2 ? (
          <button
            className="mljar-variable-show-variable-button"
            onClick={() => handleButtonClick(commands, vrb.name, vrb.type)}
            aria-label={`Show details for ${vrb.name}`}
            disabled={vrb.size > 10}
            title={vrb.size > 10 ? 'Variable is too big' : ''}
          >
            {loading ? (
              <div className="mljar-variable-spinner-big" />
            ) : (
              <detailIcon.react className="mljar-variable-detail-button-icon" />
            )}
          </button>
        ) : (
          <span className="mljar-variable-text-cell" title={vrb.value}>
            {vrb.value}
          </span>
        )}
      </li>
    </div>
  );
};

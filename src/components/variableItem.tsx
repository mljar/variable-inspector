import React from 'react';
import { detailIcon } from '../icons/detailIcon';
import { CommandRegistry } from '@lumino/commands';
import { executeMatrixContent } from '../pcode/executeGetMatrix';
import { useNotebookPanelContext } from '../context/notebookPanelContext';

interface VariableInfo {
  name: string;
  type: string;
  shape: string;
}

interface VariableItemProps {
  vrb: VariableInfo;
  commands: CommandRegistry;
}

const allowedType = ['ndarray', 'DataFrame'];

export const VariableItem: React.FC<VariableItemProps> = ({
  vrb,
  commands
}) => {
  const notebookPanel = useNotebookPanelContext();

  const handleButtonClick = async (
    command: CommandRegistry,
    variableName: string,
    variableType: string
  ) => {
    if (notebookPanel) {
      const result = await executeMatrixContent(variableName, notebookPanel);
      const variableData = result.content;
      command.execute('custom:open-variable-inspector', {
        variableName,
        variableType,
        variableData
      });
    }
  };

  return (
    <div>
      <li className="mljar-variable-item">
        <span className="mljar-variable-name">{vrb.name}</span>
        <span className="mljar-variable-type">{vrb.type}</span>
        <span className="mljar-variable-shape">{vrb.shape}</span>
        {(allowedType.includes(vrb.type) && (
          <button
            className="mljar-show-variable-button"
            onClick={() => handleButtonClick(commands, vrb.name, vrb.type)}
            aria-label={`Show details for ${vrb.name}`}
          >
            <detailIcon.react className="mljar-variable-detail-button-icon" />
          </button>
        )) || <span className="mljar-variable-blank">&nbsp;</span>}
      </li>
    </div>
  );
};

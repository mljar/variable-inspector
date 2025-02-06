import React from 'react';
import { detailIcon } from '../icons/detailIcon';
import { CommandRegistry } from '@lumino/commands';
import { executeMatrixContent } from '../pcode/executeGetMatrix';
import { useState } from 'react';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { useNotebookKernelContext } from '../context/notebookKernelContext';


interface VariableInfo {
  name: string;
  type: string;
  shape: string;
}

interface VariableItemProps {
  vrb: VariableInfo;
  commands: CommandRegistry;
}

const allowedType = ['ndarray', 'dataframe'];

export const VariableItem: React.FC<VariableItemProps> = ({
  vrb,
  commands
}) => {
  const [matrixContent, setMatrixContent] = useState<any>(null);
    const notebookPanel = useNotebookPanelContext();
    const kernel = useNotebookKernelContext();

  const handleButtonClick = async (
    command: CommandRegistry,
    variableName: string,
    variableType: string
  ) => {
    command.execute('custom:open-variable-inspector', {
      variableName,
      variableType
    });
    setMatrixContent(null);

    const result = await executeMatrixContent(variableName,kernel,notebookPanel);
    setMatrixContent(result);
    console.log(matrixContent);
  };

  return (
    <li className="mljar-variable-item">
      <span className="mljar-variable-name">{vrb.name}</span>
      <span className="mljar-variable-type">{vrb.type}</span>
      <span className="mljar-variable-shape">{vrb.shape}</span>
      {allowedType.includes(vrb.type) && (
        <button
          className="mljar-show-variable-button"
          onClick={() => handleButtonClick(commands, vrb.name, vrb.type)}
          aria-label={`Show details for ${vrb.name}`}
        >
          <detailIcon.react className="mljar-variable-detail-button-icon" />
        </button>
      )}
    </li>
  );
};

import React, { useState } from 'react';
import { detailIcon } from '../icons/detailIcon';
import { CommandRegistry } from '@lumino/commands';
import { executeMatrixContent } from '../utils/executeGetMatrix';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { allowedTypes } from '../utils/allowedTypes';

interface VariableInfo {
  name: string;
  type: string;
  shape: string;
  dimension: number;
  size: number;
}

interface VariableItemProps {
  vrb: VariableInfo;
  commands: CommandRegistry;
}

export const VariableItem: React.FC<VariableItemProps> = ({
  vrb,
  commands
}) => {
  const notebookPanel = useNotebookPanelContext();
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async (
    command: CommandRegistry,
    variableName: string,
    variableType: string
  ) => {
    if (notebookPanel) {
      try{
        setLoading(true)
      const result = await executeMatrixContent(variableName, notebookPanel);
      const variableData = result.content;
      if (variableData) {
        console.log("execute");
        command.execute('custom:open-variable-inspector', {
          variableName,
          variableType,
          variableData
        });
      } else {
        console.error('No data.');
      }
      }catch(err){
        console.error(err);
      }finally{
        setLoading(false);
      }
    }
  };

  console.log(vrb.size, "size");

  return (
    <div>
      <li className="mljar-variable-item">
        <span className="mljar-variable-name">{vrb.name}</span>
        <span className="mljar-variable-type">{vrb.type}</span>
        <span className="mljar-variable-shape">{vrb.shape}</span>
        {
          (allowedTypes.includes(vrb.type) && vrb.dimension <= 2) ? (
            <button
              className="mljar-variable-show-variable-button"
              onClick={() => handleButtonClick(commands, vrb.name, vrb.type)}
              aria-label={`Show details for ${vrb.name}`}
              disabled={vrb.size > 100}
              title={vrb.size > 100 ? "Variable is too big" : ""}

            >
              {loading ? (
                <div className="mljar-variable-spinner" />
                ):
                (
                <detailIcon.react className="mljar-variable-detail-button-icon" />
                )
              }
            </button>
          ) : (
            <span className="mljar-variable-blank">&nbsp;</span>
          )
        }
      </li>
    </div>
  );
};

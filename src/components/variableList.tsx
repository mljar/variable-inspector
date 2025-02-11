import React from 'react';
import { useVariableContext } from '../context/notebookVariableContext';
import { VariableItem } from './variableItem';
import { CommandRegistry } from '@lumino/commands'
import { ILabShell } from '@jupyterlab/application';

interface VariableListProps{
  commands: CommandRegistry;
  labShell: ILabShell;
}

export const VariableList: React.FC<VariableListProps> = ({commands, labShell}) => {
  const { variables, searchTerm, loading } = useVariableContext();

const filteredVariables = variables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
    {
    (loading)? 
    (<div>abc</div>):
    (
    <ul className='mljar-variable-list'>
      <li className='mljar-variable-inspector-header-list'>
        <span className='mljar-variable-header-name'>Name</span>
        <span className='mljar-variable-header-version'>Type</span>
        <span className='mljar-variable-header-version'>Shape</span>
        <span className='mljar-variable-header-blank'>Value</span>
      </li>
      {filteredVariables.map((variable, index) => (
        <VariableItem
          key={index}
          vrb={{
            name: variable.name,
            type: variable.type,
            shape: variable.shape || 'N/A',
            dimension: variable.dimension,
            size: variable.size,
            value: variable.value,
          }}
          commands={commands}
          labShell={labShell}
        />
      ))}
    </ul>
    )
  }
  </div>
  );
};

import React from 'react';
import { useVariableContext } from '../context/notebookVariableContext';
import { VariableItem } from './variableItem';
import { CommandRegistry } from '@lumino/commands'

interface VariableListProps{
  commands: CommandRegistry;
}

export const VariableList: React.FC<VariableListProps> = ({commands}) => {
  const { variables, searchTerm } = useVariableContext();

const filteredVariables = variables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ul className='mljar-variable-list'>
      <li className='mljar-variable-header-list'>
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
            dimension: variable.dimension
          }}
          commands={commands}
        />
      ))}
    </ul>
  );
};

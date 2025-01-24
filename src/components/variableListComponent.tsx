import React from 'react';
import { VariableList } from './variableList';


export const VariableListComponent: React.FC = () => {


  return (
      <div className="mljar-variable-container">
        <div className="mljar-variable-header-container">
          <h3 className="mljar-variable-header">Variable Inspector</h3>
          <VariableList/>
        </div>
      </div>
  );
};

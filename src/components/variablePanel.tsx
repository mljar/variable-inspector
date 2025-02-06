import React from 'react';

interface VariablePanelProps {
  variableName: string;
  variableType: string;
}

export const VariablePanel: React.FC<VariablePanelProps> = ({variableName, variableType}) => {
  return (
    <div style={{ padding: '10px', fontSize: '16px' }}>
      {variableName}
      {variableType}
    </div>
  );
};


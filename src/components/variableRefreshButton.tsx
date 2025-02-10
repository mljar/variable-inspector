import { refreshIcon } from "../icons/refreshIcon" 
import React from 'react';
import { useVariableContext } from '../context/notebookVariableContext'



export const RefreshButton: React.FC = () => {
  const { refreshVariables } = useVariableContext();

  return (
    <button
      className="mljar-variable-refresh-button"
      onClick={refreshVariables}
      title="Refresh Packages"
    >
      <refreshIcon.react className="mljar-variable-refresh-icon" />
      {'Refresh'}
    </button>
  );
};


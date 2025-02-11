import { refreshIcon } from "../icons/refreshIcon" 
import React from 'react';
import { useVariableContext } from '../context/notebookVariableContext'



export const RefreshButton: React.FC = () => {
  const { refreshVariables, loading } = useVariableContext();

  return (
    <button
      className="mljar-variable-inspector-refresh-button"
      onClick={refreshVariables}
      disabled={loading}
      title="Refresh Variables"
    >
      <refreshIcon.react className="mljar-variable-refresh-icon" />
    </button>
  );
};


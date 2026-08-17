import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotebookLikeWidget } from '../utils/notebookTypes';
import { notebookExecutionRefreshCoordinator } from '../services/notebookExecutionRefreshCoordinator';

interface VariableRefreshContextValue {
  refreshCount: number;
}

const VariableRefreshContext = createContext<VariableRefreshContextValue>({
  refreshCount: 0
});

interface VariableRefreshContextProviderProps {
  children: React.ReactNode;
  notebookPanel?: NotebookLikeWidget;
}

export const VariableRefreshContextProvider: React.FC<
  VariableRefreshContextProviderProps
> = ({ children, notebookPanel }) => {
  const [refreshCount, setRefreshCount] = useState<number>(0);

  useEffect(() => {
    if (!notebookPanel) {
      return;
    }

    return notebookExecutionRefreshCoordinator.subscribe(notebookPanel, () => {
      setRefreshCount(prev => prev + 1);
    });
  }, [notebookPanel]);

  return (
    <VariableRefreshContext.Provider value={{ refreshCount }}>
      {children}
    </VariableRefreshContext.Provider>
  );
};

export const useVariableRefeshContext = () =>
  useContext(VariableRefreshContext);

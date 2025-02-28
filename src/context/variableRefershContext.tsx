import { NotebookPanel } from '@jupyterlab/notebook';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { kernelOperationNotifier } from '../utils/kernelOperationNotifier';

interface VariableRefreshContextValue {
  refreshCount: number;
}

const VariableRefreshContext = createContext<VariableRefreshContextValue>({
  refreshCount: 0
});

interface VariableRefreshContextProviderProps {
  children: React.ReactNode;
  notebookPanel?: NotebookPanel | null;
}

export const VariableRefreshContextProvider: React.FC<
  VariableRefreshContextProviderProps
> = ({ children, notebookPanel }) => {
  const [refreshCount, setRefreshCount] = useState<number>(0);

  useEffect(() => {
    if (!notebookPanel) {
      return;
    }

    const kernel = notebookPanel.sessionContext.session?.kernel;
    if (!kernel) {
      return;
    }

    const onSidebarStatusChange = (_sender: any, inProgress: boolean) => {
      if (inProgress === true) {
        setRefreshCount(prev => prev + 1);
      }
    };

    kernelOperationNotifier.sidebarOperationChanged.connect(
      onSidebarStatusChange
    );

    return () => {
      kernelOperationNotifier.sidebarOperationChanged.disconnect(
        onSidebarStatusChange
      );
    };
  }, [notebookPanel]);

  return (
    <VariableRefreshContext.Provider value={{ refreshCount }}>
      {children}
    </VariableRefreshContext.Provider>
  );
};

export const useVariableRefeshContext = () =>
  useContext(VariableRefreshContext);

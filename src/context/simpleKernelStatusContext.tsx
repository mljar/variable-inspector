import { NotebookPanel } from '@jupyterlab/notebook';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { kernelOperationNotifier } from '../utils/kernelOperationNotifier';

interface SimpleKernelIdleWatcherContextValue {
  refreshCount: number;
}

const SimpleKernelIdleWatcherContext = createContext<SimpleKernelIdleWatcherContextValue>({
  refreshCount: 0,
});

interface SimpleKernelIdleWatcherContextProviderProps {
  children: React.ReactNode;
  notebookPanel?: NotebookPanel | null; 
}

export const SimpleKernelIdleWatcherContextProvider: React.FC<SimpleKernelIdleWatcherContextProviderProps> = ({
  children,
  notebookPanel
}) => {
  const [refreshCount, setRefreshCount] = useState<number>(0);

  useEffect(() => {
    if (!notebookPanel) {
      console.log('No notebookPanel');
      return;
    }

    const kernel = notebookPanel.sessionContext.session?.kernel;
    if (!kernel) {
      console.log('No kernel');
      return;
    }

    const onSidebarStatusChange = (_sender: any, inProgress: boolean) => {
    
      if (
        inProgress === true
      ) {
        setRefreshCount(prev => prev + 1);
      }
    };

    kernelOperationNotifier.sidebarOperationChanged.connect(onSidebarStatusChange);

    return () => {
      kernelOperationNotifier.sidebarOperationChanged.disconnect(onSidebarStatusChange);
    };
  }, [notebookPanel]);

  // const withIgnoredKernelUpdates = async <T,>(fn: () => Promise<T>): Promise<T> => {
  //   ignoreKernelUpdatesRef.current = true;
  //   try {
  //     return await fn();
  //   } finally {
  //     ignoreKernelUpdatesRef.current = false;
  //   }
  // };

  return (
    <SimpleKernelIdleWatcherContext.Provider value={{ refreshCount }}>
      {children}
    </SimpleKernelIdleWatcherContext.Provider>
  );
};

export const useSimpleKernelIdleWatcherContext = () =>
  useContext(SimpleKernelIdleWatcherContext);

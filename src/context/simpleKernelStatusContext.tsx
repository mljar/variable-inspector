import { NotebookPanel } from '@jupyterlab/notebook';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  const prevStatus = useRef<string | null>(null);

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

    const onKernelStatusChange = (_sender: any, status: string) => {
      if (kernelOperationNotifier.inProgress) {
        return;
      }
      if (status === 'idle' && prevStatus.current !== 'idle') {
        setRefreshCount(prev => prev + 1);
      }
      prevStatus.current = status;
    };

    kernel.statusChanged.connect(onKernelStatusChange);

    return () => {
      kernel.statusChanged.disconnect(onKernelStatusChange);
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
